import { NextResponse, type NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { getRazorpayPayment, verifyRazorpayPaymentSignature } from "@/lib/razorpay";
import { razorpayVerifySchema } from "@/lib/validators/registration";
import Registration from "@/models/Registration";
import { recordCapturedRazorpayPayment } from "@/lib/registration-payment";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = razorpayVerifySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid payment response" }, { status: 400 });
  const data = parsed.data;
  await connectDB();
  const registration = await Registration.findById(data.registrationId);
  if (!registration || registration.paymentMode !== "razorpay" || registration.razorpayOrderId !== data.razorpay_order_id) {
    return NextResponse.json({ error: "Payment order not found" }, { status: 404 });
  }
  if (!verifyRazorpayPaymentSignature(registration.razorpayOrderId, data.razorpay_payment_id, data.razorpay_signature)) {
    return NextResponse.json({ error: "Payment signature could not be verified" }, { status: 400 });
  }

  try {
    const payment = await getRazorpayPayment(data.razorpay_payment_id);
    if (payment.order_id !== registration.razorpayOrderId || payment.currency !== "INR" || payment.amount < registration.feeAmount * 100) {
      console.error("[razorpay] verify amount/currency mismatch:", {
        registrationId: registration._id.toString(),
        orderId: registration.razorpayOrderId,
        paymentId: payment.id,
        receivedOrderId: payment.order_id,
        receivedAmount: payment.amount,
        receivedCurrency: payment.currency,
        expectedAmount: registration.feeAmount * 100,
      });
      return NextResponse.json({ error: "Payment details do not match this registration" }, { status: 400 });
    }
    if (payment.status === "captured") {
      await recordCapturedRazorpayPayment(payment, request);
      const confirmed = await Registration.findById(registration._id).select("registrationCode").lean();
      return NextResponse.json({ ok: true, captured: true, registrationCode: confirmed?.registrationCode ?? null });
    }
    await Registration.updateOne(
      { _id: registration._id, status: { $ne: "approved" } },
      { $set: { razorpayPaymentId: payment.id, transactionNumber: payment.id, paymentMethod: payment.method, paymentStatus: payment.status } }
    );
    return NextResponse.json({ ok: true, captured: false, registrationCode: null });
  } catch (error) {
    console.error("[razorpay] payment verification failed:", error);
    return NextResponse.json({ error: "We could not verify the payment yet. Your payment status will update automatically." }, { status: 502 });
  }
}
