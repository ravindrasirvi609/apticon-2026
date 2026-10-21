/**
 * Bulk email engine (server only).
 *
 *   createCampaign        → freezes subject/body/attachments + one row per recipient
 *   processCampaignBatch  → claims the next slice of pending recipients and sends it via Resend
 *
 * Sending is driven in small slices — one HTTP call per slice, looped by the admin UI — so a
 * 2,000-delegate blast never depends on a single long-running serverless invocation, and a
 * closed tab can be resumed from where it stopped.
 */

import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { nanoid } from "nanoid";
import { connectDB } from "@/lib/db";
import { authErrorResponse } from "@/lib/auth";
import Registration from "@/models/Registration";
import Abstract from "@/models/Abstract";
import EmailCampaign, {
  type IEmailCampaign,
  type IEmailCampaignAttachment,
} from "@/models/EmailCampaign";
import EmailRecipient, { type IEmailRecipient } from "@/models/EmailRecipient";
import {
  BASE_URL,
  MailError,
  renderEmail,
  sendMail,
  sendMailBatch,
  type BatchMailResult,
  type EmailAttachment,
  type EmailBlock,
} from "@/lib/email";
import { publicUrl } from "@/lib/r2";
import {
  EMAIL_ATTACHMENT_KEY_PREFIX,
  EMAIL_ATTACHMENT_MAX_FILES,
  EMAIL_ATTACHMENT_MAX_TOTAL_BYTES,
  EMAIL_ATTACHMENT_TYPES,
  attachmentExtension,
  escapeHtml,
  interpolate,
  type CampaignAttachment,
  type EmailBodyFormat,
} from "@/lib/email-campaign-shared";

// ─── Recipient variables ────────────────────────────────────

const EVENT_VARS = {
  event_name: "APTICON 2026",
  event_dates: "24–25 October 2026",
  venue: "Pt. Deendayal Upadhyay Auditorium, G.E. Road, Raipur (C.G.)",
  site_url: BASE_URL,
};

const ABSTRACT_STATUS_LABEL: Record<string, string> = {
  submitted: "Submitted",
  under_review: "Under review",
  accepted: "Accepted",
  rejected: "Rejected",
  revision_requested: "Revision requested",
  resubmitted: "Resubmitted",
};

function registrationStatusLabel(status: string, paymentStatus?: string) {
  if (status === "approved") return "Confirmed";
  if (paymentStatus === "failed") return "Payment failed";
  if (paymentStatus === "refunded") return "Refunded";
  if (status === "payment_review") return "Payment under review";
  if (status === "rejected") return "Rejected";
  return "Payment pending";
}

function paymentStatusLabel(status: string, paymentStatus?: string) {
  if (status === "approved") return "Paid";
  switch (paymentStatus) {
    case "authorized":
      return "Authorized";
    case "captured":
      return "Paid";
    case "failed":
      return "Failed";
    case "refunded":
      return "Refunded";
    default:
      return "Pending";
  }
}

export interface RecipientData {
  email: string;
  name: string;
  vars: Record<string, string>;
}

/**
 * Look the addresses up in the registration and abstract collections and build each person's
 * variable set. Addresses unknown to both still get a (mostly empty) set, so extra recipients
 * can be mailed — their `{{name|fallback}}` fallbacks apply.
 */
export async function resolveRecipients(
  emails: string[],
): Promise<RecipientData[]> {
  await connectDB();
  const [regs, absts] = await Promise.all([
    Registration.find({ email: { $in: emails } })
      .sort({ createdAt: -1 })
      .lean(),
    Abstract.find({ email: { $in: emails } })
      .sort({ createdAt: -1 })
      .lean(),
  ]);

  // One address can hold several registrations; prefer a confirmed one, else the newest.
  const regByEmail = new Map<string, (typeof regs)[number]>();
  for (const r of regs) {
    const current = regByEmail.get(r.email);
    if (!current || (r.status === "approved" && current.status !== "approved"))
      regByEmail.set(r.email, r);
  }
  const abstractsByEmail = new Map<string, typeof absts>();
  for (const a of absts) {
    const list = abstractsByEmail.get(a.email) ?? [];
    list.push(a);
    abstractsByEmail.set(a.email, list);
  }

  return emails.map((email) => {
    const reg = regByEmail.get(email);
    const abstracts = abstractsByEmail.get(email) ?? [];
    const firstAbstract = abstracts[0];
    const name = reg?.fullName ?? firstAbstract?.presentingAuthor ?? "";
    const vars: Record<string, string> = {
      ...EVENT_VARS,
      name,
      first_name: firstNameOf(name),
      email,
      institution: reg?.institution ?? firstAbstract?.institution ?? "",
      designation: reg?.designation ?? "",
      city: reg?.city ?? "",
      category: reg?.category ?? "",
      registration_code: reg?.registrationCode ?? "",
      registration_status: reg
        ? registrationStatusLabel(reg.status, reg.paymentStatus)
        : "",
      payment_status: reg ? paymentStatusLabel(reg.status, reg.paymentStatus) : "",
      fee_amount: reg ? `₹ ${reg.feeAmount.toLocaleString("en-IN")}` : "",
      submission_code: firstAbstract?.submissionCode ?? "",
      abstract_title: firstAbstract?.title ?? "",
      abstract_status: firstAbstract
        ? (ABSTRACT_STATUS_LABEL[firstAbstract.status] ?? firstAbstract.status)
        : "",
      abstract_count: String(abstracts.length),
    };
    return { email, name, vars };
  });
}

/** "Dr. Asha Verma" → "Asha": skips honorifics so the greeting doesn't read "Dear Dr.,". */
function firstNameOf(fullName: string): string {
  const parts = fullName
    .split(/\s+/)
    .filter((p) => p && !/^(dr|prof|mr|mrs|ms|mx|shri|smt|er)\.?$/i.test(p));
  return parts[0] ?? "";
}

// ─── Rendering ──────────────────────────────────────────────

export interface CampaignContent {
  subject: string;
  headline: string;
  body: string;
  bodyFormat: EmailBodyFormat;
}

const identity = (s: string) => s;
const oneLine = (s: string) => s.replace(/[\r\n]+/g, " ");

const INLINE_RE =
  /\[([^\]\n]+)\]\((https?:\/\/[^\s)]+|mailto:[^\s)]+)\)|\*\*([^*\n]+)\*\*|(https?:\/\/[^\s<]+)/g;
const LINK_STYLE = "color:#312E81;font-weight:700;";

/** Input is already HTML-escaped; adds **bold**, [label](url) and bare-URL links. */
function inlineFormat(escaped: string): string {
  return escaped.replace(
    INLINE_RE,
    (
      _match: string,
      label?: string,
      href?: string,
      bold?: string,
      bare?: string,
    ) => {
      if (label !== undefined && href !== undefined)
        return `<a href="${href}" style="${LINK_STYLE}">${label}</a>`;
      if (bold !== undefined) return `<b>${bold}</b>`;
      const url = bare ?? "";
      // Sentence punctuation after a link belongs to the sentence, not the URL.
      const m = /^(.*?)((?:[.,;:!?)]|&quot;|&#39;|&gt;)*)$/.exec(url);
      const clean = m?.[1] ?? url;
      const tail = m?.[2] ?? "";
      return `<a href="${clean}" style="${LINK_STYLE}">${clean}</a>${tail}`;
    },
  );
}

/** Plain-text mode: blank line = new paragraph, "- " lines = bullet list, single newline = line break. */
function textToBlocks(escaped: string): EmailBlock[] {
  const chunks = escaped
    .replace(/\r\n?/g, "\n")
    .trim()
    .split(/\n{2,}/)
    .map((c) => c.trim())
    .filter(Boolean);

  return chunks.map((chunk): EmailBlock => {
    const lines = chunk.split("\n");
    const bullet = /^\s*[-*•]\s+/;
    if (lines.every((l) => bullet.test(l))) {
      const items = lines
        .map(
          (l) =>
            `<li style="margin:0 0 6px 0;">${inlineFormat(l.replace(bullet, ""))}</li>`,
        )
        .join("");
      return {
        type: "html",
        html: `<ul style="margin:0 0 14px 0;padding-left:22px;font-size:14px;line-height:1.65;color:#0F172A;">${items}</ul>`,
      };
    }
    return { type: "text", html: lines.map(inlineFormat).join("<br/>") };
  });
}

export function renderCampaignEmail(
  content: CampaignContent,
  vars: Record<string, string>,
): { subject: string; html: string } {
  const subject = interpolate(content.subject, vars, identity, oneLine)
    .replace(/\s+/g, " ")
    .trim();
  const headline = content.headline
    ? interpolate(content.headline, vars, identity, oneLine).trim()
    : "";

  const blocks: EmailBlock[] =
    content.bodyFormat === "html"
      ? [
          {
            type: "html",
            html: `<div style="font-size:14px;line-height:1.65;color:#0F172A;">${interpolate(content.body, vars, identity, escapeHtml)}</div>`,
          },
        ]
      : textToBlocks(interpolate(content.body, vars, escapeHtml, escapeHtml));

  blocks.push({ type: "signoff" });
  return {
    subject,
    html: renderEmail({ title: headline || subject, blocks }),
  };
}

// ─── Attachments ────────────────────────────────────────────

export class CampaignInputError extends Error {}

/** 400 for caller mistakes (bad attachment, unknown campaign); everything else follows the auth error contract. */
export function campaignErrorResponse(err: unknown): NextResponse {
  if (err instanceof CampaignInputError)
    return NextResponse.json({ error: err.message }, { status: 400 });
  return authErrorResponse(err);
}

/**
 * Re-validate client-supplied attachment metadata. The key must be one this feature uploaded,
 * and the public URL / content type are rebuilt here rather than trusted from the request.
 */
export function normalizeAttachments(
  input: CampaignAttachment[],
): IEmailCampaignAttachment[] {
  if (input.length > EMAIL_ATTACHMENT_MAX_FILES)
    throw new CampaignInputError(
      `At most ${EMAIL_ATTACHMENT_MAX_FILES} attachments are allowed`,
    );
  let totalBytes = 0;
  const out = input.map((a) => {
    const ext = attachmentExtension(a.key);
    if (
      !a.key.startsWith(EMAIL_ATTACHMENT_KEY_PREFIX) ||
      a.key.includes("..") ||
      !EMAIL_ATTACHMENT_TYPES[ext]
    )
      throw new CampaignInputError("Invalid attachment");
    totalBytes += a.size;
    return {
      key: a.key,
      url: publicUrl(a.key),
      filename: a.filename,
      size: a.size,
      contentType: EMAIL_ATTACHMENT_TYPES[ext],
    };
  });
  if (totalBytes > EMAIL_ATTACHMENT_MAX_TOTAL_BYTES)
    throw new CampaignInputError(
      `Attachments must total ${EMAIL_ATTACHMENT_MAX_TOTAL_BYTES / 1024 / 1024} MB or less`,
    );
  return out;
}

/** Resend downloads each attachment from its public URL, so the API request itself stays tiny. */
export function toMailAttachments(
  attachments: IEmailCampaignAttachment[],
): EmailAttachment[] {
  return attachments.map((a) => ({
    filename: a.filename,
    path: a.url,
    contentType: a.contentType,
  }));
}

// ─── Campaign creation ──────────────────────────────────────

export interface CreateCampaignInput extends CampaignContent {
  replyTo: string;
  attachments: IEmailCampaignAttachment[];
  emails: string[];
}

export async function createCampaign(
  input: CreateCampaignInput,
  admin: { uid: string; name: string },
): Promise<{ id: string; total: number }> {
  await connectDB();
  const emails = [...new Set(input.emails)];
  const recipients = await resolveRecipients(emails);

  const campaign = await EmailCampaign.create({
    subject: input.subject,
    headline: input.headline,
    body: input.body,
    bodyFormat: input.bodyFormat,
    replyTo: input.replyTo,
    attachments: input.attachments,
    total: recipients.length,
    status: "sending",
    createdBy: new mongoose.Types.ObjectId(admin.uid),
    createdByName: admin.name,
  });

  try {
    await EmailRecipient.insertMany(
      recipients.map((r) => ({
        campaign: campaign._id,
        email: r.email,
        name: r.name,
        vars: r.vars,
      })),
      { ordered: false },
    );
  } catch (err) {
    // Never leave a campaign with a partial recipient list: it would silently under-deliver.
    await EmailRecipient.deleteMany({ campaign: campaign._id });
    await EmailCampaign.deleteOne({ _id: campaign._id });
    throw err;
  }
  return { id: campaign._id.toString(), total: recipients.length };
}

// ─── Progress ───────────────────────────────────────────────

export interface CampaignCounts {
  total: number;
  sent: number;
  failed: number;
  /** Not yet delivered or failed: still queued, or claimed by an in-flight request. */
  pending: number;
  cancelled: number;
}

export async function recipientCounts(
  campaignIds: mongoose.Types.ObjectId[],
): Promise<Map<string, CampaignCounts>> {
  const rows = await EmailRecipient.aggregate<{
    _id: { campaign: mongoose.Types.ObjectId; status: string };
    n: number;
  }>([
    { $match: { campaign: { $in: campaignIds } } },
    { $group: { _id: { campaign: "$campaign", status: "$status" }, n: { $sum: 1 } } },
  ]);
  const out = new Map<string, CampaignCounts>();
  for (const id of campaignIds)
    out.set(id.toString(), { total: 0, sent: 0, failed: 0, pending: 0, cancelled: 0 });
  for (const row of rows) {
    const c = out.get(row._id.campaign.toString());
    if (!c) continue;
    c.total += row.n;
    if (row._id.status === "sent") c.sent += row.n;
    else if (row._id.status === "failed") c.failed += row.n;
    else if (row._id.status === "cancelled") c.cancelled += row.n;
    else c.pending += row.n;
  }
  return out;
}

export interface CampaignProgress extends CampaignCounts {
  status: IEmailCampaign["status"];
  haltReason: string;
}

async function progressOf(
  campaign: Pick<IEmailCampaign, "_id" | "status" | "haltReason">,
): Promise<CampaignProgress> {
  const counts = (await recipientCounts([campaign._id])).get(
    campaign._id.toString(),
  )!;
  return { ...counts, status: campaign.status, haltReason: campaign.haltReason };
}

// ─── Sending ────────────────────────────────────────────────

const BATCH_SIZE = 50; // recipients per Resend batch call (limit is 100)
const ATTACHMENT_SLICE_SIZE = 12; // attachment mails go out one by one, so keep the slice small
const SEND_CONCURRENCY = 4;
const MAX_ATTEMPTS = 5;
/** A claim older than this belongs to an invocation that died mid-send. */
const STALE_CLAIM_MS = 5 * 60_000;

/** The Resend account/key itself is unusable — stop the whole campaign instead of failing every row. */
const FATAL_CODES = new Set([
  "daily_quota_exceeded",
  "monthly_quota_exceeded",
  "missing_api_key",
  "invalid_api_key",
  "invalid_from_address",
]);
/** Transient: put the recipient back in the queue. */
const RETRYABLE_CODES = new Set([
  "rate_limit_exceeded",
  "internal_server_error",
  "application_error",
  "concurrent_idempotent_requests",
  "network_error",
]);

const HALT_MESSAGE: Record<string, string> = {
  daily_quota_exceeded:
    "Resend's daily sending quota is used up. Resume tomorrow or upgrade the Resend plan.",
  monthly_quota_exceeded:
    "Resend's monthly sending quota is used up. Upgrade the Resend plan to continue.",
  missing_api_key: "RESEND_API_KEY is not configured on the server.",
  invalid_api_key: "The configured RESEND_API_KEY was rejected by Resend.",
  invalid_from_address:
    "The RESEND_FROM sender address is invalid or its domain is not verified in Resend.",
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

type SendResult = BatchMailResult;

async function sendWithRetry(
  campaign: IEmailCampaign,
  recipient: { _id: mongoose.Types.ObjectId; email: string },
  rendered: { subject: string; html: string },
): Promise<SendResult> {
  for (let attempt = 0; ; attempt++) {
    try {
      const res = await sendMail({
        to: recipient.email,
        subject: rendered.subject,
        html: rendered.html,
        attachments: toMailAttachments(campaign.attachments),
        replyTo: campaign.replyTo || undefined,
        // Same key on every retry: Resend returns the original send instead of mailing twice.
        idempotencyKey: `campaign-${campaign._id}-${recipient._id}`,
      });
      if ("skipped" in res)
        return {
          ok: false,
          error: "RESEND_API_KEY is not configured",
          code: "missing_api_key",
        };
      return { ok: true, id: res.data?.id ?? "" };
    } catch (err) {
      const code = err instanceof MailError ? err.code : "network_error";
      if (code === "rate_limit_exceeded" && attempt < 2) {
        await sleep(1000 * (attempt + 1));
        continue;
      }
      return {
        ok: false,
        error: err instanceof Error ? err.message : String(err),
        code,
      };
    }
  }
}

/** Run `fn` over `items` with at most `limit` in flight, preserving result order. */
async function mapPool<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (next < items.length) {
        const i = next++;
        results[i] = await fn(items[i]);
      }
    }),
  );
  return results;
}

export async function processCampaignBatch(
  campaignId: string,
): Promise<CampaignProgress> {
  await connectDB();
  const campaign = await EmailCampaign.findById(campaignId);
  if (!campaign) throw new CampaignInputError("Campaign not found");
  if (campaign.status !== "sending") return progressOf(campaign);

  const hasAttachments = campaign.attachments.length > 0;
  const sliceSize = hasAttachments ? ATTACHMENT_SLICE_SIZE : BATCH_SIZE;

  // Claim: pick candidate ids, then flip them to "sending" under this request's token. The
  // status guard in the update means two concurrent requests can never both own a row.
  const claimable: mongoose.QueryFilter<IEmailRecipient> = {
    campaign: campaign._id,
    $or: [
      { status: "pending" },
      { status: "sending", claimedAt: { $lt: new Date(Date.now() - STALE_CLAIM_MS) } },
    ],
  };
  const candidates = await EmailRecipient.find(claimable)
    .select("_id")
    .limit(sliceSize)
    .lean();
  const claimToken = nanoid(12);
  if (candidates.length > 0) {
    await EmailRecipient.updateMany(
      { _id: { $in: candidates.map((c) => c._id) }, ...claimable },
      { $set: { status: "sending", claimToken, claimedAt: new Date() } },
    );
  }
  const claimed = await EmailRecipient.find({
    campaign: campaign._id,
    claimToken,
    status: "sending",
  }).lean();

  if (claimed.length > 0) {
    const content: CampaignContent = {
      subject: campaign.subject,
      headline: campaign.headline,
      body: campaign.body,
      bodyFormat: campaign.bodyFormat,
    };

    // Render first; a recipient whose template cannot render fails alone.
    const prepared = claimed.map((r) => {
      try {
        return { r, rendered: renderCampaignEmail(content, r.vars ?? {}) };
      } catch (err) {
        return {
          r,
          rendered: null,
          error: err instanceof Error ? err.message : "Render failed",
        };
      }
    });
    const sendable = prepared.filter((p) => p.rendered !== null) as {
      r: (typeof claimed)[number];
      rendered: { subject: string; html: string };
    }[];

    let results: SendResult[] = [];
    if (sendable.length > 0) {
      results = hasAttachments
        ? await mapPool(sendable, SEND_CONCURRENCY, (p) =>
            sendWithRetry(campaign, p.r, p.rendered),
          )
        : await sendMailBatch(
            sendable.map((p) => ({
              to: p.r.email,
              subject: p.rendered.subject,
              html: p.rendered.html,
              replyTo: campaign.replyTo || undefined,
            })),
            `campaign-${campaign._id}-${claimToken}`,
          ).catch((err): SendResult[] =>
            sendable.map(() => ({
              ok: false,
              error: err instanceof Error ? err.message : String(err),
              code: "network_error",
            })),
          );
    }

    let haltCode: string | null = null;
    let throttled = false;
    const now = new Date();
    const ops: mongoose.AnyBulkWriteOperation<IEmailRecipient>[] = [];

    prepared
      .filter((p) => p.rendered === null)
      .forEach((p) =>
        ops.push({
          updateOne: {
            filter: { _id: p.r._id },
            update: { $set: { status: "failed", error: p.error ?? "Render failed" } },
          },
        }),
      );

    sendable.forEach((p, i) => {
      const res = results[i];
      if (res.ok) {
        ops.push({
          updateOne: {
            filter: { _id: p.r._id },
            update: {
              $set: { status: "sent", resendId: res.id, sentAt: now, error: "" },
              $inc: { attempts: 1 },
            },
          },
        });
        return;
      }
      if (FATAL_CODES.has(res.code)) {
        haltCode = res.code;
        // Not this recipient's fault: hand the row back untouched.
        ops.push({
          updateOne: {
            filter: { _id: p.r._id },
            update: { $set: { status: "pending", claimToken: "" } },
          },
        });
        return;
      }
      const attempts = p.r.attempts + 1;
      if (RETRYABLE_CODES.has(res.code) && attempts < MAX_ATTEMPTS) {
        if (res.code === "rate_limit_exceeded") throttled = true;
        ops.push({
          updateOne: {
            filter: { _id: p.r._id },
            update: {
              $set: { status: "pending", claimToken: "", error: res.error },
              $inc: { attempts: 1 },
            },
          },
        });
        return;
      }
      ops.push({
        updateOne: {
          filter: { _id: p.r._id },
          update: {
            $set: { status: "failed", error: res.error.slice(0, 500) },
            $inc: { attempts: 1 },
          },
        },
      });
    });

    if (ops.length > 0) await EmailRecipient.bulkWrite(ops, { ordered: false });

    if (haltCode) {
      await EmailCampaign.updateOne(
        { _id: campaign._id },
        {
          $set: {
            haltReason:
              HALT_MESSAGE[haltCode] ?? `Sending stopped (${haltCode}).`,
          },
        },
      );
    }
    // Give Resend's limiter room before the UI immediately asks for the next slice.
    if (throttled) await sleep(1500);
  }

  const counts = (await recipientCounts([campaign._id])).get(
    campaign._id.toString(),
  )!;
  // Guarded by status so a cancel that landed mid-slice is never overwritten by "completed".
  if (counts.pending === 0) {
    await EmailCampaign.updateOne(
      { _id: campaign._id, status: "sending", haltReason: "" },
      { $set: { status: "completed", completedAt: new Date() } },
    );
  }
  const fresh = await EmailCampaign.findById(campaign._id)
    .select("status haltReason")
    .lean();
  return {
    ...counts,
    status: fresh?.status ?? campaign.status,
    haltReason: fresh?.haltReason ?? "",
  };
}

/** Clear a previous halt so the next slice tries again (the admin fixed the cause, or time passed). */
export async function resumeCampaign(campaignId: string): Promise<void> {
  await connectDB();
  await EmailCampaign.updateOne(
    { _id: campaignId, status: "sending" },
    { $set: { haltReason: "" } },
  );
}

/** Put every failed recipient back in the queue and reopen a finished campaign. */
export async function retryFailedRecipients(
  campaignId: string,
): Promise<number> {
  await connectDB();
  const campaign = await EmailCampaign.findById(campaignId);
  if (!campaign) throw new CampaignInputError("Campaign not found");
  if (campaign.status === "cancelled")
    throw new CampaignInputError("A cancelled campaign cannot be retried");
  const res = await EmailRecipient.updateMany(
    { campaign: campaign._id, status: "failed" },
    { $set: { status: "pending", attempts: 0, error: "", claimToken: "" } },
  );
  if (res.modifiedCount > 0) {
    campaign.status = "sending";
    campaign.haltReason = "";
    campaign.completedAt = undefined;
    await campaign.save();
  }
  return res.modifiedCount;
}

/** Stop a running campaign: queued recipients are cancelled, already-sent ones are untouched. */
export async function cancelCampaign(campaignId: string): Promise<number> {
  await connectDB();
  const campaign = await EmailCampaign.findById(campaignId);
  if (!campaign) throw new CampaignInputError("Campaign not found");
  if (campaign.status !== "sending")
    throw new CampaignInputError("Only a running campaign can be cancelled");
  campaign.status = "cancelled";
  campaign.haltReason = "";
  campaign.completedAt = new Date();
  await campaign.save();
  const res = await EmailRecipient.updateMany(
    { campaign: campaign._id, status: { $in: ["pending", "sending"] } },
    { $set: { status: "cancelled", claimToken: "" } },
  );
  return res.modifiedCount;
}
