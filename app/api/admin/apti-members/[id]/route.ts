import { NextResponse, type NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import AptiMember from "@/models/AptiMember";
import { aptiMemberUpdateSchema } from "@/lib/validators/apti-member";
import { requireRole, authErrorResponse } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole("super_admin");
    const { id } = await params;
    await connectDB();

    const member = await AptiMember.findById(id).lean();
    if (!member) {
      return NextResponse.json({ error: "APTI member not found" }, { status: 404 });
    }

    return NextResponse.json({
      member: {
        id: member._id.toString(),
        memberId: member.memberId,
        serialNo: member.serialNo ?? null,
        stateCode: member.stateCode ?? null,
        name: member.name,
        email: member.email ?? null,
        mobile: member.mobile ?? null,
        officeAddress: member.officeAddress ?? null,
        city: member.city ?? null,
        state: member.state ?? null,
        pincode: member.pincode ?? null,
        createdAt: member.createdAt,
        updatedAt: member.updatedAt,
      },
    });
  } catch (err) {
    return authErrorResponse(err);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireRole("super_admin");
    const { id } = await params;
    const body = await request.json().catch(() => null);
    const parsed = aptiMemberUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
    }

    await connectDB();

    const member = await AptiMember.findById(id);
    if (!member) {
      return NextResponse.json({ error: "APTI member not found" }, { status: 404 });
    }

    const updates = parsed.data;
    if (updates.name !== undefined) member.name = updates.name;
    if (updates.serialNo !== undefined) member.serialNo = updates.serialNo || undefined;
    if (updates.stateCode !== undefined) member.stateCode = updates.stateCode || undefined;
    if (updates.email !== undefined) member.email = updates.email || undefined;
    if (updates.mobile !== undefined) member.mobile = updates.mobile || undefined;
    if (updates.officeAddress !== undefined) member.officeAddress = updates.officeAddress || undefined;
    if (updates.city !== undefined) member.city = updates.city || undefined;
    if (updates.state !== undefined) member.state = updates.state || undefined;
    if (updates.pincode !== undefined) member.pincode = updates.pincode || undefined;

    await member.save();

    await logAudit({
      actor: admin.uid,
      actorRole: "super_admin",
      action: "apti_member.update",
      resourceType: "apti_member",
      resourceId: member._id.toString(),
      details: { memberId: member.memberId, name: member.name, updates },
      request,
    });

    return NextResponse.json({
      ok: true,
      member: {
        id: member._id.toString(),
        memberId: member.memberId,
        serialNo: member.serialNo ?? null,
        stateCode: member.stateCode ?? null,
        name: member.name,
        email: member.email ?? null,
        mobile: member.mobile ?? null,
        officeAddress: member.officeAddress ?? null,
        city: member.city ?? null,
        state: member.state ?? null,
        pincode: member.pincode ?? null,
        createdAt: member.createdAt,
        updatedAt: member.updatedAt,
      },
    });
  } catch (err) {
    return authErrorResponse(err);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireRole("super_admin");
    const { id } = await params;
    await connectDB();

    const member = await AptiMember.findByIdAndDelete(id);
    if (!member) {
      return NextResponse.json({ error: "APTI member not found" }, { status: 404 });
    }

    await logAudit({
      actor: admin.uid,
      actorRole: "super_admin",
      action: "apti_member.delete",
      resourceType: "apti_member",
      resourceId: id,
      details: { memberId: member.memberId, name: member.name },
      request,
    });

    return NextResponse.json({ ok: true, id });
  } catch (err) {
    return authErrorResponse(err);
  }
}
