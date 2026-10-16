import { AuthError } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Registration from "@/models/Registration";
import {
  requireDelegate,
  type DelegateSession,
} from "@/lib/mobile/delegate-auth";
import {
  getCatalogSession,
  isInteractive,
} from "@/lib/mobile/session-windows";
import type { CatalogSession } from "@/lib/mobile/session-catalog";

/**
 * Token check PLUS a live look at the registration: a JWT outlives a later rejection/refund, so
 * every write re-confirms the registration is still approved. Connects the DB as a side effect.
 */
export async function requireApprovedDelegate(
  req: Request,
): Promise<DelegateSession> {
  const session = await requireDelegate(req);
  await connectDB();
  const registration = await Registration.findById(session.rid)
    .select("status")
    .lean();
  if (!registration || registration.status !== "approved") {
    throw new AuthError("Forbidden", 403);
  }
  return session;
}

/** Resolves a session id to an interactive (askable/ratable) session or throws a 404. */
export function requireInteractiveSession(sessionId: string): CatalogSession {
  const session = getCatalogSession(sessionId);
  if (!session || !isInteractive(session)) {
    throw new AuthError("Session not found", 404);
  }
  return session;
}
