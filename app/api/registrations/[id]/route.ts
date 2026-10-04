import { NextResponse, type NextRequest } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Registration from "@/models/Registration";
import Abstract from "@/models/Abstract";
import { getSessionFromCookies, requireRole, authErrorResponse } from "@/lib/auth";
import { generateRegistrationQrDataUrl } from "@/lib/qrcode";
import { logAudit } from "@/lib/audit";
import { publicUrl } from "@/lib/r2";
import { updateRegistrationPersonalSchema } from "@/lib/validators/registration";

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

// PATCH — super_admin only, to edit delegate's personal information (name, contact, institution, photo, etc.)
// Strictly excludes payment and status related data.
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
    const parsed = updateRegistrationPersonalSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    await connectDB();
    const reg = await Registration.findById(id);
    if (!reg) {
      return NextResponse.json(
        { error: "Registration not found" },
        { status: 404 },
      );
    }

    const data = parsed.data;
    const oldValues = {
      fullName: reg.fullName,
      email: reg.email,
      phone: reg.phone,
      designation: reg.designation,
      institution: reg.institution,
      affiliation: reg.affiliation || "",
      city: reg.city || "",
      state: reg.state || "",
      photoUrl: reg.photoUrl || "",
      remarks: reg.remarks || "",
    };

    reg.fullName = data.fullName;
    reg.email = data.email;
    reg.phone = data.phone;
    reg.designation = data.designation;
    reg.institution = data.institution;
    reg.affiliation = data.affiliation ?? "";
    reg.city = data.city ?? "";
    reg.state = data.state ?? "";
    reg.remarks = data.remarks ?? "";

    if (data.photoKey !== undefined) {
      if (data.photoKey) {
        reg.photoKey = data.photoKey;
        reg.photoUrl = publicUrl(data.photoKey);
        reg.photoName = data.photoName ?? "";
      } else {
        reg.photoKey = "";
        reg.photoUrl = "";
        reg.photoName = "";
      }
    }

    await reg.save();

    const newValues = {
      fullName: reg.fullName,
      email: reg.email,
      phone: reg.phone,
      designation: reg.designation,
      institution: reg.institution,
      affiliation: reg.affiliation,
      city: reg.city,
      state: reg.state,
      photoUrl: reg.photoUrl,
      remarks: reg.remarks,
    };

    const changes: Record<string, { from: unknown; to: unknown }> = {};
    for (const key of Object.keys(newValues) as (keyof typeof newValues)[]) {
      if (oldValues[key] !== newValues[key]) {
        changes[key] = { from: oldValues[key], to: newValues[key] };
      }
    }

    await logAudit({
      actor: admin.uid,
      actorRole: admin.role,
      action: "registration.update",
      resourceType: "registration",
      resourceId: id,
      details: {
        registrationCode: reg.registrationCode,
        changes,
      },
      request,
    });

    return NextResponse.json({
      ok: true,
      registration: reg.toObject(),
    });
  } catch (err) {
    return authErrorResponse(err);
  }
}
