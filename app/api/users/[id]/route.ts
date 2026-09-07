import { NextResponse, type NextRequest } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { userUpdateSchema } from "@/lib/validators/user";
import { requireRole, authErrorResponse } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

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
    const parsed = userUpdateSchema.safeParse(body);
    if (!parsed.success)
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 },
      );

    await connectDB();
    const user = await User.findById(id);
    if (!user)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Prevent deactivating self
    if (user._id.toString() === admin.uid && parsed.data.isActive === false) {
      return NextResponse.json(
        { error: "You cannot deactivate yourself." },
        { status: 400 },
      );
    }

    const before = {
      name: user.name,
      expertise: user.expertise,
      isActive: user.isActive,
    };

    if (parsed.data.name !== undefined) user.name = parsed.data.name;
    if (parsed.data.expertise !== undefined)
      user.expertise = parsed.data.expertise;
    if (parsed.data.isActive !== undefined)
      user.isActive = parsed.data.isActive;
    await user.save();

    await logAudit({
      actor: admin.uid,
      actorRole: "super_admin",
      action: "user.update",
      resourceType: "user",
      resourceId: user._id.toString(),
      details: { before, after: parsed.data },
      request,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    return authErrorResponse(err);
  }
}
