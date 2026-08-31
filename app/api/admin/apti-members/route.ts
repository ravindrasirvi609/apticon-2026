import { NextResponse, type NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import AptiMember from "@/models/AptiMember";
import { aptiMemberCreateSchema } from "@/lib/validators/apti-member";
import { requireRole, authErrorResponse } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export async function GET(request: NextRequest) {
  try {
    await requireRole("super_admin");
    await connectDB();

    const url = new URL(request.url);
    const search = url.searchParams.get("search")?.trim() || url.searchParams.get("q")?.trim() || "";
    const state = url.searchParams.get("state")?.trim() || "";
    const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get("limit") || "20", 10)));
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};

    if (search) {
      const regex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter.$or = [
        { memberId: regex },
        { name: regex },
        { email: regex },
        { mobile: regex },
        { city: regex },
        { state: regex },
      ];
    }

    if (state) {
      filter.state = new RegExp(`^${state.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i");
    }

    const [members, total] = await Promise.all([
      AptiMember.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      AptiMember.countDocuments(filter),
    ]);

    const formattedMembers = members.map((m) => ({
      id: m._id.toString(),
      memberId: m.memberId,
      serialNo: m.serialNo ?? null,
      stateCode: m.stateCode ?? null,
      name: m.name,
      email: m.email ?? null,
      mobile: m.mobile ?? null,
      officeAddress: m.officeAddress ?? null,
      city: m.city ?? null,
      state: m.state ?? null,
      pincode: m.pincode ?? null,
      createdAt: m.createdAt,
      updatedAt: m.updatedAt,
    }));

    return NextResponse.json({
      members: formattedMembers,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    });
  } catch (err) {
    return authErrorResponse(err);
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await requireRole("super_admin");
    const body = await request.json().catch(() => null);
    const parsed = aptiMemberCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
    }

    await connectDB();

    const existing = await AptiMember.findOne({ memberId: parsed.data.memberId });
    if (existing) {
      return NextResponse.json({ error: `APTI Member ID "${parsed.data.memberId}" already exists.` }, { status: 409 });
    }

    const created = await AptiMember.create({
      memberId: parsed.data.memberId,
      serialNo: parsed.data.serialNo || undefined,
      stateCode: parsed.data.stateCode || undefined,
      name: parsed.data.name,
      email: parsed.data.email || undefined,
      mobile: parsed.data.mobile || undefined,
      officeAddress: parsed.data.officeAddress || undefined,
      city: parsed.data.city || undefined,
      state: parsed.data.state || undefined,
      pincode: parsed.data.pincode || undefined,
    });

    await logAudit({
      actor: admin.uid,
      actorRole: "super_admin",
      action: "apti_member.create",
      resourceType: "apti_member",
      resourceId: created._id.toString(),
      details: { memberId: created.memberId, name: created.name, email: created.email },
      request,
    });

    return NextResponse.json({
      ok: true,
      member: {
        id: created._id.toString(),
        memberId: created.memberId,
        serialNo: created.serialNo ?? null,
        stateCode: created.stateCode ?? null,
        name: created.name,
        email: created.email ?? null,
        mobile: created.mobile ?? null,
        officeAddress: created.officeAddress ?? null,
        city: created.city ?? null,
        state: created.state ?? null,
        pincode: created.pincode ?? null,
        createdAt: created.createdAt,
        updatedAt: created.updatedAt,
      },
    });
  } catch (err) {
    return authErrorResponse(err);
  }
}
