import { z } from "zod";
import { ABSTRACT_THEMES } from "@/lib/constants";

export const MAX_CO_AUTHORS = 10;

export const abstractSubmitSchema = z.object({
  title: z.string().min(5).max(300).trim(),
  coAuthors: z
    .array(
      z.object({
        name: z.string().min(2).max(200).trim(),
        institution: z.string().min(2).max(300).trim(),
      })
    )
    .max(MAX_CO_AUTHORS)
    .default([]),
  presentingAuthor: z.string().min(2).max(200).trim(),
  institution: z.string().min(2).max(300).trim(),
  email: z.string().email().toLowerCase().trim(),
  phone: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
  aptiMemberId: z.string().trim().min(3, "APTI Membership ID is required to submit an abstract"),
  theme: z.string().refine((v) => ABSTRACT_THEMES.includes(v), "Invalid theme"),
  type: z.enum(["review", "research"]),
  abstract: z.string().min(100).max(3800).trim(),
  preferredPresentationType: z.enum(["oral", "poster"]).optional(),
  keywords: z
    .string()
    .min(3)
    .max(300)
    .transform((v) => v.split(",").map((s) => s.trim()).filter(Boolean))
    .refine((arr) => arr.length >= 1 && arr.length <= 8, "Provide 1–8 keywords"),
  fileKey: z.string().min(1, "Please attach your abstract file"),
  fileName: z.string().min(1),
  graphicalAbstractKey: z.string().optional(),
  graphicalAbstractName: z.string().optional(),
});

export const abstractStatusLookupSchema = z.object({
  code: z.string().min(4).max(50).trim(),
  email: z.string().email().toLowerCase().trim(),
});

export const abstractResubmitSchema = z.object({
  code: z.string().min(4).max(50).trim(),
  email: z.string().email().toLowerCase().trim(),
  abstract: z.string().min(100).max(3800).trim(),
  fileKey: z.string().optional(),
  fileName: z.string().optional(),
  graphicalAbstractKey: z.string().optional(),
  graphicalAbstractName: z.string().optional(),
});

export const abstractAssignSchema = z.object({
  reviewerIds: z.array(z.string().length(24)).min(1).max(10),
});

export const abstractDecisionSchema = z
  .object({
    decision: z.enum(["accepted", "rejected", "revision_requested"]),
    note: z.string().max(2000).optional(),
    presentationType: z.enum(["oral", "poster"]).optional(),
  })
  .refine((d) => d.decision !== "accepted" || !!d.presentationType, {
    message: "Select Oral or Poster to accept this abstract",
    path: ["presentationType"],
  });

export type AbstractSubmitInput = z.infer<typeof abstractSubmitSchema>;
export type AbstractStatusLookupInput = z.infer<typeof abstractStatusLookupSchema>;
export type AbstractResubmitInput = z.infer<typeof abstractResubmitSchema>;
export type AbstractAssignInput = z.infer<typeof abstractAssignSchema>;
export type AbstractDecisionInput = z.infer<typeof abstractDecisionSchema>;
