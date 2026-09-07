import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { loginSchema } from "@/lib/validators/auth";
import {
  signSession,
  verifyPassword,
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  getClientIp,
} from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const limit = rateLimit(`login:${ip}`, 8, 15 * 60_000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many attempts. Try again later." },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 400 });
  }
  const { email, password } = parsed.data;

  await connectDB();
  const user = await User.findOne({ email, isActive: true }).select(
    "+passwordHash",
  );

  if (!user) {
    await logAudit({
      actorRole: "public",
      action: "auth.login.failed",
      resourceType: "auth",
      details: { email, reason: "user_not_found" },
      request,
    });
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) {
    await logAudit({
      actor: user._id.toString(),
      actorRole: user.role,
      action: "auth.login.failed",
      resourceType: "auth",
      resourceId: user._id.toString(),
      details: { reason: "bad_password" },
      request,
    });
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
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

  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });

  await logAudit({
    actor: user._id.toString(),
    actorRole: user.role,
    action: "auth.login.success",
    resourceType: "auth",
    resourceId: user._id.toString(),
    request,
  });

  return NextResponse.json({
    user: {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      mustChangePassword: user.mustChangePassword,
    },
  });
}
