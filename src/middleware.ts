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

/**
 * Extract token from request headers
 * Supports multiple formats:
 * - Authorization: Bearer <token>
 * - Authorization: <token>
 * - token: <token>
 */
function extractToken(request: NextRequest): string | null {
  // Try Authorization header with Bearer prefix
  const authHeader = request.headers.get("authorization");
  if (authHeader) {
    if (authHeader.startsWith("Bearer ")) {
      return authHeader.slice(7);
    }
    // Some clients send token without Bearer prefix
    return authHeader;
  }

  // Try lowercase 'authorization' (some proxies normalize to lowercase)
  const authHeaderLower = request.headers.get("authorization");
  if (authHeaderLower?.startsWith("Bearer ")) {
    return authHeaderLower.slice(7);
  }

  // Try 'token' header (legacy support)
  const tokenHeader = request.headers.get("token");
  if (tokenHeader) {
    return tokenHeader;
  }

  return null;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const securityHeaders = getSecurityHeaders();

  // Handle OPTIONS (CORS preflight) requests immediately
  if (request.method === "OPTIONS") {
    const response = new NextResponse(null, { status: 200 });
    Object.entries(securityHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    // Add CORS headers for preflight
    response.headers.set("Access-Control-Allow-Origin", "*");
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, token, X-Requested-With");
    response.headers.set("Access-Control-Max-Age", "86400");
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
    console.log(`[Middleware] Admin API request: ${pathname}`);
    console.log(`[Middleware] Method: ${request.method}`);
    console.log(`[Middleware] Headers:`, Object.fromEntries(request.headers.entries()));

    const token = extractToken(request);
    console.log(`[Middleware] Extracted token: ${token ? "present" : "MISSING"}`);

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: No token provided" },
        { status: 401 }
      );
    }

    const decoded = verifySecureToken(token);
    console.log(`[Middleware] Token decoded:`, decoded ? `role=${decoded.role}` : "INVALID");

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
    "/api/admin/:path*",
    "/admin/:path*",
    "/((?!_next/static|_next/image|favicon.ico|.*\\.).*)",
  ],
};
