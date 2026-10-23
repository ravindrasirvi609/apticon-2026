import { createHash } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import mongoose from "mongoose";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { authErrorResponse, requireRole } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { FATAL_CODES, HALT_MESSAGE, RETRYABLE_CODES } from "@/lib/email-campaign";
import { isEmailConfigured, MailError, registrationApprovedEmail, sendMail } from "@/lib/email";
import Registration, { type IRegistration } from "@/models/Registration";

/**
 * "Send to all approved": mails the standard confirmation email, with each delegate's own QR
 * code, to every approved registration — including delegates who were already emailed when they
 * were approved. Each delegate receives it once; `bulkConfirmationSentAt` records delivery.
 *
 * The admin UI drives a run one time-boxed slice at a time, passing back the `cursor` from the
 * previous slice, so a pass walks every pending registration exactly once and always finishes.
 * Delegates that hit a transient problem come back as `retries`; the UI repeats just those `ids`
 * in a follow-up pass. Permanent failures are reported and stay pending for a later click.
 */

// One slice per call. The deadlines below keep every request well inside this.
export const maxDuration = 60;

const SLICE_SIZE = 40;
/** Stop taking new delegates after this long. */
const TIME_BUDGET_MS = 25_000;
/** No send attempt may start unless it can time out before this point. */
const SEND_DEADLINE_MS = 42_000;
/** Every database step after a send is cut off here, so the response always goes out in time. */
const RESPONSE_DEADLINE_MS = 54_000;
/** Resend calls have no timeout of their own. */
const ATTEMPT_TIMEOUT_MS = 10_000;
/** Minimum gap between send starts, keeping under Resend's default 2 requests/second limit. */
const SEND_INTERVAL_MS = 600;
const SEND_CONCURRENCY = 2;
const MAX_ATTEMPTS = 4;
/** A claim older than this belongs to a request that is past `maxDuration`, so it is dead. */
const STALE_CLAIM_MS = 75_000;
/** How soon a delegate whose send hit a transient error is worth trying again. */
const TRANSIENT_RETRY_AFTER_MS = 10_000;

/** Approved registrations that can actually be emailed (they have a code and an address). */
const SENDABLE: mongoose.QueryFilter<IRegistration> = {
  status: "approved",
  registrationCode: { $type: "string", $ne: "" },
  email: { $type: "string", $ne: "" },
};
const PENDING: mongoose.QueryFilter<IRegistration> = {
  ...SENDABLE,
  bulkConfirmationSentAt: { $exists: false },
};
const EMAIL_FIELDS = "fullName email registrationCode feeAmount";

const objectId = z.string().refine((v) => mongoose.isValidObjectId(v));
const bodySchema = z.object({
  /** `_id` of the last registration handled by the previous slice of this pass. */
  cursor: objectId.nullish(),
  /** Restricts a retry pass to the delegates a previous pass returned as `retries`. */
  ids: z.array(objectId).max(10_000).optional(),
});

type Candidate = Pick<
  IRegistration,
  "_id" | "fullName" | "email" | "registrationCode" | "feeAmount"
>;

type Outcome =
  | { status: "sent" }
  /** No longer pending when its turn came: delivered by another request, or no longer eligible. */
  | { status: "skipped" }
  /** Will not succeed by repeating it unchanged (e.g. an invalid address). */
  | { status: "failed"; error: string }
  /** Transient: worth repeating in a later pass, no sooner than `retryAfterMs`. */
  | { status: "retry"; error: string; retryAfterMs: number }
  /** The Resend account itself cannot send — stop the whole run. */
  | { status: "halted"; error: string };

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const errorMessage = (err: unknown) => (err instanceof Error ? err.message : String(err));

class TimeoutError extends Error {}

/**
 * Reject once `ms` has passed. The underlying operation may still complete afterwards; every
 * caller is safe with that (writes are idempotent, sends carry an idempotency key).
 */
function bounded<T>(promise: Promise<T>, ms: number, what: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(
      () => reject(new TimeoutError(`${what} did not finish in time`)),
      Math.max(0, ms),
    );
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

/** Counts for the admin card: how many approved delegates have / have not received the email. */
export async function GET() {
  try {
    await requireRole("super_admin");
    await connectDB();
    const [approved, sendable, pending] = await Promise.all([
      Registration.countDocuments({ status: "approved" }),
      Registration.countDocuments(SENDABLE),
      Registration.countDocuments(PENDING),
    ]);
    return NextResponse.json({
      approved,
      sent: sendable - pending,
      pending,
      missingDetails: approved - sendable,
    });
  } catch (err) {
    return authErrorResponse(err);
  }
}

/** Mail the next slice of the pass that starts after `cursor` (or from the beginning). */
export async function POST(request: NextRequest) {
  try {
    const admin = await requireRole("super_admin");
    if (!isEmailConfigured()) {
      return NextResponse.json(
        { error: "RESEND_API_KEY is not configured on the server" },
        { status: 503 },
      );
    }
    const parsed = bodySchema.safeParse(await request.json().catch(() => ({})));
    if (!parsed.success)
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    const { cursor, ids } = parsed.data;

    const startedAt = Date.now();
    const deadlines = {
      send: startedAt + SEND_DEADLINE_MS,
      response: startedAt + RESPONSE_DEADLINE_MS,
    };
    const untilResponse = () => deadlines.response - Date.now();

    await bounded(connectDB(), untilResponse(), "Connecting to the database");
    const idFilter = {
      ...(ids ? { $in: ids } : {}),
      ...(cursor ? { $gt: cursor } : {}),
    };
    const candidates: Candidate[] = await bounded(
      Registration.find(Object.keys(idFilter).length ? { ...PENDING, _id: idFilter } : PENDING)
        .sort({ _id: 1 })
        .limit(SLICE_SIZE)
        .select(EMAIL_FIELDS)
        .lean()
        .exec(),
      untilResponse(),
      "Reading pending registrations",
    );

    // Shared pacer: every send attempt (including retries) waits for its own start slot.
    let nextSlot = Date.now();
    const pace = async () => {
      const now = Date.now();
      const at = Math.max(now, nextSlot);
      nextSlot = at + SEND_INTERVAL_MS;
      if (at > now) await sleep(at - now);
    };

    // Workers take candidates strictly in order, so the handled set is always a prefix of the
    // slice and the cursor can safely advance to the last one taken.
    const outcomes: Outcome[] = [];
    let taken = 0;
    let haltReason: string | null = null;
    await Promise.all(
      Array.from({ length: Math.min(SEND_CONCURRENCY, candidates.length) }, async () => {
        while (
          taken < candidates.length &&
          !haltReason &&
          Date.now() - startedAt < TIME_BUDGET_MS
        ) {
          const i = taken++;
          const outcome = await deliver(candidates[i]._id, pace, deadlines).catch(
            (err): Outcome => {
              console.error("[admin approved registration emails] deliver", err);
              // State is unknown (a claim may have landed), so wait for any claim to expire.
              return { status: "retry", error: errorMessage(err), retryAfterMs: STALE_CLAIM_MS };
            },
          );
          outcomes[i] = outcome;
          if (outcome.status === "halted") haltReason = outcome.error;
        }
      }),
    );

    const handled = candidates.slice(0, taken);
    const describe = (reg: Candidate, error: string) => ({
      id: reg._id.toString(),
      name: reg.fullName,
      email: reg.email,
      code: reg.registrationCode,
      error,
    });
    const failures = handled.flatMap((reg, i) => {
      const o = outcomes[i];
      return o.status === "failed" ? [describe(reg, o.error)] : [];
    });
    // A halted delegate is still pending too; listing it lets the UI report it as not sent.
    const retries = handled.flatMap((reg, i) => {
      const o = outcomes[i];
      return o.status === "retry" || o.status === "halted" ? [describe(reg, o.error)] : [];
    });
    const retryAfterMs = Math.max(
      0,
      ...outcomes.map((o) => (o.status === "retry" ? o.retryAfterMs : 0)),
    );
    const sent = outcomes.filter((o) => o.status === "sent").length;
    const skipped = outcomes.filter((o) => o.status === "skipped").length;
    const done = !haltReason && taken === candidates.length && candidates.length < SLICE_SIZE;

    // Bookkeeping only: never let it cost the response (sends are already recorded per row).
    if (taken > 0) {
      await bounded(
        logAudit({
          actor: admin.uid,
          actorRole: admin.role,
          action: "admin.email.approved_registrations.send",
          resourceType: "email_campaign",
          details: {
            handled: taken,
            sent,
            skipped,
            failed: failures.length,
            retry: retries.length,
            haltReason,
          },
          request,
        }),
        untilResponse(),
        "Writing the audit log",
      ).catch((err) => console.error("[admin approved registration emails] audit", err));
    }
    const pending = await bounded(
      Registration.countDocuments(PENDING).exec(),
      untilResponse(),
      "Counting pending registrations",
    ).catch(() => null);

    return NextResponse.json({
      handled: taken,
      handledIds: handled.map((reg) => reg._id.toString()),
      sent,
      skipped,
      failures,
      retries,
      retryAfterMs,
      haltReason,
      cursor: taken > 0 ? handled[taken - 1]._id.toString() : (cursor ?? null),
      done,
      pending,
    });
  } catch (err) {
    console.error("[admin approved registration emails]", err);
    return authErrorResponse(err);
  }
}

/** Claim one registration, send its confirmation (retrying transient errors), then record it. */
async function deliver(
  id: mongoose.Types.ObjectId,
  pace: () => Promise<void>,
  deadlines: { send: number; response: number },
): Promise<Outcome> {
  const untilResponse = () => deadlines.response - Date.now();
  const claimedAt = new Date();
  // Re-checks eligibility atomically and returns the current document, so an address corrected
  // (or a registration changed) after this slice was read is honoured.
  const reg: Candidate | null = await bounded(
    Registration.findOneAndUpdate(
      {
        ...PENDING,
        _id: id,
        $or: [
          { bulkConfirmationClaimedAt: { $exists: false } },
          { bulkConfirmationClaimedAt: { $lt: new Date(claimedAt.getTime() - STALE_CLAIM_MS) } },
        ],
      },
      { $set: { bulkConfirmationClaimedAt: claimedAt } },
      { returnDocument: "after" },
    )
      .select(EMAIL_FIELDS)
      .lean()
      .exec(),
    untilResponse(),
    "Claiming the registration",
  );
  if (!reg) {
    const stillPending = await bounded(
      Registration.exists({ ...PENDING, _id: id }).exec(),
      untilResponse(),
      "Checking the registration",
    );
    // Pending but not claimable: another live request holds it. A retry pass picks it up only
    // if it is still undelivered once that claim has expired.
    return stillPending
      ? { status: "retry", error: "Was being sent by another request", retryAfterMs: STALE_CLAIM_MS }
      : { status: "skipped" };
  }

  // Never let a failed release hide the real outcome; an unreleased claim simply expires.
  const release = () =>
    bounded(
      Registration.updateOne({ _id: id }, { $unset: { bulkConfirmationClaimedAt: 1 } }).exec(),
      untilResponse(),
      "Releasing the claim",
    ).catch((err) => console.error("[admin approved registration emails] release", err));

  let email: Awaited<ReturnType<typeof registrationApprovedEmail>>;
  try {
    email = await registrationApprovedEmail(reg.fullName, reg.registrationCode, reg.feeAmount);
  } catch (err) {
    await release();
    return { status: "failed", error: `Could not build the email: ${errorMessage(err)}` };
  }

  // Stable for this delegate and content, across retries, passes and runs: Resend returns the
  // original send for 24h instead of mailing twice. Changed content (e.g. a corrected address)
  // gets a new key, so it is not blocked by an earlier attempt.
  const contentHash = createHash("sha256")
    .update(reg.email)
    .update("\0")
    .update(email.subject)
    .update("\0")
    .update(email.html)
    .digest("hex")
    .slice(0, 32);
  const idempotencyKey = `bulk-confirmation-${id}-${contentHash}`;

  for (let attempt = 1; ; attempt++) {
    await pace();
    if (Date.now() + ATTEMPT_TIMEOUT_MS > deadlines.send) {
      await release();
      return {
        status: "retry",
        error: "Ran out of time in this request",
        retryAfterMs: TRANSIENT_RETRY_AFTER_MS,
      };
    }
    try {
      await bounded(
        sendMail({
          to: reg.email,
          subject: email.subject,
          html: email.html,
          attachments: email.attachments,
          idempotencyKey,
        }),
        ATTEMPT_TIMEOUT_MS,
        "Resend",
      );
      break;
    } catch (err) {
      const code = err instanceof MailError ? err.code : "network_error";
      const statusCode = err instanceof MailError ? err.statusCode : null;
      const message = errorMessage(err);
      // 401/403 mean the key, sender domain or sandbox sender is unusable for everyone.
      if (FATAL_CODES.has(code) || statusCode === 401 || statusCode === 403) {
        await release();
        return { status: "halted", error: HALT_MESSAGE[code] ?? message };
      }
      if (!RETRYABLE_CODES.has(code)) {
        await release();
        return { status: "failed", error: message };
      }
      const backoff = 1000 * 2 ** (attempt - 1);
      if (attempt >= MAX_ATTEMPTS || Date.now() + backoff + ATTEMPT_TIMEOUT_MS > deadlines.send) {
        await release();
        return { status: "retry", error: message, retryAfterMs: TRANSIENT_RETRY_AFTER_MS };
      }
      await sleep(backoff);
    }
  }

  if (await recordDelivery(id, deadlines.response)) return { status: "sent" };
  // Releasing lets the next pass resend with the same idempotency key; Resend answers with the
  // original send (no second email) and the delivery is recorded then.
  await release();
  return {
    status: "retry",
    error:
      "Email was sent, but the database could not record it. It has most likely been delivered; sending again within 24 hours will not duplicate it",
    retryAfterMs: TRANSIENT_RETRY_AFTER_MS,
  };
}

/** Mark the delegate delivered, retrying database errors until the response deadline. */
async function recordDelivery(id: mongoose.Types.ObjectId, until: number): Promise<boolean> {
  const sentAt = new Date();
  for (let attempt = 1; attempt <= 3; attempt++) {
    const remaining = until - Date.now();
    if (remaining < 1000) break;
    try {
      await bounded(
        Registration.updateOne(
          { _id: id },
          { $set: { bulkConfirmationSentAt: sentAt }, $unset: { bulkConfirmationClaimedAt: 1 } },
        ).exec(),
        remaining,
        "Recording the delivery",
      );
      // Best effort: delegates whose approval-time email never went out now count as confirmed too.
      await bounded(
        Registration.updateOne(
          { _id: id, confirmationEmailSentAt: { $exists: false } },
          { $set: { confirmationEmailSentAt: sentAt } },
        ).exec(),
        until - Date.now(),
        "Recording the confirmation",
      ).catch((err) => console.error("[admin approved registration emails] confirmation", err));
      return true;
    } catch (err) {
      console.error("[admin approved registration emails] record delivery", err);
      if (attempt < 3) await sleep(Math.min(500 * attempt, Math.max(0, until - Date.now() - 1000)));
    }
  }
  return false;
}
