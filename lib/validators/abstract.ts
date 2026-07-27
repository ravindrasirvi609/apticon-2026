import { z } from "zod";
import { ABSTRACT_THEMES } from "@/lib/constants";

export const abstractSubmitSchema = z.object({
  title: z.string().min(5).max(300).trim(),
  authors: z.string().min(3).max(1000).trim(),
  presentingAuthor: z.string().min(2).max(200).trim(),
  institution: z.string().min(2).max(300).trim(),
  email: z.string().email().toLowerCase().trim(),
  phone: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
  theme: z.string().refine((v) => ABSTRACT_THEMES.includes(v), "Invalid theme"),
  type: z.enum(["review", "research"]),
  abstract: z.string().min(100).max(3500).trim(),
  fileKey: z.string().optional(),
  fileName: z.string().optional(),
});

export const abstractStatusLookupSchema = z.object({
  code: z.string().min(4).max(50).trim(),
  email: z.string().email().toLowerCase().trim(),
});

export const abstractAssignSchema = z.object({
  reviewerIds: z.array(z.string().length(24)).min(1).max(10),
});

export const abstractDecisionSchema = z.object({
  decision: z.enum(["accepted", "rejected", "revision_requested"]),
  note: z.string().max(2000).optional(),
});

export const UPLOAD_ABSTRACT_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const;

export const UPLOAD_PAYMENT_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export const uploadRequestSchema = z.object({
  purpose: z.enum(["abstract", "payment_proof"]).default("abstract"),
});

export type AbstractSubmitInput = z.infer<typeof abstractSubmitSchema>;
export type AbstractStatusLookupInput = z.infer<typeof abstractStatusLookupSchema>;
export type AbstractAssignInput = z.infer<typeof abstractAssignSchema>;
export type AbstractDecisionInput = z.infer<typeof abstractDecisionSchema>;
export type UploadRequestInput = z.infer<typeof uploadRequestSchema>;
