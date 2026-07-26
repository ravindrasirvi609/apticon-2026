import { NextResponse, type NextRequest } from "next/server";
import mongoose from "mongoose";
import { registrationLinkSchema } from "@/lib/validators/registration";
import { requireRole, authErrorResponse } from "@/lib/auth";
import { manualLink } from "@/lib/sync";

export async function PATCH(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireRole("super_admin");
    const { id } = await ctx.params;
    if (!mongoose.isValidObjectId(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

    const body = await request.json().catch(() => null);
    const parsed = registrationLinkSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });

    const result = await manualLink(id, parsed.data.abstractId, { uid: admin.uid, role: admin.role }, request);
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    return authErrorResponse(err);
  }
}
