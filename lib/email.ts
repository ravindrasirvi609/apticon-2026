/**
 * Unified transactional email system.
 *
 *   All templates funnel through `renderEmail({ title, preheader, blocks })`
 *   so every delegate/reviewer/admin message has an identical visual identity
 *   matching the APTICON 2026 website — crimson header, gold accent bar,
 *   Playfair display-like typography, cream section backgrounds, gold divider
 *   footer.
 *
 *   User-controlled fields ALWAYS pass through `esc()` before interpolation.
 */

import { Resend } from "resend";

const KEY = process.env.RESEND_API_KEY ?? "";
const FROM = process.env.RESEND_FROM ?? "APTICON 2026 <onboarding@resend.dev>";
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? process.env.DOMAIN ?? "http://localhost:3000";

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
  crimson900: "#6B0F0F",
  crimson800: "#8B1A1A",
  crimson700: "#A52020",
  gold500:    "#D4AF37",
  gold400:    "#F5C842",
  gold300:    "#FFD95A",
  navy800:    "#1A237E",
  cream50:    "#FFFDE7",
  cream100:   "#FFF8E1",
  cream200:   "#FFECB3",
  dark:       "#1A1A2E",
  muted:      "#5D4037",
  emerald:    "#059669",
  emerald50:  "#ECFDF5",
  amber:      "#D97706",
  amber50:    "#FEF3C7",
  red:        "#DC2626",
  red50:      "#FEE2E2",
};

// ─── Block builders (compose an email body) ────────────────
export type EmailBlock =
  | { type: "text";     html: string }                                                          // pre-escaped HTML paragraph
  | { type: "heading";  text: string }                                                          // small H2
  | { type: "code";     label: string; value: string }                                          // big monospace code card
  | { type: "kv";       rows: { label: string; value: string }[] }                              // key/value rows
  | { type: "callout";  variant: "info" | "success" | "warning" | "danger"; title?: string; body: string }
  | { type: "button";   label: string; href: string; variant?: "primary" | "secondary" }
  | { type: "divider" }
  | { type: "signoff";  text?: string };                                                        // "Warm regards, …" block

function renderBlock(b: EmailBlock): string {
  switch (b.type) {
    case "text":
      return `<p style="margin:0 0 14px 0;font-size:14px;line-height:1.65;color:${BRAND.dark};">${b.html}</p>`;

    case "heading":
      return `<h2 style="margin:24px 0 12px 0;font-size:18px;font-weight:800;color:${BRAND.crimson800};">${esc(b.text)}</h2>`;

    case "code":
      return `
        <div style="background:${BRAND.cream100};border-left:4px solid ${BRAND.gold500};padding:16px 20px;margin:20px 0;border-radius:4px;">
          <div style="font-size:11px;letter-spacing:.15em;text-transform:uppercase;color:${BRAND.muted};font-weight:700;">${esc(b.label)}</div>
          <div style="font-size:22px;font-weight:900;color:${BRAND.crimson800};margin-top:6px;font-family:'Courier New',monospace;letter-spacing:1px;">${esc(b.value)}</div>
        </div>`;

    case "kv":
      return `
        <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;margin:16px 0;border-collapse:collapse;">
          ${b.rows.map((r) => `
            <tr>
              <td style="padding:6px 12px 6px 0;font-size:12px;text-transform:uppercase;letter-spacing:.1em;color:${BRAND.muted};font-weight:700;white-space:nowrap;vertical-align:top;">${esc(r.label)}</td>
              <td style="padding:6px 0;font-size:14px;color:${BRAND.dark};">${esc(r.value)}</td>
            </tr>`).join("")}
        </table>`;

    case "callout": {
      const bg = b.variant === "success" ? BRAND.emerald50
              : b.variant === "warning" ? BRAND.amber50
              : b.variant === "danger"  ? BRAND.red50
              : BRAND.cream100;
      const bar = b.variant === "success" ? BRAND.emerald
              : b.variant === "warning" ? BRAND.amber
              : b.variant === "danger"  ? BRAND.red
              : BRAND.gold500;
      const titleHtml = b.title
        ? `<div style="font-weight:800;color:${bar};margin-bottom:6px;font-size:14px;">${esc(b.title)}</div>` : "";
      return `
        <div style="background:${bg};border-left:4px solid ${bar};padding:14px 18px;margin:18px 0;border-radius:6px;">
          ${titleHtml}
          <div style="font-size:14px;line-height:1.6;color:${BRAND.dark};">${b.body}</div>
        </div>`;
    }

    case "button": {
      const bg = b.variant === "secondary" ? "transparent" : BRAND.crimson800;
      const color = b.variant === "secondary" ? BRAND.crimson800 : "#ffffff";
      const border = b.variant === "secondary" ? `1px solid ${BRAND.crimson800}` : "none";
      return `
        <div style="margin:20px 0;">
          <a href="${esc(b.href)}" style="display:inline-block;background:${bg};color:${color};padding:12px 22px;border-radius:8px;font-weight:700;text-decoration:none;font-size:14px;border:${border};">
            ${esc(b.label)}
          </a>
        </div>`;
    }

    case "divider":
      return `<div style="height:1px;background:${BRAND.gold500};opacity:.25;margin:18px 0;"></div>`;

    case "signoff":
      return `<p style="margin:24px 0 0 0;font-size:14px;color:${BRAND.dark};line-height:1.6;">${b.text ?? "Warm regards,"}<br/><b>APTICON 2026 Organising Committee</b></p>`;
  }
}

// ─── Master template ────────────────────────────────────────
interface RenderOpts {
  title: string;        // headline in the branded header
  preheader?: string;   // hidden inbox preview text
  blocks: EmailBlock[];
}

export function renderEmail({ title, preheader, blocks }: RenderOpts): string {
  const body = blocks.map(renderBlock).join("\n");
  return `<!doctype html>
<html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>${esc(title)}</title></head>
<body style="margin:0;padding:0;background:${BRAND.cream50};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:${BRAND.dark};">
  ${preheader ? `<div style="display:none;overflow:hidden;line-height:1px;opacity:0;max-height:0;max-width:0;">${esc(preheader)}</div>` : ""}
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.cream50};padding:24px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 6px 24px rgba(139,26,26,0.08);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,${BRAND.crimson800},${BRAND.crimson900});padding:28px 32px;color:#fff;position:relative;">
              <div style="font-size:11px;letter-spacing:.24em;text-transform:uppercase;color:${BRAND.gold400};font-weight:700;">APTICON 2026</div>
              <div style="font-size:22px;font-weight:900;margin-top:6px;font-family:Georgia,serif;">${esc(title)}</div>
              <div style="height:3px;width:60px;background:${BRAND.gold500};margin-top:14px;border-radius:2px;"></div>
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
            <td style="background:${BRAND.cream100};padding:20px 32px;font-size:12px;color:${BRAND.muted};border-top:2px solid ${BRAND.gold500};">
              <div style="font-weight:700;color:${BRAND.crimson800};margin-bottom:4px;">APTICON 2026 · 28th Annual National Convention</div>
              <div>24–25 October 2026 · Pt. Deendayal Upadhyay Auditorium, G.E. Road, Raipur (C.G.)</div>
              <div>Hosted by APTI Chhattisgarh · Pt. Ravishankar Shukla University</div>
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
interface SendOpts { to: string; subject: string; html: string }
export async function sendMail({ to, subject, html }: SendOpts) {
  if (!KEY) {
    console.warn("[email] RESEND_API_KEY missing — skipping send to", to);
    return { skipped: true as const };
  }
  return resend.emails.send({ from: FROM, to, subject, html });
}

// ─── Templates ──────────────────────────────────────────────

// -- Abstract lifecycle --

export function abstractSubmittedEmail(name: string, code: string, title: string) {
  return {
    subject: `Abstract Received — ${code}`,
    html: renderEmail({
      title: "Abstract Received",
      preheader: `Your submission code is ${code}. We'll notify you once reviewed.`,
      blocks: [
        { type: "text", html: `Dear ${esc(name)},` },
        { type: "text", html: `Thank you for submitting your abstract to <b>APTICON 2026</b>. It has been received and will be reviewed by our scientific committee.` },
        { type: "code", label: "Your Submission Code", value: code },
        { type: "kv", rows: [{ label: "Abstract Title", value: title }] },
        { type: "text", html: `You can check the review status any time using your submission code and email.` },
        { type: "button", label: "Check Submission Status", href: `${BASE_URL}/abstracts/status` },
        { type: "callout", variant: "info", title: "Next step", body: `If you plan to present, please also complete your <a href="${BASE_URL}/registration" style="color:${BRAND.crimson800};font-weight:700;">registration</a>. Presenting authors must be registered delegates.` },
        { type: "signoff" },
      ],
    }),
  };
}

export function abstractDecisionEmail(name: string, code: string, title: string, decision: string, note?: string, abstractCode?: string, presentationType?: string) {
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
        { type: "text", html: `The scientific committee has completed the review of your abstract submission.` },
        { type: "callout", variant: cvariant, title: `Decision: ${decisionLabel}`, body: `Submission <b>${esc(code)}</b> — <i>${esc(title)}</i>` },
        ...(abstractCode ? [{ type: "kv" as const, rows: [{ label: `Abstract Code (${presentationType})`, value: abstractCode }] }] : []),
        ...(note ? [{ type: "callout" as const, variant: "info" as const, title: "Committee note", body: nl2br(note) }] : []),
        { type: "button", label: "View full details", href: `${BASE_URL}/abstracts/status` },
        ...(decision === "accepted" ? [{ type: "callout" as const, variant: "info" as const, title: "Reminder", body: `Presenting authors must be registered delegates. Please ensure your <a href="${BASE_URL}/registration" style="color:${BRAND.crimson800};font-weight:700;">registration</a> is complete.` }] : []),
        { type: "signoff" },
      ],
    }),
  };
}

// -- Registration lifecycle --

export function registrationSubmittedEmail(name: string, code: string, feeAmount: number, feeTierLabel: string) {
  return {
    subject: `Registration Received — ${code}`,
    html: renderEmail({
      title: "Registration Received",
      preheader: `Registration ${code} is under payment review.`,
      blocks: [
        { type: "text", html: `Dear ${esc(name)},` },
        { type: "text", html: `Thank you for registering for <b>APTICON 2026</b>. Your registration and payment proof have been received.` },
        { type: "code", label: "Your Registration Code", value: code },
        { type: "kv", rows: [
          { label: "Fee tier",   value: feeTierLabel },
          { label: "Fee amount", value: `₹${feeAmount.toLocaleString("en-IN")}` },
        ]},
        { type: "callout", variant: "warning", title: "Payment under review", body: `Our team will verify your payment against the transaction number and proof you submitted. You'll receive a confirmation email once approved — usually within 2 working days.` },
        { type: "button", label: "Check Registration Status", href: `${BASE_URL}/registration/status` },
        { type: "signoff" },
      ],
    }),
  };
}

export function registrationApprovedEmail(name: string, code: string, feeAmount: number, hasLinkedAbstract: boolean) {
  const nextStepsInfo = hasLinkedAbstract
    ? `We can see your abstract submission is linked to this registration — you're fully set up.`
    : `If you plan to present a paper or poster, please submit your abstract before <b>30 September 2026</b>.`;
  return {
    subject: `Registration Confirmed — ${code}`,
    html: renderEmail({
      title: "Registration Confirmed",
      preheader: `Your APTICON 2026 registration ${code} is confirmed.`,
      blocks: [
        { type: "text", html: `Dear ${esc(name)},` },
        { type: "callout", variant: "success", title: "Payment verified — you're all set!", body: `Your registration for <b>APTICON 2026</b> is confirmed. We look forward to welcoming you to Raipur on 24–25 October 2026.` },
        { type: "code", label: "Your Registration Code", value: code },
        { type: "kv", rows: [
          { label: "Amount paid", value: `₹${feeAmount.toLocaleString("en-IN")}` },
          { label: "Venue",       value: "Pt. Deendayal Upadhyay Auditorium, G.E. Road, Raipur (C.G.)" },
          { label: "Dates",       value: "24–25 October 2026" },
        ]},
        { type: "text", html: nextStepsInfo },
        ...(hasLinkedAbstract
          ? [{ type: "button" as const, label: "View Abstract Status", href: `${BASE_URL}/abstracts/status` }]
          : [{ type: "button" as const, label: "Submit an Abstract", href: `${BASE_URL}/abstracts` }]),
        { type: "callout", variant: "info", title: "Please save your registration code", body: `Bring this code (printed or on your phone) to the registration desk on arrival for kit collection.` },
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
        { type: "text", html: `We see you have submitted an abstract (<b>${esc(abstractCode)}</b>) for APTICON 2026 — thank you!` },
        { type: "callout", variant: "warning", title: "Registration still pending", body: `Only registered delegates may present at the convention. To confirm your slot, please complete registration.` },
        { type: "button", label: "Register Now", href: `${BASE_URL}/registration` },
        { type: "text", html: `Early-bird rates end <b>31 August 2026</b>.` },
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
        { type: "text", html: `Thank you for registering (<b>${esc(registrationCode)}</b>) for APTICON 2026. If you'd like to present your research, the call for abstracts is open until <b>30 September 2026</b>.` },
        { type: "callout", variant: "info", title: "Themes", body: `Pharmaceutical Education Innovation · Drug Discovery · Clinical Pharmacy · Pharmacovigilance · Herbal & Traditional Medicine · Regulatory Affairs · Community Pharmacy` },
        { type: "button", label: "Submit an Abstract", href: `${BASE_URL}/abstracts` },
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
        { type: "text", html: `You have been assigned <b>${count}</b> new abstract${count === 1 ? "" : "s"} to review for APTICON 2026.` },
        { type: "button", label: "Open Reviewer Console", href: `${BASE_URL}/reviewer/login` },
        { type: "text", html: `Please try to submit your reviews within 7 days. If you have a conflict of interest with any assigned abstract, contact the organising committee.` },
        { type: "signoff" },
      ],
    }),
  };
}

export function newUserWelcomeEmail(name: string, email: string, tempPassword: string, role: string) {
  const roleLabel = role === "super_admin" ? "Super Administrator"
                   : role === "editorial" ? "Editorial"
                   : role === "checkin_staff" ? "Check-in Staff"
                   : "Reviewer";

  // checkin_staff has no web console — they sign in from the APTICON Staff mobile app instead,
  // so there's no login URL to link to.
  const isMobileOnly = role === "checkin_staff";
  const loginPath = role === "super_admin" ? "/admin/login"
                   : role === "editorial" ? "/editorial/login"
                   : "/reviewer/login";

  return {
    subject: "Your APTICON 2026 Account",
    html: renderEmail({
      title: "Account Created",
      preheader: `Your APTICON 2026 ${roleLabel} account credentials.`,
      blocks: [
        { type: "text", html: `Dear ${esc(name)},` },
        { type: "text", html: `An account has been created for you on the APTICON 2026 platform with the role of <b>${esc(roleLabel)}</b>.` },
        { type: "kv", rows: [
          { label: "Email",              value: email },
          { label: "Temporary Password", value: tempPassword },
        ]},
        { type: "callout", variant: "warning", title: "Change your password on first login", body: `For your account's security, please sign in and change the temporary password immediately.` },
        ...(isMobileOnly
          ? [{ type: "text" as const, html: `Open the <b>APTICON Staff</b> mobile app and sign in with the email and temporary password above.` }]
          : [{ type: "button" as const, label: "Log in", href: `${BASE_URL}${loginPath}` }]),
        { type: "signoff" },
      ],
    }),
  };
}

export function passwordResetEmail(name: string, token: string, role: string) {
  const path = role === "super_admin" ? "/admin/reset-password"
              : role === "editorial" ? "/editorial/reset-password"
              : "/reviewer/reset-password";
  const link = `${BASE_URL}${path}?token=${encodeURIComponent(token)}`;

  return {
    subject: "Password Reset Request",
    html: renderEmail({
      title: "Password Reset",
      preheader: `Reset your APTICON 2026 password. Link valid for 30 minutes.`,
      blocks: [
        { type: "text", html: `Dear ${esc(name)},` },
        { type: "text", html: `We received a request to reset your APTICON 2026 password. Click the button below to set a new password. This link is valid for <b>30 minutes</b>.` },
        { type: "button", label: "Reset Password", href: link },
        { type: "callout", variant: "info", body: `If you did not request this reset, you can safely ignore this email — your password will not change.` },
        { type: "signoff" },
      ],
    }),
  };
}
