import { AuthError, verifySession, type SessionPayload } from "@/lib/auth";

// Mobile clients can't rely on the httpOnly session cookie the web app uses, so they send the
// same JWT (signed by lib/auth.ts's signSession) as a Bearer token instead. Verification reuses
// verifySession — the token format and secret are identical, only the transport differs.
export async function getSessionFromRequest(
  req: Request,
): Promise<SessionPayload | null> {
  const header = req.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) return null;
  const token = header.slice("Bearer ".length).trim();
  if (!token) return null;
  return verifySession(token);
}

const STAFF_ROLES: SessionPayload["role"][] = ["checkin_staff", "super_admin"];

export async function requireStaff(req: Request): Promise<SessionPayload> {
  const session = await getSessionFromRequest(req);
  if (!session) throw new AuthError("Unauthorized", 401);
  if (!STAFF_ROLES.includes(session.role))
    throw new AuthError("Forbidden", 403);
  return session;
}
