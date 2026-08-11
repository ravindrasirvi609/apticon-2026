import { NextResponse, type NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { generateRegistrationCode } from "@/lib/registration-code";
import { calculateFeeWithGst, currentFeeAmount } from "@/lib/registration-fees";
import { createRazorpayOrder } from "@/lib/razorpay";
import { publicUrl } from "@/lib/r2";
import { APTI_MEMBER_CATEGORIES, razorpayOrderSchema } from "@/lib/validators/registration";
import Registration from "@/models/Registration";
import { getClientIp } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { linkFromRegistration } from "@/lib/sync";
import { logAudit } from "@/lib/audit";
import { verifyAptiMember } from "@/lib/apti-membership";

// Creates the local registration and its Razorpay Order. The amount is always derived server-side.
export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const limit = rateLimit(`razorpay-order:${ip}`, 5, 60 * 60_000);
  if (!limit.ok) return NextResponse.json({ error: "Too many payment attempts. Please retry in an hour." }, { status: 429 });

  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    return NextResponse.json({ error: "Online payments are not configured yet. Please contact the organiser." }, { status: 503 });
  }

  const body = await request.json().catch(() => null);
  const parsed = razorpayOrderSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  const data = parsed.data;

  if (APTI_MEMBER_CATEGORIES.includes(data.category as (typeof APTI_MEMBER_CATEGORIES)[number])) {
    const check = await verifyAptiMember(data.aptiMemberId!, data.email);
    if (!check.valid) {
      return NextResponse.json(
        {
          error: `We couldn't verify APTI Membership ID "${data.aptiMemberId}". Please double-check it, or select "Non-Member" if you're not currently an APTI member.`,
        },
        { status: 400 }
      );
    }
  }

  const { tier, amount: baseAmount } = currentFeeAmount(data.category);
  const { gstAmount, totalAmount } = calculateFeeWithGst(baseAmount);

  await connectDB();
  const registrationCode = await generateRegistrationCode(data.category);

  const registration = await Registration.create({
    registrationCode,
    fullName: data.fullName,
    designation: data.designation,
    institution: data.institution,
    city: data.city,
    state: data.state,
    email: data.email,
    phone: data.phone,
    photoKey: data.photoKey,
    photoUrl: publicUrl(data.photoKey),
    photoName: data.photoName,
    category: data.category,
    feeTier: tier,
    feeAmount: totalAmount,
    willSubmitAbstract: data.willSubmitAbstract,
    includesAptiMembership: data.category === "APTI Membership + APTICON Registration",
    aptiMemberId: data.aptiMemberId,
    paymentMode: "razorpay",
    paymentStatus: "pending",
    status: "submitted",
    remarks: data.remarks,
  });

  try {
    const order = await createRazorpayOrder({
      amount: totalAmount * 100,
      receipt: registrationCode,
      notes: { registrationId: registration._id.toString(), registrationCode, email: data.email },
    });
    registration.razorpayOrderId = order.id;
    await registration.save();

    const linkResult = await linkFromRegistration(registration._id, data.email, request);
    await logAudit({
      actorRole: "public",
      action: "payment.razorpay.order_created",
      resourceType: "registration",
      resourceId: registration._id.toString(),
      details: { registrationCode, razorpayOrderId: order.id, category: data.category, feeTier: tier, feeAmount: totalAmount, baseAmount, gstAmount, linkedAbstract: linkResult.abstractId ?? null },
      request,
    });

    return NextResponse.json({
      registrationId: registration._id.toString(),
      registrationCode,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID,
      feeAmount: totalAmount,
    });
  } catch (error) {
    await Registration.deleteOne({ _id: registration._id, razorpayOrderId: { $exists: false } });
    console.error("[razorpay] order creation failed:", error);
    return NextResponse.json({ error: "Unable to start payment. Please try again." }, { status: 502 });
  }
}
