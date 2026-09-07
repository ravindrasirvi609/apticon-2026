/**
 * Unified transactional email system.
 *
 *   All templates funnel through `renderEmail({ title, preheader, blocks })`
 *   so every delegate/reviewer/admin message has an identical visual identity
 *   matching the APTICON 2026 website — indigo header, orange accent bar,
 *   Playfair display-like typography, slate section backgrounds, orange divider
 *   footer.
 *
 *   User-controlled fields ALWAYS pass through `esc()` before interpolation.
 */

import { Resend } from "resend";
import { generateRegistrationQrPngBuffer } from "@/lib/qrcode";

const KEY = process.env.RESEND_API_KEY ?? "";
const FROM = process.env.RESEND_FROM ?? "APTICON 2026 <onboarding@resend.dev>";
const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL ??
  process.env.DOMAIN ??
  "http://localhost:3000";

export const resend = new Resend(KEY);

// ─── Escape ─────────────────────────────────────────────────
export function esc(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
function nl2br(input: string): string {
  return esc(input).replace(/\n/g, "<br/>");
}

// ─── Brand tokens (email-safe hex values) ──────────────────
const BRAND = {
  primary900: "#1E1B4B",
  primary800: "#312E81",
  primary700: "#4338CA",
  accent500: "#EA580C",
  accent400: "#F97316",
  accent300: "#FB923C",
  secondary800: "#1E293B",
  surface50: "#F8FAFC",
  surface100: "#F1F5F9",
  surface200: "#E2E8F0",
  dark: "#0F172A",
  muted: "#475569",
  emerald: "#059669",
  emerald50: "#ECFDF5",
  amber: "#D97706",
  amber50: "#FEF3C7",
  red: "#DC2626",
  red50: "#FEE2E2",
};

// ─── Block builders (compose an email body) ────────────────
export type EmailBlock =
  | { type: "text"; html: string } // pre-escaped HTML paragraph
  | { type: "heading"; text: string } // small H2
  | { type: "code"; label: string; value: string } // big monospace code card
  | { type: "qr"; cid: string; caption?: string } // centered QR image (cid: inline attachment)
  | { type: "kv"; rows: { label: string; value: string }[] } // key/value rows
  | {
      type: "callout";
      variant: "info" | "success" | "warning" | "danger";
      title?: string;
      body: string;
    }
  | {
      type: "button";
      label: string;
      href: string;
      variant?: "primary" | "secondary";
    }
  | { type: "divider" }
  | { type: "signoff"; text?: string }; // "Warm regards, …" block

function renderBlock(b: EmailBlock): string {
  switch (b.type) {
    case "text":
      return `<p style="margin:0 0 14px 0;font-size:14px;line-height:1.65;color:${BRAND.dark};">${b.html}</p>`;

    case "heading":
      return `<h2 style="margin:24px 0 12px 0;font-size:18px;font-weight:800;color:${BRAND.primary800};">${esc(b.text)}</h2>`;

    case "code":
      return `
        <div style="background:${BRAND.surface100};border-left:4px solid ${BRAND.accent500};padding:16px 20px;margin:20px 0;border-radius:4px;">
          <div style="font-size:11px;letter-spacing:.15em;text-transform:uppercase;color:${BRAND.muted};font-weight:700;">${esc(b.label)}</div>
          <div style="font-size:22px;font-weight:900;color:${BRAND.primary800};margin-top:6px;font-family:'Courier New',monospace;letter-spacing:1px;">${esc(b.value)}</div>
        </div>`;

    case "qr":
      return `
        <div style="background:${BRAND.surface100};border-left:4px solid ${BRAND.accent500};padding:16px 20px;margin:20px 0;border-radius:4px;text-align:center;">
          <img src="cid:${esc(b.cid)}" width="160" height="160" alt="QR code for registration"
               style="display:inline-block;border-radius:4px;background:#fff;padding:8px;" />
          ${b.caption ? `<div style="margin-top:10px;font-size:12px;color:${BRAND.muted};">${esc(b.caption)}</div>` : ""}
        </div>`;

    case "kv":
      return `
        <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;margin:16px 0;border-collapse:collapse;">
          ${b.rows
            .map(
              (r) => `
            <tr>
              <td style="padding:6px 12px 6px 0;font-size:12px;text-transform:uppercase;letter-spacing:.1em;color:${BRAND.muted};font-weight:700;white-space:nowrap;vertical-align:top;">${esc(r.label)}</td>
              <td style="padding:6px 0;font-size:14px;color:${BRAND.dark};">${esc(r.value)}</td>
            </tr>`,
            )
            .join("")}
        </table>`;

    case "callout": {
      const bg =
        b.variant === "success"
          ? BRAND.emerald50
          : b.variant === "warning"
            ? BRAND.amber50
            : b.variant === "danger"
              ? BRAND.red50
              : BRAND.surface100;
      const bar =
        b.variant === "success"
          ? BRAND.emerald
          : b.variant === "warning"
            ? BRAND.amber
            : b.variant === "danger"
              ? BRAND.red
              : BRAND.accent500;
      const titleHtml = b.title
        ? `<div style="font-weight:800;color:${bar};margin-bottom:6px;font-size:14px;">${esc(b.title)}</div>`
        : "";
      return `
        <div style="background:${bg};border-left:4px solid ${bar};padding:14px 18px;margin:18px 0;border-radius:6px;">
          ${titleHtml}
          <div style="font-size:14px;line-height:1.6;color:${BRAND.dark};">${b.body}</div>
        </div>`;
    }

    case "button": {
      const bg = b.variant === "secondary" ? "transparent" : BRAND.primary800;
      const color = b.variant === "secondary" ? BRAND.primary800 : "#ffffff";
      const border =
        b.variant === "secondary" ? `1px solid ${BRAND.primary800}` : "none";
      return `
        <div style="margin:20px 0;">
          <a href="${esc(b.href)}" style="display:inline-block;background:${bg};color:${color};padding:12px 22px;border-radius:8px;font-weight:700;text-decoration:none;font-size:14px;border:${border};">
            ${esc(b.label)}
          </a>
        </div>`;
    }

    case "divider":
      return `<div style="height:1px;background:${BRAND.accent500};opacity:.25;margin:18px 0;"></div>`;

    case "signoff":
      return `<p style="margin:24px 0 0 0;font-size:14px;color:${BRAND.dark};line-height:1.6;">${b.text ?? "Warm regards,"}<br/><b>APTICON 2026 Organising Committee</b></p>`;
  }
}

// ─── Master template ────────────────────────────────────────
interface RenderOpts {
  title: string; // headline in the branded header
  preheader?: string; // hidden inbox preview text
  blocks: EmailBlock[];
}

export function renderEmail({ title, preheader, blocks }: RenderOpts): string {
  const body = blocks.map(renderBlock).join("\n");
  return `<!doctype html>
<html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>${esc(title)}</title></head>
<body style="margin:0;padding:0;background:${BRAND.surface50};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:${BRAND.dark};">
  ${preheader ? `<div style="display:none;overflow:hidden;line-height:1px;opacity:0;max-height:0;max-width:0;">${esc(preheader)}</div>` : ""}
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.surface50};padding:24px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 6px 24px rgba(49,46,129,0.08);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,${BRAND.primary800},${BRAND.primary900});padding:28px 32px;color:#fff;position:relative;">
              <div style="font-size:11px;letter-spacing:.24em;text-transform:uppercase;color:${BRAND.accent400};font-weight:700;">APTICON 2026</div>
              <div style="font-size:22px;font-weight:900;margin-top:6px;font-family:Georgia,serif;">${esc(title)}</div>
              <div style="height:3px;width:60px;background:${BRAND.accent500};margin-top:14px;border-radius:2px;"></div>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              ${body}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:${BRAND.surface100};padding:20px 32px;font-size:12px;color:${BRAND.muted};border-top:2px solid ${BRAND.accent500};">
              <div style="font-weight:700;color:${BRAND.primary800};margin-bottom:4px;">APTICON 2026 · 28th Annual National Convention</div>
              <div>24–25 October 2026 · Pt. Deendayal Upadhyay Auditorium, G.E. Road, Raipur (C.G.)</div>
              <div>Hosted by APTI Chhattisgarh · Pt. Ravishankar Shukla University</div>
              <div style="margin-top:10px;">Powered by <a href="https://opf.org.in/" style="color:${BRAND.primary800};font-weight:700;text-decoration:none;">Operant Pharmacy Federation</a></div>
              <div style="margin-top:10px;font-size:11px;opacity:.75;">This is an automated message. Please do not reply directly to this email.</div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body></html>`;
}

// ─── Send helper ────────────────────────────────────────────
export interface EmailAttachment {
  filename: string;
  content: Buffer;
  contentId: string;
}
interface SendOpts {
  to: string;
  subject: string;
  html: string;
  attachments?: EmailAttachment[];
}
export async function sendMail({ to, subject, html, attachments }: SendOpts) {
  if (!KEY) {
    console.warn("[email] RESEND_API_KEY missing — skipping send to", to);
    return { skipped: true as const };
  }
  // Resend never throws for an API-level failure (invalid address, quota, rate limit) — it
  // resolves with { error } instead, so callers must check it or a failed send looks identical
  // to a successful one.
  const { data, error } = await resend.emails.send({
    from: FROM,
    to,
    subject,
    html,
    attachments,
  });
  if (error)
    throw new Error(
      `Resend rejected email to ${to} (${error.name}): ${error.message}`,
    );
  return { data };
}

// ─── Templates ──────────────────────────────────────────────

// -- Abstract lifecycle --

export function abstractSubmittedEmail(
  name: string,
  code: string,
  title: string,
) {
  return {
    subject: `Abstract Received — ${code}`,
    html: renderEmail({
      title: "Abstract Received",
      preheader: `Your submission code is ${code}. We'll notify you once reviewed.`,
      blocks: [
        { type: "text", html: `Dear ${esc(name)},` },
        {
          type: "text",
          html: `Thank you for submitting your abstract to <b>APTICON 2026</b>. It has been received and will be reviewed by our scientific committee.`,
        },
        { type: "code", label: "Your Submission Code", value: code },
        { type: "kv", rows: [{ label: "Abstract Title", value: title }] },
        {
          type: "text",
          html: `You can check the review status any time using your submission code and email.`,
        },
        {
          type: "button",
          label: "Check Submission Status",
          href: `${BASE_URL}/abstracts/status`,
        },
        {
          type: "callout",
          variant: "info",
          title: "Next step",
          body: `If you plan to present, please also complete your <a href="${BASE_URL}/registration" style="color:${BRAND.primary800};font-weight:700;">registration</a>. Presenting authors must be registered delegates.`,
        },
        { type: "signoff" },
      ],
    }),
  };
}

export function abstractDecisionEmail(
  name: string,
  code: string,
  title: string,
  decision: string,
  note?: string,
  abstractCode?: string,
  presentationType?: string,
) {
  const label: Record<string, string> = {
    accepted: "Accepted",
    rejected: "Not Accepted",
    revision_requested: "Revision Requested",
  };
  const variant: Record<string, "success" | "danger" | "warning"> = {
    accepted: "success",
    rejected: "danger",
    revision_requested: "warning",
  };
  const decisionLabel = label[decision] ?? decision;
  const cvariant = variant[decision] ?? "info";

  return {
    subject: `Abstract ${decisionLabel} — ${code}`,
    html: renderEmail({
      title: "Abstract Decision",
      preheader: `Decision on your submission ${code}: ${decisionLabel}.`,
      blocks: [
        { type: "text", html: `Dear ${esc(name)},` },
        {
          type: "text",
          html: `The scientific committee has completed the review of your abstract submission.`,
        },
        {
          type: "callout",
          variant: cvariant,
          title: `Decision: ${decisionLabel}`,
          body: `Submission <b>${esc(code)}</b> — <i>${esc(title)}</i>`,
        },
        ...(abstractCode
          ? [
              {
                type: "kv" as const,
                rows: [
                  {
                    label: `Abstract Code (${presentationType})`,
                    value: abstractCode,
                  },
                ],
              },
            ]
          : []),
        ...(note
          ? [
              {
                type: "callout" as const,
                variant: "info" as const,
                title: "Committee note",
                body: nl2br(note),
              },
            ]
          : []),
        decision === "revision_requested"
          ? {
              type: "button" as const,
              label: "Revise & Resubmit Abstract",
              href: `${BASE_URL}/abstracts/revise?code=${encodeURIComponent(code)}`,
            }
          : {
              type: "button" as const,
              label: "View full details",
              href: `${BASE_URL}/abstracts/status`,
            },
        ...(decision === "accepted"
          ? [
              {
                type: "callout" as const,
                variant: "info" as const,
                title: "Reminder",
                body: `Presenting authors must be registered delegates. Please ensure your <a href="${BASE_URL}/registration" style="color:${BRAND.primary800};font-weight:700;">registration</a> is complete.`,
              },
            ]
          : []),
        { type: "signoff" },
      ],
    }),
  };
}

export function abstractReviewFlaggedEmail(
  reviewerName: string,
  code: string,
  title: string,
  verdict: "reject" | "revise",
  comments: string,
) {
  const label =
    verdict === "reject" ? "Rejection recommended" : "Revision recommended";
  const cvariant = verdict === "reject" ? "danger" : "warning";

  return {
    subject: `Reviewer flagged ${code} — ${label}`,
    html: renderEmail({
      title: "Reviewer Recommendation",
      preheader: `${reviewerName} recommends ${verdict === "reject" ? "rejecting" : "revising"} submission ${code}.`,
      blocks: [
        {
          type: "text",
          html: `A reviewer has submitted a recommendation that needs your final decision.`,
        },
        {
          type: "callout",
          variant: cvariant,
          title: label,
          body: `Submission <b>${esc(code)}</b> — <i>${esc(title)}</i><br/>Reviewer: ${esc(reviewerName)}`,
        },
        {
          type: "callout",
          variant: "info",
          title: "Reviewer comments",
          body: nl2br(comments),
        },
        {
          type: "text",
          html: `This abstract has <b>not</b> been finalized — please review and record the final decision.`,
        },
        {
          type: "button",
          label: "Open Abstracts Console",
          href: `${BASE_URL}/admin/abstracts`,
        },
        { type: "signoff" },
      ],
    }),
  };
}

export function abstractResubmittedEmail(
  name: string,
  code: string,
  title: string,
) {
  return {
    subject: `Revised Abstract Received — ${code}`,
    html: renderEmail({
      title: "Revised Abstract Received",
      preheader: `Your revised submission ${code} has been received and is back under review.`,
      blocks: [
        { type: "text", html: `Dear ${esc(name)},` },
        {
          type: "text",
          html: `Thank you for revising your abstract. We've received your updated submission and it is back with our scientific committee for review.`,
        },
        { type: "code", label: "Your Submission Code", value: code },
        { type: "kv", rows: [{ label: "Abstract Title", value: title }] },
        {
          type: "text",
          html: `You can check the review status any time using your submission code and email.`,
        },
        {
          type: "button",
          label: "Check Submission Status",
          href: `${BASE_URL}/abstracts/status`,
        },
        { type: "signoff" },
      ],
    }),
  };
}

export function abstractResubmissionNoticeEmail(
  code: string,
  title: string,
  presentingAuthor: string,
) {
  return {
    subject: `Abstract Resubmitted — ${code}`,
    html: renderEmail({
      title: "Abstract Resubmitted",
      preheader: `${presentingAuthor} resubmitted a revised version of submission ${code}.`,
      blocks: [
        {
          type: "text",
          html: `A delegate has resubmitted a revised abstract that needs re-review.`,
        },
        {
          type: "callout",
          variant: "info",
          title: "Resubmitted",
          body: `Submission <b>${esc(code)}</b> — <i>${esc(title)}</i><br/>Presenting author: ${esc(presentingAuthor)}`,
        },
        {
          type: "button",
          label: "Open Abstracts Console",
          href: `${BASE_URL}/admin/abstracts`,
        },
        { type: "signoff" },
      ],
    }),
  };
}

// -- Registration lifecycle --

export function registrationSubmittedEmail(
  name: string,
  code: string,
  feeAmount: number,
  feeTierLabel: string,
) {
  return {
    subject: `Registration Received — ${code}`,
    html: renderEmail({
      title: "Registration Received",
      preheader: `Registration ${code} is under payment review.`,
      blocks: [
        { type: "text", html: `Dear ${esc(name)},` },
        {
          type: "text",
          html: `Thank you for registering for <b>APTICON 2026</b>. Your registration and payment proof have been received.`,
        },
        { type: "code", label: "Your Registration Code", value: code },
        {
          type: "kv",
          rows: [
            { label: "Fee tier", value: feeTierLabel },
            {
              label: "Fee amount",
              value: `₹${feeAmount.toLocaleString("en-IN")}`,
            },
          ],
        },
        {
          type: "callout",
          variant: "warning",
          title: "Payment under review",
          body: `Our team will verify your payment against the transaction number and proof you submitted. You'll receive a confirmation email once approved — usually within 2 working days.`,
        },
        {
          type: "button",
          label: "Check Registration Status",
          href: `${BASE_URL}/registration/status`,
        },
        { type: "signoff" },
      ],
    }),
  };
}

export async function registrationApprovedEmail(
  name: string,
  code: string,
  feeAmount: number,
  hasLinkedAbstract: boolean,
) {
  const nextStepsInfo = hasLinkedAbstract
    ? `We can see your abstract submission is linked to this registration — you're fully set up.`
    : `If you plan to present a paper or poster, please submit your abstract before <b>30 September 2026</b>.`;
  const qrCid = `qr-${code}`;
  const qrPng = await generateRegistrationQrPngBuffer(code);
  return {
    subject: `Registration Confirmed — ${code}`,
    html: renderEmail({
      title: "Registration Confirmed",
      preheader: `Your APTICON 2026 registration ${code} is confirmed.`,
      blocks: [
        { type: "text", html: `Dear ${esc(name)},` },
        {
          type: "callout",
          variant: "success",
          title: "Payment verified — you're all set!",
          body: `Your registration for <b>APTICON 2026</b> is confirmed. We look forward to welcoming you to Raipur on 24–25 October 2026.`,
        },
        { type: "code", label: "Your Registration Code", value: code },
        {
          type: "qr",
          cid: qrCid,
          caption: "Show this at the registration desk",
        },
        {
          type: "kv",
          rows: [
            {
              label: "Amount paid",
              value: `₹${feeAmount.toLocaleString("en-IN")}`,
            },
            {
              label: "Venue",
              value:
                "Pt. Deendayal Upadhyay Auditorium, G.E. Road, Raipur (C.G.)",
            },
            { label: "Dates", value: "24–25 October 2026" },
          ],
        },
        { type: "text", html: nextStepsInfo },
        ...(hasLinkedAbstract
          ? [
              {
                type: "button" as const,
                label: "View Abstract Status",
                href: `${BASE_URL}/abstracts/status`,
              },
            ]
          : [
              {
                type: "button" as const,
                label: "Submit an Abstract",
                href: `${BASE_URL}/abstracts`,
              },
            ]),
        {
          type: "callout",
          variant: "info",
          title: "Please save your registration code",
          body: `Bring this code (printed or on your phone) to the registration desk on arrival for kit collection.`,
        },
        { type: "signoff" },
      ],
    }),
    attachments: [
      { filename: `${code}-qr.png`, content: qrPng, contentId: qrCid },
    ] as EmailAttachment[],
  };
}

// -- Group registration lifecycle --

export function groupRegistrationSubmittedEmail(
  coordinatorName: string,
  groupCode: string,
  delegateCount: number,
  complimentaryCount: number,
  feeAmount: number,
) {
  return {
    subject: `Group Registration Payment Received — ${groupCode}`,
    html: renderEmail({
      title: "Group Payment Received",
      preheader: `Payment received for group registration ${groupCode}.`,
      blocks: [
        { type: "text", html: `Dear ${esc(coordinatorName)},` },
        {
          type: "text",
          html: `Thank you for registering your group of <b>${delegateCount}</b> delegates for <b>APTICON 2026</b>. Your payment has been received.`,
        },
        {
          type: "code",
          label: "Your Group Registration Code",
          value: groupCode,
        },
        {
          type: "kv",
          rows: [
            { label: "Delegates", value: String(delegateCount) },
            { label: "Complimentary", value: String(complimentaryCount) },
            {
              label: "Amount paid",
              value: `₹${feeAmount.toLocaleString("en-IN")}`,
            },
          ],
        },
        {
          type: "callout",
          variant: "info",
          title: "Payment received",
          body: `Your group registration is being processed automatically. Confirmation emails with individual registration codes and QR badges will follow shortly.`,
        },
        { type: "signoff" },
      ],
    }),
  };
}

export function groupRegistrationApprovedEmail(
  coordinatorName: string,
  groupCode: string,
  delegateCount: number,
) {
  return {
    subject: `Group Registration Confirmed — ${groupCode}`,
    html: renderEmail({
      title: "Group Registration Confirmed",
      preheader: `Your group registration ${groupCode} is confirmed.`,
      blocks: [
        { type: "text", html: `Dear ${esc(coordinatorName)},` },
        {
          type: "callout",
          variant: "success",
          title: "Group confirmed",
          body: `Your group of <b>${delegateCount}</b> delegates is confirmed for <b>APTICON 2026</b>. Each delegate has been emailed their own registration code and QR badge separately.`,
        },
        {
          type: "code",
          label: "Your Group Registration Code",
          value: groupCode,
        },
        {
          type: "text",
          html: `Please make sure every delegate checks their inbox (including spam) for their individual confirmation.`,
        },
        { type: "signoff" },
      ],
    }),
  };
}

export function groupRegistrationRejectedEmail(
  coordinatorName: string,
  groupCode: string,
  reviewNote: string,
) {
  return {
    subject: `Group Registration Not Confirmed — ${groupCode}`,
    html: renderEmail({
      title: "Group Registration Not Confirmed",
      preheader: `Your group registration ${groupCode} could not be confirmed.`,
      blocks: [
        { type: "text", html: `Dear ${esc(coordinatorName)},` },
        {
          type: "callout",
          variant: "danger",
          title: "Not confirmed",
          body: `We're sorry, but your group registration could not be confirmed.`,
        },
        {
          type: "callout",
          variant: "info",
          title: "Reason",
          body: nl2br(reviewNote),
        },
        {
          type: "text",
          html: `A refund for the amount paid will be processed to your original payment method. If you have questions, please contact the organising committee.`,
        },
        { type: "signoff" },
      ],
    }),
  };
}

// -- Nudges --

export function nudgeRegisterEmail(name: string, abstractCode: string) {
  return {
    subject: `Registration required to present — ${abstractCode}`,
    html: renderEmail({
      title: "Complete Your Registration",
      preheader: `Your abstract ${abstractCode} is on record, but registration is still pending.`,
      blocks: [
        { type: "text", html: `Dear ${esc(name)},` },
        {
          type: "text",
          html: `We see you have submitted an abstract (<b>${esc(abstractCode)}</b>) for APTICON 2026 — thank you!`,
        },
        {
          type: "callout",
          variant: "warning",
          title: "Registration still pending",
          body: `Only registered delegates may present at the convention. To confirm your slot, please complete registration.`,
        },
        {
          type: "button",
          label: "Register Now",
          href: `${BASE_URL}/registration`,
        },
        {
          type: "text",
          html: `Early-bird rates end <b>15 September 2026</b>.`,
        },
        { type: "signoff" },
      ],
    }),
  };
}

export function nudgeAbstractEmail(name: string, registrationCode: string) {
  return {
    subject: `Submit your abstract — ${registrationCode}`,
    html: renderEmail({
      title: "Consider Submitting an Abstract",
      preheader: `You're registered for APTICON 2026 — consider presenting your research.`,
      blocks: [
        { type: "text", html: `Dear ${esc(name)},` },
        {
          type: "text",
          html: `Thank you for registering (<b>${esc(registrationCode)}</b>) for APTICON 2026. If you'd like to present your research, the call for abstracts is open until <b>30 September 2026</b>.`,
        },
        {
          type: "callout",
          variant: "info",
          title: "Themes",
          body: `Pharmaceutical Education Innovation · Drug Discovery · Clinical Pharmacy · Pharmacovigilance · Herbal & Traditional Medicine · Regulatory Affairs · Community Pharmacy`,
        },
        {
          type: "button",
          label: "Submit an Abstract",
          href: `${BASE_URL}/abstracts`,
        },
        { type: "signoff" },
      ],
    }),
  };
}

// -- Reviewer / user account --

export function reviewerAssignmentEmail(reviewerName: string, count: number) {
  return {
    subject: `New Abstract Assignment (${count})`,
    html: renderEmail({
      title: "New Review Assignment",
      preheader: `${count} new abstract${count === 1 ? "" : "s"} assigned for your review.`,
      blocks: [
        { type: "text", html: `Dear ${esc(reviewerName)},` },
        {
          type: "text",
          html: `You have been assigned <b>${count}</b> new abstract${count === 1 ? "" : "s"} to review for APTICON 2026.`,
        },
        {
          type: "button",
          label: "Open Reviewer Console",
          href: `${BASE_URL}/reviewer/login`,
        },
        {
          type: "text",
          html: `Please try to submit your reviews within 7 days. If you have a conflict of interest with any assigned abstract, contact the organising committee.`,
        },
        { type: "signoff" },
      ],
    }),
  };
}

export function newUserWelcomeEmail(
  name: string,
  email: string,
  tempPassword: string,
  role: string,
) {
  const roleLabel =
    role === "super_admin"
      ? "Super Administrator"
      : role === "editorial"
        ? "Editorial"
        : role === "checkin_staff"
          ? "Check-in Staff"
          : "Reviewer";

  // checkin_staff has no web console — they sign in from the APTICON Staff mobile app instead,
  // so there's no login URL to link to.
  const isMobileOnly = role === "checkin_staff";
  const loginPath =
    role === "super_admin"
      ? "/admin/login"
      : role === "editorial"
        ? "/editorial/login"
        : "/reviewer/login";

  return {
    subject: "Your APTICON 2026 Account",
    html: renderEmail({
      title: "Account Created",
      preheader: `Your APTICON 2026 ${roleLabel} account credentials.`,
      blocks: [
        { type: "text", html: `Dear ${esc(name)},` },
        {
          type: "text",
          html: `An account has been created for you on the APTICON 2026 platform with the role of <b>${esc(roleLabel)}</b>.`,
        },
        {
          type: "kv",
          rows: [
            { label: "Email", value: email },
            { label: "Temporary Password", value: tempPassword },
          ],
        },
        {
          type: "callout",
          variant: "warning",
          title: "Change your password on first login",
          body: `For your account's security, please sign in and change the temporary password immediately.`,
        },
        ...(isMobileOnly
          ? [
              {
                type: "text" as const,
                html: `Open the <b>APTICON Staff</b> mobile app and sign in with the email and temporary password above.`,
              },
            ]
          : [
              {
                type: "button" as const,
                label: "Log in",
                href: `${BASE_URL}${loginPath}`,
              },
            ]),
        { type: "signoff" },
      ],
    }),
  };
}

export function passwordResetEmail(name: string, token: string, role: string) {
  const path =
    role === "super_admin"
      ? "/admin/reset-password"
      : role === "editorial"
        ? "/editorial/reset-password"
        : "/reviewer/reset-password";
  const link = `${BASE_URL}${path}?token=${encodeURIComponent(token)}`;

  return {
    subject: "Password Reset Request",
    html: renderEmail({
      title: "Password Reset",
      preheader: `Reset your APTICON 2026 password. Link valid for 30 minutes.`,
      blocks: [
        { type: "text", html: `Dear ${esc(name)},` },
        {
          type: "text",
          html: `We received a request to reset your APTICON 2026 password. Click the button below to set a new password. This link is valid for <b>30 minutes</b>.`,
        },
        { type: "button", label: "Reset Password", href: link },
        {
          type: "callout",
          variant: "info",
          body: `If you did not request this reset, you can safely ignore this email — your password will not change.`,
        },
        { type: "signoff" },
      ],
    }),
  };
}
