import type { NextRequest } from "next/server";
import { requireStaff } from "@/lib/mobile/auth";
import { logAudit } from "@/lib/audit";
import { ok, failFromError } from "@/lib/mobile/response";

// The mobile session is a stateless JWT, so there's nothing to invalidate server-side —
// the client discards its stored token. This endpoint exists so the "Logout" action still
// records who logged out and when.
export async function POST(request: NextRequest) {
  try {
    const session = await requireStaff(request);
    await logAudit({
      actor: session.uid,
      actorRole: session.role,
      action: "mobile.auth.logout",
      resourceType: "auth",
      resourceId: session.uid,
      request,
    });
    return ok(null, "Logged out");
  } catch (err) {
    return failFromError(err, "/auth/logout");
  }
}
