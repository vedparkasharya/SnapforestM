import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySecureToken, getSecurityHeaders } from "@/lib/security";

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

  // Add security headers to all responses
  const headers = new Headers(request.headers);
  const securityHeaders = getSecurityHeaders();

  // Check if path is public
  const isPublicPath = publicPaths.some(
    (path) =>
      pathname === path ||
      pathname.startsWith("/api/rooms/") ||
      pathname.startsWith("/api/bookings/") ||
      pathname.startsWith("/_next/") ||
      pathname.startsWith("/images/") ||
      pathname.startsWith("/icon-") ||
      pathname === "/manifest.json" ||
      pathname === "/favicon.ico"
  );

  // Always allow public paths
  if (isPublicPath) {
    const response = NextResponse.next();
    Object.entries(securityHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    return response;
  }

  // Admin API routes - verify admin token
  if (pathname.startsWith("/api/admin")) {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: No token provided" },
        { status: 401 }
      );
    }

    const token = authHeader.slice(7);
    const decoded = verifySecureToken(token);

    if (!decoded || decoded.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Admin access required" },
        { status: 403 }
      );
    }

    const response = NextResponse.next();
    Object.entries(securityHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    return response;
  }

  // Admin pages (except login) - client-side handles auth, but we add headers
  if (
    adminPaths.some((path) => pathname.startsWith(path)) &&
    pathname !== "/admin/login"
  ) {
    const response = NextResponse.next();
    Object.entries(securityHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    // Add cache prevention for admin pages
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");
    return response;
  }

  // All other paths - add security headers
  const response = NextResponse.next();
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.).*)",
  ],
};
