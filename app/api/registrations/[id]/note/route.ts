import { NextResponse, type NextRequest } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Registration from "@/models/Registration";
import { registrationNoteSchema } from "@/lib/validators/registration";
import { requireRole, authErrorResponse } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

/**
 * Saves the admin-only internal note. Previously this piggybacked on the approve/reject
 * handlers; with approval now driven by Razorpay it needs its own endpoint.
 */
export async function PATCH(
  request: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await requireRole("super_admin");

    const { id } = await ctx.params;
    if (!mongoose.isValidObjectId(id))
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });

    const body = await request.json().catch(() => null);
    const parsed = registrationNoteSchema.safeParse(body);
    if (!parsed.success)
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 },
      );

    await connectDB();
    const note = parsed.data.internalNote.trim();
    const reg = await Registration.findByIdAndUpdate(
      id,
      note ? { $set: { internalNote: note } } : { $unset: { internalNote: 1 } },
      { new: true },
    ).select("registrationCode internalNote");
    if (!reg) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await logAudit({
      actor: admin.uid,
      actorRole: admin.role,
      action: "registration.note.update",
      resourceType: "registration",
      resourceId: id,
      details: {
        registrationCode: reg.registrationCode,
        cleared: note.length === 0,
      },
      request,
    });

    return NextResponse.json({
      ok: true,
      internalNote: reg.internalNote ?? "",
    });
  } catch (err) {
    return authErrorResponse(err);
  }
}
