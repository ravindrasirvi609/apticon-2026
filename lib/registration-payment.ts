import Registration, { type IRegistration } from "@/models/Registration";
import GroupRegistration, { type IGroupRegistration } from "@/models/GroupRegistration";
import { logAudit } from "@/lib/audit";
import { sendMail, registrationApprovedEmail, groupRegistrationApprovedEmail } from "@/lib/email";
import { getRazorpayOrderPayments, type RazorpayPayment } from "@/lib/razorpay";
import { generateRegistrationCode } from "@/lib/registration-code";
import { sendWhatsAppNotification } from "@/lib/whatsapp";
import { sendRegistrationWebhook } from "@/lib/registration-webhook";

/** Who triggered a payment update — the gateway itself, or a console user re-checking it. */
export interface PaymentActor {
  uid?: string | null;
  role: "system" | "super_admin" | "reviewer" | "editorial" | "public";
}

const SYSTEM_ACTOR: PaymentActor = { role: "system" };

/**
 * Marks a captured Razorpay payment as fulfilled. Approval + code assignment happens exactly
 * once, but the email send is retried independently of that: if a prior call approved the
 * registration but the email itself failed (Resend error, network blip), calling this again
 * skips straight to retrying just the email — it never re-approves and never re-emails someone
 * who already received it.
 */
export async function recordCapturedRazorpayPayment(
  payment: RazorpayPayment,
  request: Request,
  actor: PaymentActor = SYSTEM_ACTOR
) {
  const pendingRegistration = await Registration.findOne({ razorpayOrderId: payment.order_id }).select("category").lean();
  if (!pendingRegistration) return null;
  const registrationCode = await generateRegistrationCode(pendingRegistration.category);
  const justApproved = await Registration.findOneAndUpdate(
    { razorpayOrderId: payment.order_id, status: { $ne: "approved" }, registrationCode: { $exists: false } },
    {
      $set: {
        status: "approved",
        paymentStatus: "captured",
        razorpayPaymentId: payment.id,
        transactionNumber: payment.id,
        paymentMethod: payment.method,
        paidAt: new Date(),
        approvedAt: new Date(),
        registrationCode,
      },
      $unset: { rejectedBy: 1, rejectedAt: 1, reviewNote: 1, paymentError: 1 },
    },
    { new: true }
  );
  const reg = justApproved ?? (await Registration.findOne({ razorpayOrderId: payment.order_id, status: "approved" }));
  if (!reg) return null;
  console.info("[registration] payment capture handled", { registrationId: reg._id.toString(), newlyApproved: !!justApproved, registrationCode: reg.registrationCode });

<<<<<<< HEAD
  if (justApproved) {
    await logAudit({
      actor: actor.uid ?? null,
      actorRole: actor.role,
      action: "payment.razorpay.captured",
      resourceType: "registration",
      resourceId: reg._id.toString(),
      details: { registrationCode: reg.registrationCode, razorpayOrderId: payment.order_id, razorpayPaymentId: payment.id, amount: payment.amount, expectedAmount: reg.feeAmount * 100 },
      request,
    });
  }

  if (!reg.confirmationEmailSentAt) {
    const { subject, html, attachments } = await registrationApprovedEmail(reg.fullName, reg.registrationCode, reg.feeAmount, !!reg.linkedAbstract);
    await sendMail({ to: reg.email, subject, html, attachments });
    await Registration.updateOne({ _id: reg._id }, { $set: { confirmationEmailSentAt: new Date() } });
    await sendWhatsAppNotification(reg.phone, "registration_approved", [reg.fullName, reg.registrationCode], `registration-approved-${reg._id.toString()}`);
  }
  await logAudit({
    actor: actor.uid ?? null,
    actorRole: actor.role,
    action: "payment.razorpay.captured",
    resourceType: "registration",
    resourceId: reg._id.toString(),
    details: { registrationCode: reg.registrationCode, razorpayOrderId: payment.order_id, razorpayPaymentId: payment.id, amount: payment.amount },
    request,
  });
  const { subject, html, attachments } = await registrationApprovedEmail(reg.fullName, reg.registrationCode, reg.feeAmount, !!reg.linkedAbstract);
  await sendMail({ to: reg.email, subject, html, attachments });
  await sendRegistrationWebhook(reg.fullName, reg.phone);
  await sendWhatsAppNotification(reg.phone, "registration_approved", [reg.fullName, reg.registrationCode], reg._id.toString());
  return reg;
}

export interface GroupCaptureResult {
  /** True only on the call that actually flipped the group to "approved" — guards the one-time coordinator email/audit log. */
  newlyApproved: boolean;
  /** Delegates created + emailed on THIS call — non-zero even on a retry that only picks up stragglers. */
  delegatesProcessed: number;
}

/**
 * Marks a captured Razorpay payment for a GROUP order as fulfilled — creates one Registration
 * per delegate. Safe to call again on the same order: a delegate whose registration exists AND
 * whose email is confirmed sent is skipped; a delegate whose registration exists but whose email
 * previously failed gets ONLY the email retried (same code, no duplicate registration); a
 * delegate with neither gets both created. One delegate's failure never blocks the rest, and a
 * re-run (e.g. an admin's "Sync from Razorpay") always picks up exactly whoever is still missing.
 */
export async function recordCapturedGroupRazorpayPayment(
  payment: RazorpayPayment,
  request: Request,
  actor: PaymentActor = SYSTEM_ACTOR
): Promise<GroupCaptureResult | null> {
  const justApproved = await GroupRegistration.findOneAndUpdate(
    { razorpayOrderId: payment.order_id, status: { $ne: "approved" } },
    {
      $set: { status: "approved", paymentStatus: "captured", razorpayPaymentId: payment.id, paymentMethod: payment.method, paidAt: new Date() },
      $unset: { paymentError: 1 },
    },
    { new: true }
  );
  const group = justApproved ?? (await GroupRegistration.findOne({ razorpayOrderId: payment.order_id, status: "approved" }));
  if (!group) return null;
  console.info("[group-registration] payment capture handled", { groupRegistrationId: group._id.toString(), groupCode: group.groupCode, newlyApproved: !!justApproved, participantCount: group.delegates.length + 1 });

  const paidCount = group.delegateCount - group.complimentaryCount;
  const perHeadShare = paidCount > 0 ? Math.round(group.feeAmount / paidCount) : 0;

  const existing = await Registration.find({ groupRegistration: group._id })
    .select("email fullName registrationCode feeAmount confirmationEmailSentAt")
    .lean();
  const byEmail = new Map(existing.map((r) => [r.email, r]));
  let delegatesProcessed = 0;

  for (const delegate of group.delegates) {
    const already = byEmail.get(delegate.email);
    if (already?.confirmationEmailSentAt) { console.info("[group-registration] participant skipped", { groupCode: group.groupCode, reason: "email_already_sent" }); continue; }
    try {
      let reg = already;
      if (!reg) {
        const registrationCode = await generateRegistrationCode(group.category);
        reg = await Registration.create({
          registrationCode,
          fullName: delegate.name,
          designation: delegate.designation,
          institution: group.institution,
          affiliation: delegate.affiliation,
          city: group.city,
          state: group.state,
          email: delegate.email,
          phone: delegate.phone,
          photoKey: delegate.photoKey,
          photoUrl: delegate.photoUrl,
          photoName: delegate.photoName,
          aptiMemberId: delegate.isAptiMember ? delegate.aptiMemberId : undefined,
          includesAptiMembership: delegate.isAptiMember,
          category: group.category,
          feeTier: group.feeTier,
          feeAmount: delegate.isComplimentary ? 0 : perHeadShare,
          willSubmitAbstract: false,
          paymentMode: "razorpay",
          paymentStatus: "captured",
          razorpayOrderId: group.razorpayOrderId,
          razorpayPaymentId: group.razorpayPaymentId,
          paymentMethod: group.paymentMethod,
          paidAt: group.paidAt,
          status: "approved",
          approvedAt: new Date(),
          groupRegistration: group._id,
        });
      }
      // reg is either the freshly-created doc above, or an existing one whose earlier email attempt failed —
      // either way, re-send with its own (never regenerated) code.
      const email = await registrationApprovedEmail(reg.fullName, reg.registrationCode, reg.feeAmount, false);
      await sendMail({ to: delegate.email, subject: email.subject, html: email.html, attachments: email.attachments });
      await sendWhatsAppNotification(
        reg.phone,
        "registration_approved",
        [reg.fullName, reg.registrationCode],
        `registration-approved-${reg._id.toString()}`
      );
      await Registration.updateOne({ _id: reg._id }, { $set: { confirmationEmailSentAt: new Date() } });
      await sendWhatsAppNotification(reg.phone, "registration_approved", [reg.fullName], `registration-approved-${reg._id.toString()}`);
      delegatesProcessed++;
      console.info("[group-registration] participant processed", { groupCode: group.groupCode, registrationId: reg._id.toString(), registrationCode: reg.registrationCode });
    } catch (error) {
      console.error("[razorpay] failed to create/email a group delegate's registration:", { groupRegistrationId: group._id.toString(), delegateEmail: delegate.email }, error);
    }
  }
  if (delegatesProcessed > 0) {
    const createdIds = (await Registration.find({ groupRegistration: group._id }).select("_id").lean()).map((r) => r._id);
    await GroupRegistration.updateOne({ _id: group._id }, { $set: { createdRegistrations: createdIds } });
  }

  if (justApproved) {
    await logAudit({
      actor: actor.uid ?? null,
      actorRole: actor.role,
      action: "group_registration.payment_captured",
      resourceType: "group_registration",
      resourceId: group._id.toString(),
      details: { groupCode: group.groupCode, razorpayOrderId: payment.order_id, razorpayPaymentId: payment.id, amount: payment.amount, expectedAmount: group.feeAmount * 100 },
      request,
    });
  }
  if (!group.coordinatorEmailSentAt) {
    try {
      const { subject, html } = groupRegistrationApprovedEmail(group.coordinatorName, group.groupCode, group.delegateCount);
      await sendMail({ to: group.coordinatorEmail, subject, html });
      await GroupRegistration.updateOne({ _id: group._id }, { $set: { coordinatorEmailSentAt: new Date() } });
    } catch (error) {
      console.error("[razorpay] failed to email group coordinator:", { groupRegistrationId: group._id.toString() }, error);
    }
  }

  return { newlyApproved: !!justApproved, delegatesProcessed };
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
    // A delegate who paid more than expected (e.g. a gateway surcharge Razorpay added on top)
    // should still be confirmed — only an actual shortfall is refused automatic approval.
    const matches = captured && captured.currency === "INR" && captured.amount >= expectedAmount;

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

export interface GroupPaymentSyncResult extends PaymentSyncResult {
  /** Delegates created + emailed by this sync — set even when the group was already "approved" but had stragglers. */
  delegatesProcessed?: number;
}

/**
 * Group-registration equivalent of syncRazorpayRegistration — re-reads Razorpay's truth and
 * applies it. Also the retry path for delegates who missed their email/code/QR on an earlier
 * partial failure: recordCapturedGroupRazorpayPayment only ever creates the delegates that are
 * still missing, so calling this again is always safe and never double-emails anyone.
 */
export async function syncGroupRazorpayRegistration(
  group: IGroupRegistration,
  request: Request,
  actor: PaymentActor
): Promise<GroupPaymentSyncResult> {
  const orderId = group.razorpayOrderId!;
  const expectedAmount = group.feeAmount * 100;
  const { items } = await getRazorpayOrderPayments(orderId);

  let result: GroupPaymentSyncResult;

  if (items.length === 0) {
    result = { outcome: "no_payments" };
  } else {
    const captured = items.find((p) => p.status === "captured");
    const matches = captured && captured.currency === "INR" && captured.amount >= expectedAmount;

    if (captured && matches) {
      const outcome = await recordCapturedGroupRazorpayPayment(captured, request, actor);
      const delegatesProcessed = outcome?.delegatesProcessed ?? 0;
      result = {
        outcome: outcome && (outcome.newlyApproved || delegatesProcessed > 0) ? "captured" : "already_approved",
        paymentStatus: "captured",
        delegatesProcessed,
      };
    } else {
      const latest = captured ?? newest(items);
      const paymentError = captured
        ? `Captured payment ${captured.id} does not match this group registration (received ${captured.amount / 100} ${captured.currency}, expected ${group.feeAmount} INR). Not approved automatically.`
        : latest.error_description ?? undefined;

      await GroupRegistration.updateOne(
        { _id: group._id, status: { $ne: "approved" } },
        {
          $set: {
            razorpayPaymentId: latest.id,
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
    action: "group_registration.payment_synced",
    resourceType: "group_registration",
    resourceId: group._id.toString(),
    details: {
      groupCode: group.groupCode,
      razorpayOrderId: orderId,
      attempts: items.length,
      outcome: result.outcome,
      paymentStatus: result.paymentStatus ?? null,
      delegatesProcessed: result.delegatesProcessed ?? 0,
    },
    request,
  });

  return result;
}
