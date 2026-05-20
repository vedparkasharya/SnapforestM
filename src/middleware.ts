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
  const { pathname, method } = request.nextUrl;

  // Add security headers to all responses
  const headers = new Headers(request.headers);
  const securityHeaders = getSecurityHeaders();

  // ── CORS Preflight (OPTIONS) ──────────────────────
  // Always allow OPTIONS requests for admin API routes
  // Browser sends OPTIONS before the actual request with auth headers
  if (method === "OPTIONS" && pathname.startsWith("/api/admin")) {
    const response = new NextResponse(null, { status: 204 });
    response.headers.set("Access-Control-Allow-Origin", "*");
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, token, X-Requested-With");
    response.headers.set("Access-Control-Max-Age", "86400");
    Object.entries(securityHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    return response;
  }

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
    // Read token from Authorization header OR legacy 'token' header
    const authHeader = request.headers.get("authorization");
    let token: string | null = null;

    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.slice(7);
    }

    // Fallback: read from 'token' header (some frontend configs)
    if (!token) {
      token = request.headers.get("token");
    }

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: No token provided" },
        { status: 401 }
      );
    }

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
