import { NextResponse, type NextRequest } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Registration from "@/models/Registration";
import { registrationRejectSchema } from "@/lib/validators/registration";
import { getSessionFromCookies, authErrorResponse, AuthError } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { sendMail, registrationRejectedEmail } from "@/lib/email";

export async function PATCH(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const s = await getSessionFromCookies();
    if (!s) throw new AuthError("Unauthorized", 401);
    if (s.role !== "super_admin" && s.role !== "registration_approver") throw new AuthError("Forbidden", 403);

    const { id } = await ctx.params;
    if (!mongoose.isValidObjectId(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

    const body = await request.json().catch(() => null);
    const parsed = registrationRejectSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });

    await connectDB();
    const reg = await Registration.findById(id);
    if (!reg) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const before = { status: reg.status };
    reg.status = "rejected";
    reg.rejectedBy = new mongoose.Types.ObjectId(s.uid);
    reg.rejectedAt = new Date();
    reg.reviewNote = parsed.data.reason;
    if (s.role === "super_admin" && parsed.data.internalNote !== undefined) {
      reg.internalNote = parsed.data.internalNote;
    }
    await reg.save();

    await logAudit({
      actor: s.uid,
      actorRole: s.role,
      action: "registration.reject",
      resourceType: "registration",
      resourceId: reg._id.toString(),
      details: { before, after: { status: reg.status }, reason: parsed.data.reason, registrationCode: reg.registrationCode },
      request,
    });

    const { subject, html } = registrationRejectedEmail(reg.fullName, reg.registrationCode, parsed.data.reason);
    await sendMail({ to: reg.email, subject, html });

    return NextResponse.json({ ok: true });
  } catch (err) {
    return authErrorResponse(err);
  }
}
