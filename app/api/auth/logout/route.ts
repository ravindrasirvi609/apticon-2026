import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { getSessionFromCookies, SESSION_COOKIE } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export async function POST(request: NextRequest) {
  const s = await getSessionFromCookies();
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);

  if (s) {
    await logAudit({
      actor: s.uid,
      actorRole: s.role,
      action: "auth.logout",
      resourceType: "auth",
      resourceId: s.uid,
      request,
    });
  }

  return NextResponse.json({ ok: true });
}
