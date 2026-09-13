import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE = "usdx_admin_session";

/**
 * Optimistic guard for the /admin area. The authoritative authorization check
 * happens server-side in the admin layout and in every admin API route.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = request.cookies.has(SESSION_COOKIE);

  if (pathname === "/admin/login") {
    if (hasSession) {
      return NextResponse.redirect(new URL("/admin", request.nextUrl));
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin")) {
    if (!hasSession) {
      return NextResponse.redirect(
        new URL("/admin/login", request.nextUrl)
      );
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};