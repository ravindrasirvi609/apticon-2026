import { NextResponse, type NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import {
  getRazorpayPayment,
  verifyRazorpayPaymentSignature,
} from "@/lib/razorpay";
import { groupRazorpayVerifySchema } from "@/lib/validators/group-registration";
import GroupRegistration from "@/models/GroupRegistration";
import { recordCapturedGroupRazorpayPayment } from "@/lib/registration-payment";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = groupRazorpayVerifySchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json(
      { error: "Invalid payment response" },
      { status: 400 },
    );
  const data = parsed.data;
  await connectDB();
  const group = await GroupRegistration.findById(data.groupRegistrationId);
  if (
    !group ||
    group.paymentMode !== "razorpay" ||
    group.razorpayOrderId !== data.razorpay_order_id
  ) {
    return NextResponse.json(
      { error: "Payment order not found" },
      { status: 404 },
    );
  }
  if (
    !verifyRazorpayPaymentSignature(
      group.razorpayOrderId,
      data.razorpay_payment_id,
      data.razorpay_signature,
    )
  ) {
    return NextResponse.json(
      { error: "Payment signature could not be verified" },
      { status: 400 },
    );
  }

  try {
    const payment = await getRazorpayPayment(data.razorpay_payment_id);
    // Only an actual shortfall is refused — a gateway surcharge on top of the expected fee still confirms.
    if (
      payment.order_id !== group.razorpayOrderId ||
      payment.currency !== "INR" ||
      payment.amount < group.feeAmount * 100
    ) {
      console.error("[razorpay] group verify amount/currency mismatch:", {
        groupRegistrationId: group._id.toString(),
        orderId: group.razorpayOrderId,
        paymentId: payment.id,
        receivedOrderId: payment.order_id,
        receivedAmount: payment.amount,
        receivedCurrency: payment.currency,
        expectedAmount: group.feeAmount * 100,
      });
      await GroupRegistration.updateOne(
        { _id: group._id, status: { $ne: "approved" } },
        {
          $set: {
            paymentError: `Payment ${payment.id} does not match this group registration (received ${payment.amount / 100} ${payment.currency}, expected ${group.feeAmount} INR). Not approved automatically.`,
          },
        },
      );
      return NextResponse.json(
        { error: "Payment details do not match this group registration" },
        { status: 400 },
      );
    }

    if (payment.status === "captured") {
      const updated = await recordCapturedGroupRazorpayPayment(
        payment,
        request,
      );
      return NextResponse.json({
        ok: true,
        captured: !!updated,
        groupCode: group.groupCode,
      });
    }

    await GroupRegistration.updateOne(
      { _id: group._id, status: { $ne: "approved" } },
      {
        $set: {
          razorpayPaymentId: payment.id,
          paymentMethod: payment.method,
          paymentStatus: payment.status,
        },
      },
    );
    return NextResponse.json({
      ok: true,
      captured: false,
      groupCode: group.groupCode,
    });
  } catch (error) {
    console.error("[razorpay] group payment verification failed:", error);
    return NextResponse.json(
      {
        error:
          "We could not verify the payment yet. Your payment status will update automatically.",
      },
      { status: 502 },
    );
  }
}
