import { NextResponse, type NextRequest } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Registration from "@/models/Registration";
import Abstract from "@/models/Abstract";
import { getSessionFromCookies, requireRole, authErrorResponse } from "@/lib/auth";
import { generateRegistrationQrDataUrl } from "@/lib/qrcode";
import { logAudit } from "@/lib/audit";

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  if (!mongoose.isValidObjectId(id))
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const s = await getSessionFromCookies();
  if (!s) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (s.role !== "super_admin" && s.role !== "editorial") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await connectDB();
  const reg = await Registration.findById(id).lean();
  if (!reg) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let linkedAbstract: unknown = null;
  if (reg.linkedAbstract) {
    linkedAbstract = await Abstract.findById(reg.linkedAbstract)
      .select("submissionCode title status theme type createdAt finalDecision")
      .lean();
  }

  // Redact internalNote for non-admins (admin-only field)
  if (s.role !== "super_admin") {
    delete (reg as Partial<typeof reg>).internalNote;
  }

  const qrCode =
    reg.status === "approved"
      ? await generateRegistrationQrDataUrl(reg.registrationCode)
      : undefined;

  return NextResponse.json({
    registration: { ...reg, qrCode },
    linkedAbstract,
  });
}

// DELETE — super_admin only, and only while payment isn't confirmed (captured)
export async function DELETE(
  request: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await requireRole("super_admin");
    const { id } = await ctx.params;
    if (!mongoose.isValidObjectId(id))
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });

    await connectDB();
    const deleted = await Registration.findOneAndDelete({
      _id: id,
      paymentStatus: { $ne: "captured" },
    });

    if (!deleted) {
      const exists = await Registration.exists({ _id: id });
      return NextResponse.json(
        {
          error: exists
            ? "Cannot delete a registration with confirmed payment."
            : "Registration not found.",
        },
        { status: exists ? 409 : 404 },
      );
    }

    await logAudit({
      actor: admin.uid,
      actorRole: admin.role,
      action: "registration.delete",
      resourceType: "registration",
      resourceId: id,
      details: {
        registrationCode: deleted.registrationCode,
        fullName: deleted.fullName,
        paymentStatus: deleted.paymentStatus,
      },
      request,
    });

    return NextResponse.json({ ok: true, id });
  } catch (err) {
    return authErrorResponse(err);
  }
}
