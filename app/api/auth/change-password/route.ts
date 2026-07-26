import { NextResponse, type NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { changePasswordSchema } from "@/lib/validators/auth";
import { getSessionFromCookies, hashPassword, verifyPassword } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export async function POST(request: NextRequest) {
  const s = await getSessionFromCookies();
  if (!s) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = changePasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  }

  await connectDB();
  const user = await User.findById(s.uid).select("+passwordHash");
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const ok = await verifyPassword(parsed.data.currentPassword, user.passwordHash);
  if (!ok) return NextResponse.json({ error: "Current password is incorrect" }, { status: 401 });

  user.passwordHash = await hashPassword(parsed.data.newPassword);
  user.mustChangePassword = false;
  await user.save();

  await logAudit({
    actor: user._id.toString(),
    actorRole: user.role,
    action: "user.password_change",
    resourceType: "user",
    resourceId: user._id.toString(),
    request,
  });

  return NextResponse.json({ ok: true });
}
