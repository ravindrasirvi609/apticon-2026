import { NextResponse, type NextRequest } from "next/server";
import crypto from "crypto";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import PasswordReset from "@/models/PasswordReset";
import { resetPasswordSchema } from "@/lib/validators/auth";
import { hashPassword } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = resetPasswordSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const { token, password } = parsed.data;
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  await connectDB();
  const reset = await PasswordReset.findOne({
    tokenHash,
    usedAt: { $exists: false },
  });
  if (!reset || reset.expiresAt < new Date()) {
    return NextResponse.json(
      { error: "Invalid or expired token" },
      { status: 400 },
    );
  }

  const user = await User.findById(reset.user).select("+passwordHash");
  if (!user || !user.isActive) {
    return NextResponse.json(
      { error: "Invalid or expired token" },
      { status: 400 },
    );
  }

  user.passwordHash = await hashPassword(password);
  user.mustChangePassword = false;
  await user.save();

  reset.usedAt = new Date();
  await reset.save();

  await logAudit({
    actor: user._id.toString(),
    actorRole: user.role,
    action: "auth.password_reset",
    resourceType: "auth",
    resourceId: user._id.toString(),
    request,
  });

  return NextResponse.json({ ok: true });
}
