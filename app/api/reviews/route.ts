import { NextResponse, type NextRequest } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Review from "@/models/Review";
import Abstract from "@/models/Abstract";
import { reviewSubmitSchema } from "@/lib/validators/review";
import { requireRole, authErrorResponse } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export async function POST(request: NextRequest) {
  try {
    const reviewer = await requireRole("reviewer");
    const body = await request.json().catch(() => null);
    const parsed = reviewSubmitSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });

    await connectDB();
    const abs = await Abstract.findById(parsed.data.abstractId);
    if (!abs) return NextResponse.json({ error: "Abstract not found" }, { status: 404 });

    const isAssigned = abs.assignedReviewers.some((r) => r.toString() === reviewer.uid);
    if (!isAssigned) return NextResponse.json({ error: "You are not assigned to this abstract" }, { status: 403 });

    // Upsert
    const existing = await Review.findOne({ abstract: abs._id, reviewer: reviewer.uid });
    const before = existing ? { verdict: existing.verdict } : null;
    const doc = existing ?? new Review({ abstract: abs._id, reviewer: new mongoose.Types.ObjectId(reviewer.uid) });

    doc.verdict = parsed.data.verdict;
    doc.scoreOriginality = parsed.data.scoreOriginality;
    doc.scoreMethodology = parsed.data.scoreMethodology;
    doc.scoreClarity = parsed.data.scoreClarity;
    doc.scoreRelevance = parsed.data.scoreRelevance;
    doc.comments = parsed.data.comments;
    doc.commentsPrivate = parsed.data.commentsPrivate;
    doc.submittedAt = new Date();
    await doc.save();

    await logAudit({
      actor: reviewer.uid,
      actorRole: "reviewer",
      action: existing ? "review.update" : "review.submit",
      resourceType: "review",
      resourceId: doc._id.toString(),
      details: {
        abstractId: abs._id.toString(),
        submissionCode: abs.submissionCode,
        verdict: parsed.data.verdict,
        before,
      },
      request,
    });

    return NextResponse.json({ ok: true, id: doc._id.toString() });
  } catch (err) {
    return authErrorResponse(err);
  }
}
