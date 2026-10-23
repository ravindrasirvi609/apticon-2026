import { z } from "zod";
import {
  MOST_VALUABLE_MAX,
  RATING_KEYS,
  SUGGESTIONS_MAX,
} from "@/lib/event-feedback-shared";

/** Same two-factor lookup the registration status page uses: code and email must both match. */
export const feedbackIdentitySchema = z.object({
  code: z.string().min(4).max(60).trim(),
  email: z.string().email().toLowerCase().trim(),
});

const rating = z.number().int().min(1).max(5);

export const eventFeedbackSchema = feedbackIdentitySchema.extend({
  ratings: z.object(
    Object.fromEntries(RATING_KEYS.map((k) => [k, rating])) as Record<
      (typeof RATING_KEYS)[number],
      typeof rating
    >,
  ),
  wouldRecommend: z.enum(["yes", "maybe", "no"]),
  mostValuable: z.string().trim().max(MOST_VALUABLE_MAX).default(""),
  suggestions: z.string().trim().max(SUGGESTIONS_MAX).default(""),
});

export const certificateRequestSchema = feedbackIdentitySchema.extend({
  /** Preview fetches for the on-page viewer; only a real download counts toward the total. */
  preview: z.boolean().default(false),
});

export type EventFeedbackInput = z.infer<typeof eventFeedbackSchema>;
