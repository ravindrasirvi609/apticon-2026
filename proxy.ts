import { NextResponse, type NextRequest } from "next/server";
import { verifySession, SESSION_COOKIE } from "@/lib/auth";

// Paths that require an authenticated user of a specific role.
// Login/forgot/reset pages themselves are excluded — they must be reachable when logged out.
const ADMIN_PREFIX    = "/admin";
const REVIEWER_PREFIX = "/reviewer";
const APPROVER_PREFIX = "/approver";

const PUBLIC_AUTH_PATHS = new Set([
  "/admin/login",   "/admin/forgot-password",   "/admin/reset-password",
  "/reviewer/login","/reviewer/forgot-password","/reviewer/reset-password",
  "/approver/login","/approver/forgot-password","/approver/reset-password",
]);

const HOME_BY_ROLE: Record<string, string> = {
  super_admin:           ADMIN_PREFIX,
  reviewer:              REVIEWER_PREFIX,
  registration_approver: APPROVER_PREFIX,
};

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_AUTH_PATHS.has(pathname)) return NextResponse.next();

  const wantsAdmin    = pathname.startsWith(ADMIN_PREFIX);
  const wantsReviewer = pathname.startsWith(REVIEWER_PREFIX);
  const wantsApprover = pathname.startsWith(APPROVER_PREFIX);

  if (!wantsAdmin && !wantsReviewer && !wantsApprover) return NextResponse.next();

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySession(token) : null;

  if (!session) {
    const login = wantsAdmin ? "/admin/login" : wantsApprover ? "/approver/login" : "/reviewer/login";
    const loginUrl = new URL(login, request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Role gating — every console is strictly for its own role
  if (wantsAdmin && session.role !== "super_admin") {
    return NextResponse.redirect(new URL(HOME_BY_ROLE[session.role] ?? "/", request.url));
  }
  if (wantsReviewer && session.role !== "reviewer") {
    return NextResponse.redirect(new URL(HOME_BY_ROLE[session.role] ?? "/", request.url));
  }
  if (wantsApprover && session.role !== "registration_approver") {
    return NextResponse.redirect(new URL(HOME_BY_ROLE[session.role] ?? "/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/reviewer/:path*", "/approver/:path*"],
};
