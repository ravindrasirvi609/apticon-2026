import { NextResponse, type NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { getRazorpayPayment, verifyRazorpayPaymentSignature } from "@/lib/razorpay";
import { groupRazorpayVerifySchema } from "@/lib/validators/group-registration";
import GroupRegistration from "@/models/GroupRegistration";
import { sendMail, groupRegistrationSubmittedEmail } from "@/lib/email";
import { logAudit } from "@/lib/audit";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = groupRazorpayVerifySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid payment response" }, { status: 400 });
  const data = parsed.data;
  await connectDB();
  const group = await GroupRegistration.findById(data.groupRegistrationId);
  if (!group || group.paymentMode !== "razorpay" || group.razorpayOrderId !== data.razorpay_order_id) {
    return NextResponse.json({ error: "Payment order not found" }, { status: 404 });
  }
  if (!verifyRazorpayPaymentSignature(group.razorpayOrderId, data.razorpay_payment_id, data.razorpay_signature)) {
    return NextResponse.json({ error: "Payment signature could not be verified" }, { status: 400 });
  }

  try {
    const payment = await getRazorpayPayment(data.razorpay_payment_id);
    if (payment.order_id !== group.razorpayOrderId || payment.currency !== "INR" || payment.amount !== group.feeAmount * 100) {
      return NextResponse.json({ error: "Payment details do not match this group registration" }, { status: 400 });
    }

    if (payment.status === "captured") {
      const updated = await GroupRegistration.findOneAndUpdate(
        { _id: group._id, status: "submitted" },
        {
          $set: {
            status: "payment_review",
            paymentStatus: "captured",
            razorpayPaymentId: payment.id,
            paymentMethod: payment.method,
            paidAt: new Date(),
          },
        },
        { new: true }
      );
      if (updated) {
        await logAudit({
          actorRole: "public",
          action: "group_registration.payment_captured",
          resourceType: "group_registration",
          resourceId: group._id.toString(),
          details: { groupCode: group.groupCode, razorpayOrderId: group.razorpayOrderId, razorpayPaymentId: payment.id, amount: payment.amount },
          request,
        });
        const { subject, html } = groupRegistrationSubmittedEmail(updated.coordinatorName, updated.groupCode, updated.delegateCount, updated.complimentaryCount, updated.feeAmount);
        await sendMail({ to: updated.coordinatorEmail, subject, html });
      }
      return NextResponse.json({ ok: true, captured: true, groupCode: group.groupCode });
    }

    await GroupRegistration.updateOne(
      { _id: group._id, status: "submitted" },
      { $set: { razorpayPaymentId: payment.id, paymentMethod: payment.method, paymentStatus: payment.status } }
    );
    return NextResponse.json({ ok: true, captured: false, groupCode: group.groupCode });
  } catch (error) {
    console.error("[razorpay] group payment verification failed:", error);
    return NextResponse.json({ error: "We could not verify the payment yet. Your payment status will update automatically." }, { status: 502 });
  }
}
