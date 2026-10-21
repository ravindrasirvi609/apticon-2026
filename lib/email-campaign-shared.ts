/**
 * Bulk-email definitions shared by the admin UI and the API.
 *
 * Pure module (no server imports) so the compose screen can show the same variable list,
 * limits and unknown-variable warnings that the server enforces.
 */

// ─── Dynamic variables ──────────────────────────────────────
export interface EmailVariable {
  key: string;
  label: string;
  /** Value used in previews and test sends. */
  sample: string;
}

export const EMAIL_VARIABLES: readonly EmailVariable[] = [
  { key: "name", label: "Full name", sample: "Dr. Asha Verma" },
  { key: "first_name", label: "First name", sample: "Asha" },
  { key: "email", label: "Email address", sample: "asha.verma@example.com" },
  { key: "institution", label: "Institution", sample: "Pt. Ravishankar Shukla University" },
  { key: "designation", label: "Designation", sample: "Assistant Professor" },
  { key: "city", label: "City", sample: "Raipur" },
  { key: "category", label: "Registration category", sample: "APTI Life Member" },
  { key: "registration_code", label: "Registration code", sample: "APTI-2026-0042" },
  { key: "registration_status", label: "Registration status", sample: "Confirmed" },
  { key: "payment_status", label: "Payment status", sample: "Paid" },
  { key: "fee_amount", label: "Fee amount", sample: "₹ 3,500" },
  { key: "submission_code", label: "Abstract submission code", sample: "ABS-2026-0017" },
  { key: "abstract_title", label: "Abstract title", sample: "Nano-formulations for targeted delivery" },
  { key: "abstract_status", label: "Abstract status", sample: "Accepted" },
  { key: "abstract_count", label: "Number of abstracts", sample: "1" },
  { key: "event_name", label: "Event name", sample: "APTICON 2026" },
  { key: "event_dates", label: "Event dates", sample: "24–25 October 2026" },
  { key: "venue", label: "Venue", sample: "Pt. Deendayal Upadhyay Auditorium, Raipur" },
  { key: "site_url", label: "Website URL", sample: "https://apticon2026.in" },
];

export const EMAIL_VARIABLE_KEYS: ReadonlySet<string> = new Set(
  EMAIL_VARIABLES.map((v) => v.key),
);

export function sampleVariables(): Record<string, string> {
  return Object.fromEntries(EMAIL_VARIABLES.map((v) => [v.key, v.sample]));
}

/**
 * `{{name}}` or `{{name|Delegate}}` — the text after `|` is used when the recipient has no
 * value for that variable (e.g. an extra address that isn't in the delegate list).
 */
const VARIABLE_RE = /\{\{\s*([A-Za-z_][A-Za-z0-9_]*)\s*(?:\|([^{}]*))?\}\}/g;

export function findUsedVariables(...texts: string[]): string[] {
  const found = new Set<string>();
  for (const text of texts) {
    for (const m of text.matchAll(VARIABLE_RE)) found.add(m[1]);
  }
  return [...found];
}

export function findUnknownVariables(...texts: string[]): string[] {
  return findUsedVariables(...texts).filter((k) => !EMAIL_VARIABLE_KEYS.has(k));
}

export function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Replace every `{{variable}}` in `template`. Literal text and substituted values are escaped
 * independently so a delegate's name can never inject markup, while an admin-authored HTML
 * body (escapeLiteral = identity) keeps its tags.
 */
export function interpolate(
  template: string,
  vars: Record<string, string>,
  escapeLiteral: (s: string) => string,
  escapeValue: (s: string) => string,
): string {
  let out = "";
  let last = 0;
  for (const m of template.matchAll(VARIABLE_RE)) {
    out += escapeLiteral(template.slice(last, m.index));
    const value = (vars[m[1]] ?? "").trim();
    out += escapeValue(value || (m[2] ?? "").trim());
    last = m.index + m[0].length;
  }
  return out + escapeLiteral(template.slice(last));
}

// ─── Limits ─────────────────────────────────────────────────
export const EMAIL_MAX_RECIPIENTS = 5000;

/**
 * Attachments are uploaded through a serverless route, whose request body is capped at about
 * 4.5 MB on Vercel — keep the per-file limit safely under that. The total stays well below
 * Resend's 40 MB per-message cap.
 */
export const EMAIL_ATTACHMENT_MAX_BYTES = 4 * 1024 * 1024;
export const EMAIL_ATTACHMENT_MAX_FILES = 5;
export const EMAIL_ATTACHMENT_MAX_TOTAL_BYTES = 20 * 1024 * 1024;
export const EMAIL_ATTACHMENT_KEY_PREFIX = "email-attachments/";

/** Allowed attachment extensions → content type. Extension is authoritative; browsers often send no MIME. */
export const EMAIL_ATTACHMENT_TYPES: Record<string, string> = {
  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xls: "application/vnd.ms-excel",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ppt: "application/vnd.ms-powerpoint",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  csv: "text/csv",
  txt: "text/plain",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  zip: "application/zip",
};

export function attachmentExtension(filename: string): string {
  const dot = filename.lastIndexOf(".");
  return dot === -1 ? "" : filename.slice(dot + 1).toLowerCase();
}

export type EmailBodyFormat = "text" | "html";

export interface CampaignAttachment {
  key: string;
  filename: string;
  size: number;
  contentType: string;
}

export const DEFAULT_EMAIL_BODY = `Dear {{name|Delegate}},

Write your message here. Use the "Insert variable" menu to personalise it — for example your registration code is **{{registration_code|not available yet}}**.`;
