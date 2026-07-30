import Registration from "@/models/Registration";
import { logAudit } from "@/lib/audit";
import { sendMail, registrationApprovedEmail } from "@/lib/email";
import type { RazorpayPayment } from "@/lib/razorpay";

/** Marks a captured Razorpay payment as fulfilled exactly once. */
export async function recordCapturedRazorpayPayment(payment: RazorpayPayment, request: Request) {
  const reg = await Registration.findOneAndUpdate(
    { razorpayOrderId: payment.order_id, status: { $ne: "approved" } },
    {
      $set: {
        status: "approved",
        paymentStatus: "captured",
        razorpayPaymentId: payment.id,
        transactionNumber: payment.id,
        paymentMethod: payment.method,
        paidAt: new Date(),
        approvedAt: new Date(),
      },
      $unset: { rejectedBy: 1, rejectedAt: 1, reviewNote: 1 },
    },
    { new: true }
  );
  if (!reg) return null;

  await logAudit({
    actorRole: "system",
    action: "payment.razorpay.captured",
    resourceType: "registration",
    resourceId: reg._id.toString(),
    details: { registrationCode: reg.registrationCode, razorpayOrderId: payment.order_id, razorpayPaymentId: payment.id, amount: payment.amount },
    request,
  });
  const { subject, html } = registrationApprovedEmail(reg.fullName, reg.registrationCode, reg.feeAmount, !!reg.linkedAbstract);
  await sendMail({ to: reg.email, subject, html });
  return reg;
}
