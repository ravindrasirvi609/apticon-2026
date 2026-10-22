import { NextResponse, type NextRequest } from "next/server";
import { eventFeedbackSchema } from "@/lib/validators/event-feedback";
import EventFeedback from "@/models/EventFeedback";
import {
  assertEventFeedbackOpen,
  assertWithinRateLimit,
  feedbackErrorResponse,
  findEligibleRegistration,
} from "@/lib/event-feedback";

/** Submit the end-of-convention feedback form. One submission per registration; it unlocks the certificate. */
export async function POST(request: NextRequest) {
  try {
    assertWithinRateLimit(request, "event-feedback-submit");
    assertEventFeedbackOpen();

    const parsed = eventFeedbackSchema.safeParse(
      await request.json().catch(() => null),
    );
    if (!parsed.success)
      return NextResponse.json(
        { error: "Please rate every question and check your answers." },
        { status: 400 },
      );
    const data = parsed.data;

    const registration = await findEligibleRegistration(data.code, data.email);

    // Make sure the unique index exists before relying on it (it is built lazily after first connect).
    await EventFeedback.init();

    try {
      // Insert-only upsert: an existing submission is returned untouched, a new one is created.
      const existing = await EventFeedback.findOneAndUpdate(
        { registration: registration._id },
        {
          $setOnInsert: {
            registrationCode: registration.registrationCode,
            email: registration.email,
            name: registration.fullName,
            institution: registration.institution,
            ratings: data.ratings,
            wouldRecommend: data.wouldRecommend,
            mostValuable: data.mostValuable,
            suggestions: data.suggestions,
            certificateDownloads: 0,
          },
        },
        { upsert: true, returnDocument: "before" },
      ).lean();
      // Feedback already on file (double-click, second tab). The delegate is entitled to the
      // certificate either way, so treat it as success and keep the first answers.
      if (existing)
        return NextResponse.json({ ok: true, alreadySubmitted: true });
    } catch (err) {
      // Two simultaneous first submissions race on the unique index; the loser lands here.
      if ((err as { code?: number }).code === 11000)
        return NextResponse.json({ ok: true, alreadySubmitted: true });
      throw err;
    }

    return NextResponse.json({ ok: true, alreadySubmitted: false }, { status: 201 });
  } catch (err) {
    return feedbackErrorResponse(err);
  }
}
