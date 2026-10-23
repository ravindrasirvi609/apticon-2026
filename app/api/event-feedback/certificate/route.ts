import { NextResponse, type NextRequest } from "next/server";
import { certificateRequestSchema } from "@/lib/validators/event-feedback";
import EventFeedback from "@/models/EventFeedback";
import { certificateFilename, generateCertificatePdf } from "@/lib/certificate";
import {
  assertEventFeedbackOpen,
  assertWithinRateLimit,
  FeedbackAccessError,
  feedbackErrorResponse,
  findEligibleRegistration,
  findFeedbackFor,
} from "@/lib/event-feedback";

/**
 * Issues the participation certificate PDF — but only to a confirmed delegate who has already
 * submitted the feedback form. POST (not GET) so the registration code and email never end up
 * in a URL, browser history or server logs.
 */
export async function POST(request: NextRequest) {
  try {
    assertWithinRateLimit(request, "event-feedback-certificate");
    assertEventFeedbackOpen();

    const parsed = certificateRequestSchema.safeParse(
      await request.json().catch(() => null),
    );
    if (!parsed.success)
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    const { code, email, preview } = parsed.data;

    const registration = await findEligibleRegistration(code, email);
    const feedback = await findFeedbackFor(registration._id);
    if (!feedback)
      throw new FeedbackAccessError(
        "Please submit the feedback form first — your certificate is unlocked once it is filled.",
        403,
      );

    const pdf = await generateCertificatePdf({
      name: registration.fullName,
      registrationCode: registration.registrationCode,
      institution: registration.institution,
    });

    if (!preview) {
      await EventFeedback.updateOne(
        { _id: feedback._id },
        { $inc: { certificateDownloads: 1 }, $set: { lastCertificateAt: new Date() } },
      );
    }

    return new Response(Buffer.from(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `${preview ? "inline" : "attachment"}; filename="${certificateFilename(registration.registrationCode)}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    return feedbackErrorResponse(err);
  }
}
