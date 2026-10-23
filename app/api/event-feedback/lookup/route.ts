import { NextResponse, type NextRequest } from "next/server";
import { feedbackIdentitySchema } from "@/lib/validators/event-feedback";
import {
  assertEventFeedbackOpen,
  assertWithinRateLimit,
  feedbackErrorResponse,
  findEligibleRegistration,
  findFeedbackFor,
} from "@/lib/event-feedback";

/**
 * Step 1 of the public flow: identify the delegate. Tells the page whether to show the form
 * (no submission yet) or go straight to the certificate (already submitted).
 */
export async function POST(request: NextRequest) {
  try {
    assertWithinRateLimit(request, "event-feedback-lookup");
    assertEventFeedbackOpen();

    const parsed = feedbackIdentitySchema.safeParse(
      await request.json().catch(() => null),
    );
    if (!parsed.success)
      return NextResponse.json(
        { error: "Enter your registration code and the email you registered with." },
        { status: 400 },
      );

    const registration = await findEligibleRegistration(
      parsed.data.code,
      parsed.data.email,
    );
    const feedback = await findFeedbackFor(registration._id);

    return NextResponse.json({
      registration: {
        code: registration.registrationCode,
        name: registration.fullName,
        institution: registration.institution,
      },
      submitted: Boolean(feedback),
    });
  } catch (err) {
    return feedbackErrorResponse(err);
  }
}
