import { NextResponse, type NextRequest } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Review from "@/models/Review";
import Abstract from "@/models/Abstract";
import User from "@/models/User";
import { reviewSubmitSchema } from "@/lib/validators/review";
import { requireRole, authErrorResponse } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { sendMail, abstractDecisionEmail, abstractReviewFlaggedEmail } from "@/lib/email";
import { generateAbstractCode } from "@/lib/abstract-code";

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

    if (abs.finalDecision === "accepted" || abs.finalDecision === "rejected") {
      return NextResponse.json({ error: "This abstract has already been finalized." }, { status: 409 });
    }

    // Upsert
    const existing = await Review.findOne({ abstract: abs._id, reviewer: reviewer.uid });
    const before = existing ? { verdict: existing.verdict } : null;
    const doc = existing ?? new Review({ abstract: abs._id, reviewer: new mongoose.Types.ObjectId(reviewer.uid) });

    doc.verdict = parsed.data.verdict;
    doc.presentationType = parsed.data.presentationType;
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

    if (parsed.data.verdict === "accept") {
      // A reviewer's accept finalizes the abstract directly — no separate admin/editorial confirmation needed.
      abs.finalDecision = "accepted";
      abs.finalDecisionBy = new mongoose.Types.ObjectId(reviewer.uid);
      abs.finalDecisionAt = new Date();
      abs.finalDecisionNote = parsed.data.comments;
      abs.status = "accepted";
      abs.presentationType = parsed.data.presentationType;
      if (!abs.abstractCode) {
        abs.abstractCode = await generateAbstractCode(parsed.data.presentationType!, abs.theme);
      }
      await abs.save();

      await logAudit({
        actor: reviewer.uid,
        actorRole: "reviewer",
        action: "abstract.decision",
        resourceType: "abstract",
        resourceId: abs._id.toString(),
        details: { decision: "accepted", presentationType: abs.presentationType, submissionCode: abs.submissionCode },
        request,
      });

      const { subject, html } = abstractDecisionEmail(
        abs.presentingAuthor,
        abs.submissionCode,
        abs.title,
        "accepted",
        parsed.data.comments,
        abs.abstractCode,
        abs.presentationType
      );
      await sendMail({ to: abs.email, subject, html });
    } else {
      // Reject/revise is only a recommendation — notify admin/editorial to make the final call.
      const recipients = await User.find(
        { role: { $in: ["super_admin", "editorial"] }, isActive: true },
        "email"
      ).lean();
      const { subject, html } = abstractReviewFlaggedEmail(
        reviewer.name,
        abs.submissionCode,
        abs.title,
        parsed.data.verdict,
        parsed.data.comments
      );
      await Promise.all(recipients.map((u) => sendMail({ to: u.email, subject, html })));
    }

    return NextResponse.json({ ok: true, id: doc._id.toString() });
  } catch (err) {
    return authErrorResponse(err);
  }
}
