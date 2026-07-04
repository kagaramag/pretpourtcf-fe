import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("access_token")?.value;
  const refreshToken = request.cookies.get("refresh_token")?.value;
  const { pathname } = request.nextUrl;

  // Auth-only routes (login, signup) - redirect to home if already authenticated
  const authOnlyRoutes = ["/login", "/signup"];
  const isAuthOnlyRoute = authOnlyRoutes.some((route) => pathname === route);

  // Protected routes that require authentication
  const protectedRoutes = ["/dashboard", "/compte", "/trainer"];
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname === route || pathname.startsWith(route + "/")
  );

  // Consider user "has session" if either token or refresh token cookie exists.
  // The access token JWT may be expired but the client-side auth context will
  // silently refresh it using the refresh token before making API calls.
  const hasSession = !!token || !!refreshToken;

  // If user has a session and trying to access auth pages (login/signup)
  // Let the client-side auth context verify the token and handle redirects
  if (hasSession && isAuthOnlyRoute) {
    return NextResponse.next();
  }

  // If user has no session and trying to access protected routes
  // redirect them to login
  if (!hasSession && isProtectedRoute) {
    const loginUrl = new URL("/login", request.url);
    const fullPath = pathname + request.nextUrl.search;
    loginUrl.searchParams.set("redirect", fullPath);
    return NextResponse.redirect(loginUrl);
  }

  // Allow the request to proceed
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|public).*)"],
};
