import { z } from "zod";

export const reviewSubmitSchema = z
  .object({
    abstractId: z.string().length(24),
    verdict: z.enum(["accept", "reject", "revise"]),
    presentationType: z.enum(["oral", "poster"]).optional(),
    comments: z.string().min(20).max(4000),
    commentsPrivate: z.string().max(2000).optional(),
  })
  .refine((d) => d.verdict !== "accept" || !!d.presentationType, {
    message: "Select Oral or Poster to accept this abstract",
    path: ["presentationType"],
  });

export type ReviewSubmitInput = z.infer<typeof reviewSubmitSchema>;
