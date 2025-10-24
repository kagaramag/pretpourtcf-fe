import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("access_token")?.value;
  const { pathname } = request.nextUrl;

  // Auth-only routes (login, signup) - redirect to home if already authenticated
  const authOnlyRoutes = ["/login", "/signup"];
  const isAuthOnlyRoute = authOnlyRoutes.some((route) => pathname === route);

  // Protected routes that require authentication
  const protectedRoutes = ["/dashboard", "/compte"];
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname === route || pathname.startsWith(route + "/")
  );

  // If user is logged in and trying to access auth pages (login/signup)
  // Don't redirect to home - the auth context will handle role-based redirects
  // Just prevent access to these pages
  if (token && isAuthOnlyRoute) {
    // Let the client-side auth context handle the redirect based on role
    return NextResponse.redirect(new URL("/", request.url));
  }

  // If user is not logged in and trying to access protected routes
  // redirect them to login
  if (!token && isProtectedRoute) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Allow the request to proceed
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|public).*)"],
};
