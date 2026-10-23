import { z } from "zod";
import {
  EMAIL_ATTACHMENT_MAX_FILES,
  EMAIL_MAX_RECIPIENTS,
  findUnknownVariables,
} from "@/lib/email-campaign-shared";

const attachmentSchema = z.object({
  key: z.string().min(1).max(300),
  filename: z
    .string()
    .trim()
    .min(1)
    .max(150)
    // Header-safe: no path separators or control characters in the name recipients see.
    .transform((s) => s.replace(/[\/\u0000-\u001f]/g, "_")),
  size: z.number().int().min(0),
  contentType: z.string().max(150),
});

const contentFields = {
  subject: z.string().trim().min(1, "Subject is required").max(200),
  headline: z.string().trim().max(120).default(""),
  body: z.string().trim().min(1, "Message body is required").max(50_000),
  bodyFormat: z.enum(["text", "html"]).default("text"),
  replyTo: z
    .union([z.literal(""), z.string().trim().toLowerCase().email()])
    .default(""),
  attachments: z.array(attachmentSchema).max(EMAIL_ATTACHMENT_MAX_FILES).default([]),
};

/** Reject `{{typo}}` before it can reach delegates as a blank. */
function rejectUnknownVariables(
  data: { subject: string; headline: string; body: string },
  ctx: z.RefinementCtx,
) {
  const unknown = findUnknownVariables(data.subject, data.headline, data.body);
  if (unknown.length > 0)
    ctx.addIssue({
      code: "custom",
      path: ["body"],
      message: `Unknown variable${unknown.length > 1 ? "s" : ""}: ${unknown.map((k) => `{{${k}}}`).join(", ")}`,
    });
}

export const emailCampaignSchema = z
  .object({
    ...contentFields,
    emails: z
      .array(z.string().trim().toLowerCase().email())
      .min(1, "Select at least one recipient")
      .max(EMAIL_MAX_RECIPIENTS),
  })
  .superRefine(rejectUnknownVariables);

export const emailPreviewSchema = z
  .object({
    subject: z.string().trim().max(200).default(""),
    headline: z.string().trim().max(120).default(""),
    body: z.string().max(50_000).default(""),
    bodyFormat: contentFields.bodyFormat,
    /** When set, the preview uses this person's real data instead of sample values. */
    recipientEmail: z.string().trim().toLowerCase().email().optional(),
  })
  .superRefine(rejectUnknownVariables);

export const emailTestSchema = z
  .object({
    ...contentFields,
    to: z.string().trim().toLowerCase().email(),
  })
  .superRefine(rejectUnknownVariables);

export const campaignActionSchema = z.object({
  action: z.enum(["send", "retry_failed", "cancel"]).default("send"),
  /** Clears a previous halt (quota/key problem) before sending — set when the admin presses Resume. */
  resume: z.boolean().default(false),
});

export type EmailCampaignInput = z.infer<typeof emailCampaignSchema>;
