import { NextResponse, type NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { verifyRazorpayWebhookSignature, type RazorpayPayment } from "@/lib/razorpay";
import Registration from "@/models/Registration";
import GroupRegistration from "@/models/GroupRegistration";
import { recordCapturedRazorpayPayment, recordCapturedGroupRazorpayPayment } from "@/lib/registration-payment";

type RazorpayWebhook = { event?: string; payload?: { payment?: { entity?: RazorpayPayment } } };

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  if (!verifyRazorpayWebhookSignature(rawBody, request.headers.get("x-razorpay-signature"))) {
    console.error("[razorpay] webhook signature invalid");
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
  }
  const webhook = JSON.parse(rawBody) as RazorpayWebhook;
  const payment = webhook.payload?.payment?.entity;
  if (!payment?.order_id || !payment.id) return NextResponse.json({ ok: true });

  try {
    await connectDB();
    if (webhook.event === "payment.captured") {
      const registration = await Registration.findOne({ razorpayOrderId: payment.order_id });
<<<<<<< HEAD
      if (registration) {
        // Only an actual shortfall is refused — a gateway surcharge on top of the expected fee still confirms.
        if (payment.amount < registration.feeAmount * 100 || payment.currency !== "INR") {
          console.error("[razorpay] webhook payment does not match a registration:", {
            orderId: payment.order_id,
            paymentId: payment.id,
            receivedAmount: payment.amount,
            receivedCurrency: payment.currency,
            expectedAmount: registration.feeAmount * 100,
            registrationId: registration._id.toString(),
          });
          return NextResponse.json({ error: "Payment does not match a registration" }, { status: 400 });
        }
        await recordCapturedRazorpayPayment(payment, request);
      } else {
        // No individual registration for this order — it may be a group order instead, which
        // has no other server-side backstop if the coordinator's browser drops the verify call.
        const group = await GroupRegistration.findOne({ razorpayOrderId: payment.order_id });
        if (!group || payment.amount < group.feeAmount * 100 || payment.currency !== "INR") {
          console.error("[razorpay] webhook payment does not match a registration or group:", {
            orderId: payment.order_id,
            paymentId: payment.id,
            receivedAmount: payment.amount,
            receivedCurrency: payment.currency,
            expectedAmount: group ? group.feeAmount * 100 : null,
            groupRegistrationId: group?._id.toString() ?? null,
          });
          return NextResponse.json({ error: "Payment does not match a registration" }, { status: 400 });
        }
        await recordCapturedGroupRazorpayPayment(payment, request);
      }
    } else if (webhook.event === "payment.authorized" || webhook.event === "payment.failed" || webhook.event === "payment.refunded") {
      const status = webhook.event === "payment.authorized" ? "authorized" : webhook.event === "payment.failed" ? "failed" : "refunded";
      const regResult = await Registration.updateOne(
        { razorpayOrderId: payment.order_id, status: { $ne: "approved" } },
        { $set: { razorpayPaymentId: payment.id, transactionNumber: payment.id, paymentMethod: payment.method, paymentStatus: status } }
      );
      if (regResult.matchedCount === 0) {
        await GroupRegistration.updateOne(
          { razorpayOrderId: payment.order_id, status: { $ne: "approved" } },
          { $set: { razorpayPaymentId: payment.id, paymentMethod: payment.method, paymentStatus: status } }
        );
      }
=======
      if (!registration || payment.amount !== registration.feeAmount * 100 || payment.currency !== "INR") {
        console.error("[razorpay] webhook payment does not match a registration:", {
          orderId: payment.order_id,
          paymentId: payment.id,
          receivedAmount: payment.amount,
          receivedCurrency: payment.currency,
          expectedAmount: registration ? registration.feeAmount * 100 : null,
          registrationId: registration?._id.toString() ?? null,
        });
        return NextResponse.json({ error: "Payment does not match a registration" }, { status: 400 });
      }
      await recordCapturedRazorpayPayment(payment, request);
    } else if (webhook.event === "payment.authorized" || webhook.event === "payment.failed" || webhook.event === "payment.refunded") {
      const status = webhook.event === "payment.authorized" ? "authorized" : webhook.event === "payment.failed" ? "failed" : "refunded";
      await Registration.updateOne(
        { razorpayOrderId: payment.order_id, status: { $ne: "approved" } },
        { $set: { razorpayPaymentId: payment.id, transactionNumber: payment.id, paymentMethod: payment.method, paymentStatus: status } }
      );
>>>>>>> e4fbbe2 (feat: add manual confirmation functionality for individual registrations)
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[razorpay] webhook processing failed:", { event: webhook.event, orderId: payment.order_id, paymentId: payment.id }, error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
