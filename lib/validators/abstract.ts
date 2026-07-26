import { z } from "zod";
import { ABSTRACT_THEMES } from "@/lib/constants";

export const abstractSubmitSchema = z.object({
  title: z.string().min(5).max(300).trim(),
  authors: z.string().min(3).max(1000).trim(),
  presentingAuthor: z.string().min(2).max(200).trim(),
  institution: z.string().min(2).max(300).trim(),
  email: z.string().email().toLowerCase().trim(),
  phone: z.string().min(6).max(30).trim(),
  theme: z.string().refine((v) => ABSTRACT_THEMES.includes(v), "Invalid theme"),
  type: z.enum(["oral", "poster"]),
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

export const PRESIGN_ABSTRACT_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const;

export const PRESIGN_PAYMENT_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export const presignRequestSchema = z.object({
  fileName: z.string().min(1).max(300),
  contentType: z.enum([...PRESIGN_ABSTRACT_TYPES, ...PRESIGN_PAYMENT_TYPES]),
  size: z.number().int().positive().max(10 * 1024 * 1024), // 10 MB
  purpose: z.enum(["abstract", "payment_proof"]).default("abstract"),
});

export type AbstractSubmitInput = z.infer<typeof abstractSubmitSchema>;
export type AbstractStatusLookupInput = z.infer<typeof abstractStatusLookupSchema>;
export type AbstractAssignInput = z.infer<typeof abstractAssignSchema>;
export type AbstractDecisionInput = z.infer<typeof abstractDecisionSchema>;
export type PresignRequestInput = z.infer<typeof presignRequestSchema>;
