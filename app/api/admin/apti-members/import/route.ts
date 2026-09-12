import { NextResponse, type NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import AptiMember from "@/models/AptiMember";
import { aptiMemberImportSchema } from "@/lib/validators/apti-member";
import { requireRole, authErrorResponse } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export async function POST(request: NextRequest) {
  try {
    const admin = await requireRole("super_admin");
    const body = await request.json().catch(() => null);
    const rawMembers: Record<string, unknown>[] = Array.isArray(body)
      ? body
      : Array.isArray(body?.members)
        ? body.members
        : [];

    // Accept the field names used by the APTI registry export as well as the
    // application's native field names.
    const normalizedMembers = rawMembers.map((m) => {
      const value = (...keys: string[]) => {
        const found = keys
          .map((key) => m[key] ?? m[key.replaceAll("_", "\\_")])
          .find(
            (v) =>
              v !== undefined &&
              v !== null &&
              String(v).trim() !== "",
          );
        return found === undefined || found === null ? "" : String(found).trim();
      };
      const serialNoValue = value("serialNo", "Sl No");

      return {
        memberId: value("memberId", "mem_id"),
        serialNo: /^\d+$/.test(serialNoValue) ? Number(serialNoValue) : undefined,
        stateCode: value("stateCode", "m_state_code"),
        name: value("name", "m_name"),
        email: value("email", "m_email1") || undefined,
        mobile: value("mobile", "m_mobile1"),
        officeAddress: value("officeAddress", "m_ofc_address"),
        city: value("city", "m_ofc_city", "m_res_city"),
        state: value("state", "m_ofc_state", "m_res_state"),
        pincode: value("pincode", "m_ofc_pincode", "m_res_pincode"),
      };
    });
    const parsed = aptiMemberImportSchema.safeParse({ members: normalizedMembers });

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid import format",
          details: parsed.error.flatten(),
          issues: parsed.error.issues.map((issue) => ({
            path: issue.path,
            message: issue.message,
          })),
        },
        { status: 400 },
      );
    }

    await connectDB();

    // Later rows win if the pasted source contains the same membership ID twice.
    const uniqueMembers = Array.from(
      new Map(parsed.data.members.map((member) => [member.memberId, member])).values(),
    );
    const memberIds = uniqueMembers.map((member) => member.memberId);

    // Replace matching IDs, so stale values from an earlier import cannot remain.
    await AptiMember.deleteMany({ memberId: { $in: memberIds } });
    await AptiMember.insertMany(
      uniqueMembers.map((m) => ({
        memberId: m.memberId,
        serialNo: m.serialNo || undefined,
        stateCode: m.stateCode || undefined,
        name: m.name,
        email: m.email || undefined,
        mobile: m.mobile || undefined,
        officeAddress: m.officeAddress || undefined,
        city: m.city || undefined,
        state: m.state || undefined,
        pincode: m.pincode || undefined,
      })),
      { ordered: true },
    );
    const written = uniqueMembers.length;

    await logAudit({
      actor: admin.uid,
      actorRole: "super_admin",
      action: "apti_member.import",
      resourceType: "apti_member",
      details: { count: written, replacedMemberIds: memberIds },
      request,
    });

    return NextResponse.json({
      ok: true,
      importedCount: written,
    });
  } catch (err) {
    return authErrorResponse(err);
  }
}
