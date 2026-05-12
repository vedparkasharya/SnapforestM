import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Paths that don't require authentication
const publicPaths = [
  "/",
  "/rooms",
  "/login",
  "/admin/login",
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/me",
  "/api/auth/logout",
  "/api/auth/admin-login",
  "/api/seed",
  "/api/webhook",
  "/api/rooms",
];

// Admin paths that require admin role
const adminPaths = ["/admin"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always allow API routes that are public
  if (
    publicPaths.some(
      (path) =>
        pathname === path ||
        pathname.startsWith("/api/rooms/") ||
        pathname.startsWith("/api/bookings/")
    )
  ) {
    return NextResponse.next();
  }

  // Admin API routes
  if (pathname.startsWith("/api/admin")) {
    return NextResponse.next();
  }

  // Admin pages - client-side will handle actual auth check
  if (
    adminPaths.some((path) => pathname.startsWith(path)) &&
    pathname !== "/admin/login"
  ) {
    return NextResponse.next();
  }

  // Allow all other paths
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.).*)",
  ],
};
