import { NextResponse, type NextRequest } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Registration from "@/models/Registration";
import Abstract from "@/models/Abstract";
import { getSessionFromCookies } from "@/lib/auth";

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  if (!mongoose.isValidObjectId(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const s = await getSessionFromCookies();
  if (!s) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (s.role !== "super_admin" && s.role !== "registration_approver") {
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

  // Redact internalNote for approvers (admin-only field)
  if (s.role === "registration_approver") {
    delete (reg as Partial<typeof reg>).internalNote;
  }

  return NextResponse.json({ registration: reg, linkedAbstract });
}
