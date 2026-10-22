/**
 * Server-side gate for the end-of-convention feedback form and the certificate it unlocks.
 * Every API route funnels through here, so the rules live in exactly one place:
 *
 *   1. the form is only live from EVENT_FEEDBACK_OPENS_AT (25 Oct 2026, 12:00 IST);
 *   2. only a delegate with a confirmed (approved) registration can use it;
 *   3. the certificate is only issued to a delegate who has submitted the form.
 */

import { NextResponse, type NextRequest } from "next/server";
import type mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { getClientIp } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import Registration from "@/models/Registration";
import EventFeedback from "@/models/EventFeedback";
import { EVENT_FEEDBACK_OPENS_AT } from "@/lib/event-feedback-shared";

export class FeedbackAccessError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

/**
 * Organisers can open the form early (to rehearse it, or for app-store review) with the same
 * switch the delegate Q&A/session-feedback windows already use: DELEGATE_WINDOWS_OPEN=true.
 */
export function isEventFeedbackOpen(now: Date = new Date()): boolean {
  if (process.env.DELEGATE_WINDOWS_OPEN === "true") return true;
  return now >= EVENT_FEEDBACK_OPENS_AT;
}

export function assertEventFeedbackOpen(): void {
  if (!isEventFeedbackOpen())
    throw new FeedbackAccessError(
      "The feedback form opens on 25 October 2026 at 12:00 PM IST.",
      403,
    );
}

/** Code and email are guessable-ish credentials, so cap attempts per IP. */
export function assertWithinRateLimit(request: NextRequest, bucket: string) {
  const limit = rateLimit(`${bucket}:${getClientIp(request)}`, 30, 10 * 60_000);
  if (!limit.ok)
    throw new FeedbackAccessError(
      "Too many attempts. Please wait a few minutes and try again.",
      429,
    );
}

/** The registration behind a code + email pair, provided it is a confirmed one. */
export async function findEligibleRegistration(code: string, email: string) {
  await connectDB();
  const registration = await Registration.findOne({
    registrationCode: code.toUpperCase(),
    email,
  })
    .select("registrationCode fullName email institution category status")
    .lean();
  if (!registration)
    throw new FeedbackAccessError(
      "No registration found with that code and email.",
      404,
    );
  if (registration.status !== "approved")
    throw new FeedbackAccessError(
      "Your registration is not confirmed yet, so feedback and certificates are not available. Check your registration status or contact the organisers.",
      403,
    );
  return registration;
}

export async function findFeedbackFor(
  registrationId: mongoose.Types.ObjectId,
) {
  return EventFeedback.findOne({ registration: registrationId }).lean();
}

export function feedbackErrorResponse(err: unknown): NextResponse {
  if (err instanceof FeedbackAccessError)
    return NextResponse.json({ error: err.message }, { status: err.status });
  console.error("[event-feedback] unexpected error:", err);
  return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
}
