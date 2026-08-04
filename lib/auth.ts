import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SECRET = process.env.TOKEN_SECRET ?? "";
if (!SECRET) console.warn("[auth] TOKEN_SECRET not set — sessions will fail");

export const SESSION_COOKIE = "apticon_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export type Role = "super_admin" | "reviewer" | "editorial" | "checkin_staff";

export interface SessionPayload {
  uid: string;
  role: Role;
  name: string;
  email: string;
}

const key = new TextEncoder().encode(SECRET);

export async function signSession(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(key);
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, key);
    if (
      typeof payload.uid === "string" &&
      (payload.role === "super_admin" ||
        payload.role === "reviewer" ||
        payload.role === "editorial" ||
        payload.role === "checkin_staff") &&
      typeof payload.name === "string" &&
      typeof payload.email === "string"
    ) {
      return {
        uid: payload.uid,
        role: payload.role,
        name: payload.name,
        email: payload.email,
      };
    }
    return null;
  } catch {
    return null;
  }
}

export async function hashPassword(pw: string): Promise<string> {
  return bcrypt.hash(pw, 12);
}

export async function verifyPassword(pw: string, hash: string): Promise<boolean> {
  return bcrypt.compare(pw, hash);
}

export function generateTempPassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789abcdefghijkmnpqrstuvwxyz";
  let out = "";
  for (let i = 0; i < 12; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out + "!";
}

// ─── Server helpers ─────────────────────────────────────────

export async function getSessionFromCookies(): Promise<SessionPayload | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySession(token);
}

export async function requireRole<R extends Role>(role: R): Promise<SessionPayload & { role: R }> {
  const s = await getSessionFromCookies();
  if (!s) throw new AuthError("Unauthorized", 401);
  if (s.role !== role) throw new AuthError("Forbidden", 403);
  return s as SessionPayload & { role: R };
}

export async function requireAnyRole<R extends Role[]>(...roles: R): Promise<SessionPayload & { role: R[number] }> {
  const s = await getSessionFromCookies();
  if (!s) throw new AuthError("Unauthorized", 401);
  if (!roles.includes(s.role)) throw new AuthError("Forbidden", 403);
  return s as SessionPayload & { role: R[number] };
}

export class AuthError extends Error {
  status: number;
  constructor(message: string, status = 401) {
    super(message);
    this.status = status;
  }
}

export function authErrorResponse(err: unknown): NextResponse {
  if (err instanceof AuthError) {
    return NextResponse.json({ error: err.message }, { status: err.status });
  }
  console.error("[auth] unexpected error:", err);
  return NextResponse.json({ error: "Internal error" }, { status: 500 });
}

export function getClientIp(req: NextRequest | Request): string {
  const h = req.headers;
  const xff = h.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  const real = h.get("x-real-ip");
  if (real) return real.trim();
  return "unknown";
}
