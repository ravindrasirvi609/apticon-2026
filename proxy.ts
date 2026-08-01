import { NextResponse, type NextRequest } from "next/server";
import { verifySession, SESSION_COOKIE } from "@/lib/auth";

// Paths that require an authenticated user of a specific role.
// Login/forgot/reset pages themselves are excluded — they must be reachable when logged out.
const ADMIN_PREFIX     = "/admin";
const REVIEWER_PREFIX  = "/reviewer";
const EDITORIAL_PREFIX = "/editorial";

const PUBLIC_AUTH_PATHS = new Set([
  "/admin/login",    "/admin/forgot-password",    "/admin/reset-password",
  "/reviewer/login", "/reviewer/forgot-password", "/reviewer/reset-password",
  "/editorial/login","/editorial/forgot-password","/editorial/reset-password",
]);

const HOME_BY_ROLE: Record<string, string> = {
  super_admin: ADMIN_PREFIX,
  reviewer:    REVIEWER_PREFIX,
  editorial:   EDITORIAL_PREFIX,
};

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_AUTH_PATHS.has(pathname)) return NextResponse.next();

  const wantsAdmin     = pathname.startsWith(ADMIN_PREFIX);
  const wantsReviewer  = pathname.startsWith(REVIEWER_PREFIX);
  const wantsEditorial = pathname.startsWith(EDITORIAL_PREFIX);

  if (!wantsAdmin && !wantsReviewer && !wantsEditorial) return NextResponse.next();

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySession(token) : null;

  if (!session) {
    const login = wantsAdmin ? "/admin/login" : wantsEditorial ? "/editorial/login" : "/reviewer/login";
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
  if (wantsEditorial && session.role !== "editorial") {
    return NextResponse.redirect(new URL(HOME_BY_ROLE[session.role] ?? "/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/reviewer/:path*", "/editorial/:path*"],
};
