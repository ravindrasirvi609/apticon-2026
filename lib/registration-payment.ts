import Registration, { type IRegistration } from "@/models/Registration";
import { logAudit } from "@/lib/audit";
import { sendMail, registrationApprovedEmail } from "@/lib/email";
import { getRazorpayOrderPayments, type RazorpayPayment } from "@/lib/razorpay";

/** Who triggered a payment update — the gateway itself, or a console user re-checking it. */
export interface PaymentActor {
  uid?: string | null;
  role: "system" | "super_admin" | "reviewer" | "editorial" | "public";
}

const SYSTEM_ACTOR: PaymentActor = { role: "system" };

/** Marks a captured Razorpay payment as fulfilled exactly once. */
export async function recordCapturedRazorpayPayment(
  payment: RazorpayPayment,
  request: Request,
  actor: PaymentActor = SYSTEM_ACTOR
) {
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
      $unset: { rejectedBy: 1, rejectedAt: 1, reviewNote: 1, paymentError: 1 },
    },
    { new: true }
  );
  if (!reg) return null;

  await logAudit({
    actor: actor.uid ?? null,
    actorRole: actor.role,
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

export type PaymentSyncOutcome =
  /** A matching captured payment was found and the registration is now approved. */
  | "captured"
  /** Already approved before this sync ran — nothing to do. */
  | "already_approved"
  /** An attempt exists but is not a clean capture; its status was copied across. */
  | "updated"
  /** Razorpay has no payment attempt for this order at all. */
  | "no_payments";

export interface PaymentSyncResult {
  outcome: PaymentSyncOutcome;
  paymentStatus?: RazorpayPayment["status"];
  paymentError?: string;
}

function newest(items: RazorpayPayment[]): RazorpayPayment {
  return items.reduce((latest, item) => ((item.created_at ?? 0) >= (latest.created_at ?? 0) ? item : latest));
}

/**
 * Re-reads the truth from Razorpay and applies it. Used when a webhook was missed or the
 * delegate abandoned checkout — it never approves on its own authority, only on a capture
 * that Razorpay confirms for the right amount.
 */
export async function syncRazorpayRegistration(
  registration: IRegistration,
  request: Request,
  actor: PaymentActor
): Promise<PaymentSyncResult> {
  const orderId = registration.razorpayOrderId!;
  const expectedAmount = registration.feeAmount * 100;
  const { items } = await getRazorpayOrderPayments(orderId);

  let result: PaymentSyncResult;

  if (items.length === 0) {
    result = { outcome: "no_payments" };
  } else {
    const captured = items.find((p) => p.status === "captured");
    const matches = captured && captured.currency === "INR" && captured.amount === expectedAmount;

    if (captured && matches) {
      const reg = await recordCapturedRazorpayPayment(captured, request, actor);
      result = { outcome: reg ? "captured" : "already_approved", paymentStatus: "captured" };
    } else {
      const latest = captured ?? newest(items);
      // A capture we refuse to honour is the most important thing to surface to an admin.
      const paymentError = captured
        ? `Captured payment ${captured.id} does not match this registration (received ${captured.amount / 100} ${captured.currency}, expected ${registration.feeAmount} INR). Not approved automatically.`
        : latest.error_description ?? undefined;

      await Registration.updateOne(
        { _id: registration._id, status: { $ne: "approved" } },
        {
          $set: {
            razorpayPaymentId: latest.id,
            transactionNumber: latest.id,
            paymentMethod: latest.method,
            paymentStatus: latest.status === "created" ? "pending" : latest.status,
            ...(paymentError ? { paymentError } : {}),
          },
          ...(paymentError ? {} : { $unset: { paymentError: 1 } }),
        }
      );
      result = { outcome: "updated", paymentStatus: latest.status, paymentError };
    }
  }

  await logAudit({
    actor: actor.uid ?? null,
    actorRole: actor.role,
    action: "payment.razorpay.synced",
    resourceType: "registration",
    resourceId: registration._id.toString(),
    details: {
      registrationCode: registration.registrationCode,
      razorpayOrderId: orderId,
      attempts: items.length,
      outcome: result.outcome,
      paymentStatus: result.paymentStatus ?? null,
    },
    request,
  });

  return result;
}
