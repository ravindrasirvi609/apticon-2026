import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { authErrorResponse, requireAnyRole } from "@/lib/auth";
import DelegateQuestion from "@/models/DelegateQuestion";
import DelegateFeedback from "@/models/DelegateFeedback";
import Registration from "@/models/Registration";
import { SESSION_CATALOG } from "@/lib/mobile/session-catalog";

/** Session questions and feedback for authenticated admin, editorial and reviewer staff. */
export async function GET() {
  try {
    await requireAnyRole("super_admin", "editorial", "reviewer");
    await connectDB();

    const [questions, feedback] = await Promise.all([
      DelegateQuestion.find({}).sort({ createdAt: -1 }).lean(),
      DelegateFeedback.find({}).sort({ updatedAt: -1 }).lean(),
    ]);
    const registrationIds = [
      ...new Set(
        [...questions, ...feedback].map((item) => item.registration.toString()),
      ),
    ];
    const registrations = registrationIds.length
      ? await Registration.find({ _id: { $in: registrationIds } })
          .select("registrationCode fullName institution")
          .lean()
      : [];
    const registrationById = new Map(
      registrations.map((registration) => [registration._id.toString(), registration]),
    );

    const sessionById = new Map(SESSION_CATALOG.map((session) => [session.id, session]));
    const sessionSummaries = SESSION_CATALOG.map((session) => {
      const sessionQuestions = questions.filter((item) => item.sessionId === session.id);
      const sessionFeedback = feedback.filter((item) => item.sessionId === session.id);
      const averageRating = sessionFeedback.length
        ? Math.round(
            (sessionFeedback.reduce((total, item) => total + item.rating, 0) /
              sessionFeedback.length) *
              100,
          ) / 100
        : null;
      return {
        id: session.id,
        day: session.day,
        title: session.title,
        questions: sessionQuestions.length,
        feedback: sessionFeedback.length,
        averageRating,
      };
    });

    return NextResponse.json({
      sessions: sessionSummaries,
      questions: questions.map((item) => {
        const registration = registrationById.get(item.registration.toString());
        const session = sessionById.get(item.sessionId);
        return {
          id: item._id.toString(),
          sessionId: item.sessionId,
          sessionTitle: session?.title ?? item.sessionId,
          sessionDay: session?.day ?? null,
          text: item.text,
          isAnonymous: item.isAnonymous,
          status: item.status,
          createdAt: item.createdAt.toISOString(),
          delegateName: registration?.fullName ?? "Delegate",
          registrationCode: registration?.registrationCode ?? "",
          institution: registration?.institution ?? "",
        };
      }),
      feedback: feedback.map((item) => {
        const registration = registrationById.get(item.registration.toString());
        const session = sessionById.get(item.sessionId);
        return {
          id: item._id.toString(),
          sessionId: item.sessionId,
          sessionTitle: session?.title ?? item.sessionId,
          sessionDay: session?.day ?? null,
          rating: item.rating,
          comment: item.comment,
          updatedAt: item.updatedAt.toISOString(),
          delegateName: registration?.fullName ?? "Delegate",
          registrationCode: registration?.registrationCode ?? "",
          institution: registration?.institution ?? "",
        };
      }),
    });
  } catch (err) {
    return authErrorResponse(err);
  }
}
