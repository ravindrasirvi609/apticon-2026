import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isEventFeedbackOpen } from "@/lib/event-feedback";
import FeedbackClient from "./FeedbackClient";

export const metadata: Metadata = {
  title: "Feedback & Certificate | APTICON 2026",
  description:
    "Share your feedback on APTICON 2026 and download your participation certificate.",
};

// Whether the page exists depends on the clock (and an organiser override), so never prerender it.
export const dynamic = "force-dynamic";

export default function FeedbackPage() {
  // Before it goes live the page does not exist as far as visitors are concerned: no countdown,
  // no teaser, just the site's normal 404.
  if (!isEventFeedbackOpen()) notFound();
  return <FeedbackClient />;
}
