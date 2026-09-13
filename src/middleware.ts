import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySecureToken, getSecurityHeaders } from "@/lib/security";

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
  "/api/webhook",
  "/api/rooms",
];

function withSecurityHeaders(response: NextResponse) {
  Object.entries(getSecurityHeaders()).forEach(([key, value]) => response.headers.set(key, value));
  return response;
}

export function middleware(request: NextRequest) {
  const { pathname, method } = request.nextUrl;

  if (method === "OPTIONS" && pathname.startsWith("/api/admin")) {
    const response = new NextResponse(null, { status: 204 });
    response.headers.set("Access-Control-Allow-Origin", request.headers.get("origin") || "*");
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, token, X-Requested-With");
    response.headers.set("Access-Control-Max-Age", "86400");
    return withSecurityHeaders(response);
  }

  if (publicPaths.some((path) => pathname === path) || pathname.startsWith("/_next/") || pathname.startsWith("/images/") || pathname.startsWith("/icon-") || pathname === "/manifest.json" || pathname === "/favicon.ico") {
    return withSecurityHeaders(NextResponse.next());
  }

  if (pathname.startsWith("/api/bookings/cancel")) {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7).trim() : null;
    const decoded = token ? verifySecureToken(token) : null;
    if (!decoded?.userId || !["user", "admin"].includes(decoded.type)) {
      return withSecurityHeaders(NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 }));
    }
    return withSecurityHeaders(NextResponse.next());
  }

  if (pathname.startsWith("/api/admin")) {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7).trim() : request.headers.get("token");
    const decoded = token ? verifySecureToken(token) : null;
    if (!decoded || decoded.role !== "admin") {
      return withSecurityHeaders(NextResponse.json({ success: false, message: "Unauthorized: Admin access required" }, { status: 403 }));
    }
    return withSecurityHeaders(NextResponse.next());
  }

  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const response = withSecurityHeaders(NextResponse.next());
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");
    return response;
  }

  return withSecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.).*)"],
};
