import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isEventFeedbackOpen } from "@/lib/event-feedback";
import FeedbackClient from "./FeedbackClient";

// Whether the page exists depends on the clock (and an organiser override), so never prerender it.
export const dynamic = "force-dynamic";

// Until the form is live even the tab title and description must say nothing about it.
export function generateMetadata(): Metadata {
  if (!isEventFeedbackOpen())
    return { title: "Page Not Found | APTICON 2026", robots: { index: false } };
  return {
    title: "Feedback & Certificate | APTICON 2026",
    description:
      "Share your feedback on APTICON 2026 and download your participation certificate.",
  };
}

export default function FeedbackPage() {
  // Before it goes live the page does not exist as far as visitors are concerned: no countdown,
  // no teaser, just the site's normal 404.
  if (!isEventFeedbackOpen()) notFound();
  return <FeedbackClient />;
}
