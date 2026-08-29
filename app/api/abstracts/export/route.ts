import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getSessionFromCookies } from "@/lib/auth";
import Abstract from "@/models/Abstract";
import { csvResponse, excelResponse } from "@/lib/export";

const headers = ["Submission Code", "Title", "Presenting Author", "Co-authors", "Institution", "Email", "Phone", "APTI Member ID", "Theme", "Type", "Preferred Presentation", "Keywords", "Abstract", "Status", "Final Decision", "Presentation Type", "Abstract Code", "Registration Linked", "Submitted At"];

export async function GET(request: NextRequest) {
  const session = await getSessionFromCookies();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectDB();
  const url = new URL(request.url);
  const filter: Record<string, unknown> = {};
  const status = url.searchParams.get("status");
  const q = url.searchParams.get("q") ?? "";
  if (status) filter.status = status;
  if (q) {
    const safe = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    filter.$or = ["title", "submissionCode", "email", "presentingAuthor"].map((field) => ({ [field]: { $regex: safe, $options: "i" } }));
  }
  if (session.role === "reviewer") filter.assignedReviewers = session.uid;
  const rows = await Abstract.find(filter).sort({ createdAt: -1 }).lean();
  const data = rows.map((a) => [a.submissionCode, a.title, a.presentingAuthor, a.coAuthors.map((c) => `${c.name} (${c.institution})`).join("; "), a.institution, a.email, a.phone, a.aptiMemberId, a.theme, a.type, a.preferredPresentationType, a.keywords.join(", "), a.abstract, a.status, a.finalDecision, a.presentationType, a.abstractCode, a.linkedRegistration ? "Yes" : "No", a.createdAt]);
  const format = url.searchParams.get("format") === "csv" ? "csv" : "xlsx";
  const filename = `APTICON-2026-Abstracts-${new Date().toISOString().slice(0, 10)}.${format}`;
  return format === "csv" ? csvResponse(filename, headers, data) : excelResponse(filename, "Abstracts", headers, data);
}
