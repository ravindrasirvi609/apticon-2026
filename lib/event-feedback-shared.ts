/**
 * End-of-convention feedback form definition, shared by the public form, the API validators and
 * the admin report so the questions can never drift apart. Pure module — no server imports.
 */

/** The form and certificate are open throughout the convention, starting 24 Oct 2026 at 00:00 IST. */
export const EVENT_FEEDBACK_OPENS_AT = new Date("2026-10-24T00:00:00+05:30");

export const RATING_QUESTIONS = [
  { key: "content", label: "Scientific content & sessions" },
  { key: "speakers", label: "Quality of speakers" },
  { key: "organisation", label: "Overall organisation" },
  { key: "venue", label: "Venue & facilities" },
  { key: "hospitality", label: "Food & hospitality" },
  { key: "registration", label: "Registration & check-in experience" },
  { key: "overall", label: "Overall experience of APTICON 2026" },
] as const;

export type RatingKey = (typeof RATING_QUESTIONS)[number]["key"];
export const RATING_KEYS = RATING_QUESTIONS.map((q) => q.key) as RatingKey[];

export const RATING_SCALE = [
  { value: 1, label: "Poor" },
  { value: 2, label: "Fair" },
  { value: 3, label: "Good" },
  { value: 4, label: "Very good" },
  { value: 5, label: "Excellent" },
] as const;

export const RECOMMEND_OPTIONS = [
  { value: "yes", label: "Yes, definitely" },
  { value: "maybe", label: "Maybe" },
  { value: "no", label: "No" },
] as const;
export type RecommendValue = (typeof RECOMMEND_OPTIONS)[number]["value"];

export const MOST_VALUABLE_MAX = 1000;
export const SUGGESTIONS_MAX = 1500;

export type EventFeedbackRatings = Record<RatingKey, number>;
