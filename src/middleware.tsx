import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("access_token")?.value;
  const { pathname } = request.nextUrl;

  // Auth-only routes (login, signup) - redirect to home if already authenticated
  const authOnlyRoutes = ["/login", "/signup"];
  const isAuthOnlyRoute = authOnlyRoutes.some((route) => pathname === route);

  // Protected routes that require authentication
  const protectedRoutes = ["/dashboard", "/compte", "/trainer"];
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname === route || pathname.startsWith(route + "/")
  );

  // If user is logged in and trying to access auth pages (login/signup)
  // Let the client-side auth context verify the token and handle redirects
  // This ensures invalid tokens (e.g. after secret rotation) get cleared properly
  if (token && isAuthOnlyRoute) {
    return NextResponse.next();
  }

  // If user is not logged in and trying to access protected routes
  // redirect them to login
  if (!token && isProtectedRoute) {
    const loginUrl = new URL("/login", request.url);
    // Store the full path including query parameters
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
