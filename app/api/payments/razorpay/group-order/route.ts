import { NextResponse, type NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { generateGroupRegistrationCode } from "@/lib/submission-code";
import { calculateFeeWithGst, currentGroupFeeAmount } from "@/lib/registration-fees";
import { createRazorpayOrder } from "@/lib/razorpay";
import { publicUrl } from "@/lib/r2";
import { groupRazorpayOrderSchema } from "@/lib/validators/group-registration";
import GroupRegistration from "@/models/GroupRegistration";
import { getClientIp } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { logAudit } from "@/lib/audit";

// Creates the GroupRegistration and its Razorpay order. The amount is always derived
// server-side from delegateCount + category, same discipline as the individual-order route.
export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const limit = rateLimit(`razorpay-group-order:${ip}`, 3, 60 * 60_000);
  if (!limit.ok) return NextResponse.json({ error: "Too many group registration attempts. Please retry in an hour." }, { status: 429 });

  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    return NextResponse.json({ error: "Online payments are not configured yet. Please contact the organiser." }, { status: 503 });
  }

  const body = await request.json().catch(() => null);
  const parsed = groupRazorpayOrderSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  const data = parsed.data;

  const delegateCount = data.delegates.length;
  const { tier, complimentaryCount, baseAmount } = currentGroupFeeAmount(data.category, delegateCount);
  const { totalAmount } = calculateFeeWithGst(baseAmount);

  await connectDB();
  let groupCode = generateGroupRegistrationCode();
  for (let i = 0; i < 5; i++) {
    if (!(await GroupRegistration.exists({ groupCode }))) break;
    groupCode = generateGroupRegistrationCode();
  }

  // Which delegate(s) are complimentary is arbitrary bookkeeping (the whole group shares one
  // fee) — mark the last entries in the submitted list so it's deterministic.
  const delegates = data.delegates.map((d, i) => ({
    name: d.name,
    designation: d.designation,
    email: d.email,
    phone: d.phone,
    photoKey: d.photoKey,
    photoUrl: publicUrl(d.photoKey),
    photoName: d.photoName,
    isComplimentary: i >= delegateCount - complimentaryCount,
  }));

  const group = await GroupRegistration.create({
    groupCode,
    coordinatorName: data.coordinatorName,
    coordinatorEmail: data.coordinatorEmail,
    coordinatorPhone: data.coordinatorPhone,
    institution: data.institution,
    city: data.city,
    state: data.state,
    category: data.category,
    delegates,
    delegateCount,
    complimentaryCount,
    feeTier: tier,
    baseFeeAmount: baseAmount,
    feeAmount: totalAmount,
    paymentMode: "razorpay",
    paymentStatus: "pending",
    status: "submitted",
  });

  try {
    const order = await createRazorpayOrder({
      amount: totalAmount * 100,
      receipt: groupCode,
      notes: { groupRegistrationId: group._id.toString(), groupCode, delegateCount: String(delegateCount), email: data.coordinatorEmail },
    });
    group.razorpayOrderId = order.id;
    await group.save();

    await logAudit({
      actorRole: "public",
      action: "group_registration.order_created",
      resourceType: "group_registration",
      resourceId: group._id.toString(),
      details: { groupCode, delegateCount, complimentaryCount, category: data.category, feeTier: tier, feeAmount: totalAmount, razorpayOrderId: order.id },
      request,
    });

    return NextResponse.json({
      groupRegistrationId: group._id.toString(),
      groupCode,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID,
      feeAmount: totalAmount,
    });
  } catch (error) {
    await GroupRegistration.deleteOne({ _id: group._id, razorpayOrderId: { $exists: false } });
    console.error("[razorpay] group order creation failed:", error);
    return NextResponse.json({ error: "Unable to start payment. Please try again." }, { status: 502 });
  }
}
