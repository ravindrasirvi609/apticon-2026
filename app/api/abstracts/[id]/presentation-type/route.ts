import { NextResponse, type NextRequest } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Abstract from "@/models/Abstract";
import { requireAnyRole, authErrorResponse } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { generateAbstractCode } from "@/lib/abstract-code";
import { sendMail, abstractPresentationTypeEmail } from "@/lib/email";
import { z } from "zod";

const presentationTypeSchema = z.object({
  presentationType: z.enum(["oral", "poster"]),
});

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
    const parsed = presentationTypeSchema.safeParse(body);
    if (!parsed.success)
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 },
      );

    await connectDB();
    const abs = await Abstract.findById(id);
    if (!abs) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Only allow setting presentation type on accepted abstracts
    if (abs.status !== "accepted") {
      return NextResponse.json(
        {
          error:
            "Presentation type can only be assigned to accepted abstracts.",
        },
        { status: 400 },
      );
    }

    const before = {
      presentationType: abs.presentationType,
      abstractCode: abs.abstractCode,
    };

    // Set the presentation type
    abs.presentationType = parsed.data.presentationType;

    // Generate abstract code if not already present
    if (!abs.abstractCode) {
      abs.abstractCode = await generateAbstractCode(
        parsed.data.presentationType,
        abs.theme,
      );
    }

    await abs.save();

    await logAudit({
      actor: actor.uid,
      actorRole: actor.role,
      action: "abstract.presentation_type",
      resourceType: "abstract",
      resourceId: abs._id.toString(),
      details: {
        before,
        after: {
          presentationType: abs.presentationType,
          abstractCode: abs.abstractCode,
        },
        submissionCode: abs.submissionCode,
      },
      request,
    });

    // Send email to author notifying them of the presentation type assignment
    const { subject, html } = abstractPresentationTypeEmail(
      abs.presentingAuthor,
      abs.submissionCode,
      abs.title,
      abs.presentationType as "oral" | "poster",
      abs.abstractCode!,
    );
    await sendMail({ to: abs.email, subject, html });

    return NextResponse.json({
      ok: true,
      presentationType: abs.presentationType,
      abstractCode: abs.abstractCode,
    });
  } catch (err) {
    return authErrorResponse(err);
  }
}
