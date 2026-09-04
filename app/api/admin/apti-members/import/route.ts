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
    const parsed = aptiMemberImportSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid import format", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    await connectDB();

    const membersToImport = parsed.data.members;

    const ops = membersToImport.map((m) => ({
      updateOne: {
        filter: { memberId: m.memberId },
        update: {
          $set: {
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
          },
        },
        upsert: true,
      },
    }));

    const BATCH_SIZE = 1000;
    let written = 0;
    for (let i = 0; i < ops.length; i += BATCH_SIZE) {
      const batch = ops.slice(i, i + BATCH_SIZE);
      await AptiMember.bulkWrite(batch, { ordered: false });
      written += batch.length;
    }

    await logAudit({
      actor: admin.uid,
      actorRole: "super_admin",
      action: "apti_member.import",
      resourceType: "apti_member",
      details: { count: written },
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
