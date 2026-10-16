import type { NextRequest } from "next/server";
import DelegateFeedback from "@/models/DelegateFeedback";
import { delegateFeedbackSchema } from "@/lib/validators/delegate";
import {
  requireApprovedDelegate,
  requireInteractiveSession,
} from "@/lib/mobile/delegate-guard";
import {
  feedbackWindow,
  windowClosedMessage,
} from "@/lib/mobile/session-windows";
import { ok, fail, failFromError } from "@/lib/mobile/response";

type Ctx = { params: Promise<{ sessionId: string }> };

function toDto(f: { rating: number; comment: string; updatedAt: Date }) {
  return {
    rating: f.rating,
    comment: f.comment,
    updatedAt: f.updatedAt.toISOString(),
  };
}

// The caller's own feedback for this session (null if none yet) plus whether feedback is open.
export async function GET(request: NextRequest, ctx: Ctx) {
  try {
    const delegate = await requireApprovedDelegate(request);
    const { sessionId } = await ctx.params;
    const session = requireInteractiveSession(sessionId);

    const feedback = await DelegateFeedback.findOne({
      registration: delegate.rid,
      sessionId,
    }).lean();

    return ok({
      feedback: feedback ? toDto(feedback) : null,
      window: feedbackWindow(session),
    });
  } catch (err) {
    return failFromError(err, "/delegate/sessions/[sessionId]/feedback GET");
  }
}

// Create-or-update: one feedback entry per delegate per session.
export async function PUT(request: NextRequest, ctx: Ctx) {
  try {
    const delegate = await requireApprovedDelegate(request);
    const { sessionId } = await ctx.params;
    const session = requireInteractiveSession(sessionId);

    const body = await request.json().catch(() => null);
    const parsed = delegateFeedbackSchema.safeParse(body);
    if (!parsed.success) {
      return fail(
        "Please choose a rating from 1 to 5 (comment up to 1000 characters).",
        parsed.error.issues.map((i) => i.message),
        400,
      );
    }

    const window = feedbackWindow(session);
    if (!window.open) {
      return fail(windowClosedMessage(window, "Feedback"), [], 409);
    }

    const saved = await DelegateFeedback.findOneAndUpdate(
      { registration: delegate.rid, sessionId },
      { $set: { rating: parsed.data.rating, comment: parsed.data.comment } },
      { upsert: true, returnDocument: "after", setDefaultsOnInsert: true },
    ).lean();

    return ok(
      { feedback: saved ? toDto(saved) : null, window },
      "Feedback saved",
    );
  } catch (err) {
    return failFromError(err, "/delegate/sessions/[sessionId]/feedback PUT");
  }
}
