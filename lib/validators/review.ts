import { z } from "zod";

export const reviewSubmitSchema = z.object({
  abstractId: z.string().length(24),
  verdict: z.enum(["accept", "reject", "revise"]),
  scoreOriginality: z.number().int().min(1).max(10),
  scoreMethodology: z.number().int().min(1).max(10),
  scoreClarity: z.number().int().min(1).max(10),
  scoreRelevance: z.number().int().min(1).max(10),
  comments: z.string().min(20).max(4000),
  commentsPrivate: z.string().max(2000).optional(),
});

export type ReviewSubmitInput = z.infer<typeof reviewSubmitSchema>;
