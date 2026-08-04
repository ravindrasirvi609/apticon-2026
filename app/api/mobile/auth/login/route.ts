import type { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { loginSchema } from "@/lib/validators/auth";
import { signSession, verifyPassword, getClientIp } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { rateLimit } from "@/lib/rate-limit";
import { ok, fail } from "@/lib/mobile/response";

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const limit = rateLimit(`mobile-login:${ip}`, 8, 15 * 60_000);
  if (!limit.ok) return fail("Too many attempts. Try again later.", [], 429);

  const body = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) return fail("Invalid credentials", [], 400);
  const { email, password } = parsed.data;

  await connectDB();
  const user = await User.findOne({
    email,
    isActive: true,
    role: { $in: ["checkin_staff", "super_admin"] },
  }).select("+passwordHash");

  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    await logAudit({
      actorRole: "public",
      action: "mobile.auth.login.failed",
      resourceType: "auth",
      details: { email },
      request,
    });
    return fail("Invalid credentials", [], 401);
  }

  user.lastLoginAt = new Date();
  user.lastLoginIp = ip;
  await user.save();

  const token = await signSession({
    uid: user._id.toString(),
    role: user.role,
    name: user.name,
    email: user.email,
  });

  await logAudit({
    actor: user._id.toString(),
    actorRole: user.role,
    action: "mobile.auth.login.success",
    resourceType: "auth",
    resourceId: user._id.toString(),
    request,
  });

  return ok({
    token,
    user: {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      mustChangePassword: user.mustChangePassword,
    },
  });
}
