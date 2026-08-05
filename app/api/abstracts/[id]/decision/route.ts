import { NextResponse, type NextRequest } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Abstract from "@/models/Abstract";
import { abstractDecisionSchema } from "@/lib/validators/abstract";
import { requireAnyRole, authErrorResponse } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { sendMail, abstractDecisionEmail } from "@/lib/email";
import { generateAbstractCode } from "@/lib/abstract-code";

export async function PATCH(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const actor = await requireAnyRole("super_admin", "editorial");
    const { id } = await ctx.params;
    if (!mongoose.isValidObjectId(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

    const body = await request.json().catch(() => null);
    const parsed = abstractDecisionSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });

    await connectDB();
    const abs = await Abstract.findById(id);
    if (!abs) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const before = { status: abs.status, finalDecision: abs.finalDecision };

    abs.finalDecision = parsed.data.decision;
    abs.finalDecisionBy = new mongoose.Types.ObjectId(actor.uid);
    abs.finalDecisionAt = new Date();
    abs.finalDecisionNote = parsed.data.note;
    abs.status = parsed.data.decision === "revision_requested" ? "revision_requested" : parsed.data.decision;

    if (parsed.data.decision === "accepted" && parsed.data.presentationType) {
      abs.presentationType = parsed.data.presentationType;
      if (!abs.abstractCode) {
        abs.abstractCode = await generateAbstractCode(parsed.data.presentationType, abs.theme);
      }
    }

    await abs.save();

    await logAudit({
      actor: actor.uid,
      actorRole: actor.role,
      action: "abstract.decision",
      resourceType: "abstract",
      resourceId: abs._id.toString(),
      details: { before, after: { status: abs.status, decision: parsed.data.decision }, note: parsed.data.note, submissionCode: abs.submissionCode },
      request,
    });

    const { subject, html } = abstractDecisionEmail(
      abs.presentingAuthor,
      abs.submissionCode,
      abs.title,
      parsed.data.decision,
      parsed.data.note,
      abs.abstractCode,
      abs.presentationType
    );
    await sendMail({ to: abs.email, subject, html });

    return NextResponse.json({ ok: true });
  } catch (err) {
    return authErrorResponse(err);
  }
}
