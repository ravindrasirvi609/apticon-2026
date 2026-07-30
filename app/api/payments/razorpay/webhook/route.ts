import { NextResponse, type NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { verifyRazorpayWebhookSignature, type RazorpayPayment } from "@/lib/razorpay";
import Registration from "@/models/Registration";
import { recordCapturedRazorpayPayment } from "@/lib/registration-payment";

type RazorpayWebhook = { event?: string; payload?: { payment?: { entity?: RazorpayPayment } } };

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  if (!verifyRazorpayWebhookSignature(rawBody, request.headers.get("x-razorpay-signature"))) {
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
  }
  const webhook = JSON.parse(rawBody) as RazorpayWebhook;
  const payment = webhook.payload?.payment?.entity;
  if (!payment?.order_id || !payment.id) return NextResponse.json({ ok: true });

  await connectDB();
  if (webhook.event === "payment.captured") {
    const registration = await Registration.findOne({ razorpayOrderId: payment.order_id });
    if (!registration || payment.amount !== registration.feeAmount * 100 || payment.currency !== "INR") {
      return NextResponse.json({ error: "Payment does not match a registration" }, { status: 400 });
    }
    await recordCapturedRazorpayPayment(payment, request);
  } else if (webhook.event === "payment.authorized" || webhook.event === "payment.failed" || webhook.event === "payment.refunded") {
    const status = webhook.event === "payment.authorized" ? "authorized" : webhook.event === "payment.failed" ? "failed" : "refunded";
    await Registration.updateOne(
      { razorpayOrderId: payment.order_id, status: { $ne: "approved" } },
      { $set: { razorpayPaymentId: payment.id, transactionNumber: payment.id, paymentMethod: payment.method, paymentStatus: status } }
    );
  }
  return NextResponse.json({ ok: true });
}
