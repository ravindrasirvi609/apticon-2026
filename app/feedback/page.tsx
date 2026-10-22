import type { Metadata } from "next";
import { isEventFeedbackOpen } from "@/lib/event-feedback";
import { EVENT_FEEDBACK_OPENS_AT } from "@/lib/event-feedback-shared";
import FeedbackClient from "./FeedbackClient";

export const metadata: Metadata = {
  title: "Feedback & Certificate | APTICON 2026",
  description:
    "Share your feedback on APTICON 2026 and download your participation certificate.",
};

// Whether the form is live depends on the clock (and an organiser override), so never prerender it.
export const dynamic = "force-dynamic";

export default function FeedbackPage() {
  return (
    <FeedbackClient
      initiallyOpen={isEventFeedbackOpen()}
      opensAt={EVENT_FEEDBACK_OPENS_AT.toISOString()}
    />
  );
}
