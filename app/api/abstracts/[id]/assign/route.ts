import { NextResponse, type NextRequest } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Abstract from "@/models/Abstract";
import User from "@/models/User";
import { abstractAssignSchema } from "@/lib/validators/abstract";
import { requireAnyRole, authErrorResponse } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { sendMail, reviewerAssignmentEmail } from "@/lib/email";

export async function PATCH(
  request: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const actor = await requireAnyRole("super_admin", "editorial");
    const { id } = await ctx.params;
    if (!mongoose.isValidObjectId(id))
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });

    const body = await request.json().catch(() => null);
    const parsed = abstractAssignSchema.safeParse(body);
    if (!parsed.success)
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 },
      );

    await connectDB();
    const abs = await Abstract.findById(id);
    if (!abs) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const before = abs.assignedReviewers.map((r) => r.toString());
    const requested = parsed.data.reviewerIds;

    // Validate reviewers exist and are active reviewers
    const reviewers = await User.find({
      _id: { $in: requested },
      role: "reviewer",
      isActive: true,
    });
    if (reviewers.length !== requested.length) {
      return NextResponse.json(
        { error: "One or more reviewers are invalid" },
        { status: 400 },
      );
    }

    abs.assignedReviewers = reviewers.map((r) => r._id);
    if (abs.status === "submitted") abs.status = "under_review";
    await abs.save();

    await logAudit({
      actor: actor.uid,
      actorRole: actor.role,
      action: "abstract.assign_reviewer",
      resourceType: "abstract",
      resourceId: abs._id.toString(),
      details: { before, after: requested, submissionCode: abs.submissionCode },
      request,
    });

    // Notify newly-added reviewers only
    const newlyAdded = reviewers.filter(
      (r) => !before.includes(r._id.toString()),
    );
    await Promise.all(
      newlyAdded.map(async (r) => {
        const assignmentCount = await Abstract.countDocuments({
          assignedReviewers: r._id,
          status: { $ne: "accepted" },
        });
        const { subject, html } = reviewerAssignmentEmail(
          r.name,
          assignmentCount,
        );
        await sendMail({ to: r.email, subject, html });
      }),
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    return authErrorResponse(err);
  }
}
