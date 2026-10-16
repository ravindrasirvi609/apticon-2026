import type { NextRequest } from "next/server";
import DelegateQuestion from "@/models/DelegateQuestion";
import { delegateQuestionSchema } from "@/lib/validators/delegate";
import {
  requireApprovedDelegate,
  requireInteractiveSession,
} from "@/lib/mobile/delegate-guard";
import {
  questionWindow,
  windowClosedMessage,
} from "@/lib/mobile/session-windows";
import { rateLimit } from "@/lib/rate-limit";
import { ok, fail, failFromError } from "@/lib/mobile/response";

const MAX_QUESTIONS_PER_SESSION = 5;

type Ctx = { params: Promise<{ sessionId: string }> };

function toDto(q: {
  _id: { toString(): string };
  text: string;
  isAnonymous: boolean;
  status: string;
  createdAt: Date;
}) {
  return {
    id: q._id.toString(),
    text: q.text,
    isAnonymous: q.isAnonymous,
    status: q.status,
    createdAt: q.createdAt.toISOString(),
  };
}

// v1: a delegate only ever sees THEIR OWN questions. A public list / upvotes / moderation view
// are intentionally deferred.
export async function GET(request: NextRequest, ctx: Ctx) {
  try {
    const delegate = await requireApprovedDelegate(request);
    const { sessionId } = await ctx.params;
    const session = requireInteractiveSession(sessionId);

    const questions = await DelegateQuestion.find({
      registration: delegate.rid,
      sessionId,
    })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return ok({
      questions: questions.map(toDto),
      window: questionWindow(session),
      maxQuestions: MAX_QUESTIONS_PER_SESSION,
    });
  } catch (err) {
    return failFromError(err, "/delegate/sessions/[sessionId]/questions GET");
  }
}

export async function POST(request: NextRequest, ctx: Ctx) {
  try {
    const delegate = await requireApprovedDelegate(request);
    const { sessionId } = await ctx.params;
    const session = requireInteractiveSession(sessionId);

    if (!rateLimit(`delegate-question:${delegate.rid}`, 10, 60_000).ok) {
      return fail("You're sending questions too fast. Please wait.", [], 429);
    }

    const body = await request.json().catch(() => null);
    const parsed = delegateQuestionSchema.safeParse(body);
    if (!parsed.success) {
      return fail(
        "Please enter a question (3 to 500 characters).",
        parsed.error.issues.map((i) => i.message),
        400,
      );
    }

    const window = questionWindow(session);
    if (!window.open) {
      return fail(windowClosedMessage(window, "Questions"), [], 409);
    }

    const asked = await DelegateQuestion.countDocuments({
      registration: delegate.rid,
      sessionId,
    });
    if (asked >= MAX_QUESTIONS_PER_SESSION) {
      return fail(
        `You can ask up to ${MAX_QUESTIONS_PER_SESSION} questions per session.`,
        [],
        429,
      );
    }

    const created = await DelegateQuestion.create({
      sessionId,
      registration: delegate.rid,
      text: parsed.data.text,
      isAnonymous: parsed.data.isAnonymous,
    });

    return ok(
      { question: toDto(created), window },
      "Question submitted",
      201,
    );
  } catch (err) {
    return failFromError(err, "/delegate/sessions/[sessionId]/questions POST");
  }
}
