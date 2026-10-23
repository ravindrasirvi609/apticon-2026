import { type NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { requireRole, authErrorResponse } from "@/lib/auth";
import { csvResponse, excelResponse } from "@/lib/export";
import EventFeedback from "@/models/EventFeedback";
import { RATING_QUESTIONS } from "@/lib/event-feedback-shared";

const headers = [
  "Registration Code",
  "Name",
  "Email",
  "Institution",
  ...RATING_QUESTIONS.map((q) => q.label),
  "Would Attend Again / Recommend",
  "Most Valuable",
  "Suggestions",
  "Certificate Downloads",
  "Last Certificate Download",
  "Submitted At",
];

export async function GET(request: NextRequest) {
  try {
    await requireRole("super_admin");
    await connectDB();
    const rows = await EventFeedback.find({}).sort({ createdAt: -1 }).lean();

    const data = rows.map((f) => [
      f.registrationCode,
      f.name,
      f.email,
      f.institution,
      ...RATING_QUESTIONS.map((q) => f.ratings?.[q.key] ?? ""),
      f.wouldRecommend,
      f.mostValuable,
      f.suggestions,
      f.certificateDownloads ?? 0,
      f.lastCertificateAt ?? "",
      f.createdAt,
    ]);

    const format =
      new URL(request.url).searchParams.get("format") === "csv" ? "csv" : "xlsx";
    const filename = `APTICON-2026-Event-Feedback-${new Date().toISOString().slice(0, 10)}.${format}`;
    return format === "csv"
      ? csvResponse(filename, headers, data)
      : excelResponse(filename, "Event Feedback", headers, data);
  } catch (err) {
    return authErrorResponse(err);
  }
}
