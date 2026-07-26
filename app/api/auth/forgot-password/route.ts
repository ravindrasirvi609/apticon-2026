import { NextResponse, type NextRequest } from "next/server";
import crypto from "crypto";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import PasswordReset from "@/models/PasswordReset";
import { forgotPasswordSchema } from "@/lib/validators/auth";
import { sendMail, passwordResetEmail } from "@/lib/email";
import { logAudit } from "@/lib/audit";
import { rateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const limit = rateLimit(`forgot:${ip}`, 5, 15 * 60_000);
  if (!limit.ok) return NextResponse.json({ ok: true }); // silent

  const body = await request.json().catch(() => null);
  const parsed = forgotPasswordSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok: true });

  await connectDB();
  const user = await User.findOne({ email: parsed.data.email, isActive: true });

  // Silent success — never reveal whether email exists
  if (!user) return NextResponse.json({ ok: true });

  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  await PasswordReset.create({
    user: user._id,
    tokenHash,
    expiresAt: new Date(Date.now() + 30 * 60_000),
  });

  const { subject, html } = passwordResetEmail(user.name, token, user.role);
  await sendMail({ to: user.email, subject, html });

  await logAudit({
    actor: user._id.toString(),
    actorRole: user.role,
    action: "auth.forgot_password",
    resourceType: "auth",
    resourceId: user._id.toString(),
    request,
  });

  return NextResponse.json({ ok: true });
}
