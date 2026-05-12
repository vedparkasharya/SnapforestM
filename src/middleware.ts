import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

/**
 * Middleware for protecting routes with NextAuth
 * 
 * IMPORTANT: /api/auth/* routes are automatically excluded
 * by NextAuth and should NEVER be included in the matcher
 */
export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    console.log("[Middleware] path:", path, "hasToken:", !!token, "role:", (token as any)?.role);

    // Admin route protection
    if (path.startsWith("/admin") || path.startsWith("/api/admin")) {
      if ((token as any)?.role !== "admin") {
        console.warn("[Middleware] Admin access denied - role:", (token as any)?.role);
        return NextResponse.redirect(new URL("/", req.url));
      }
      console.log("[Middleware] Admin access granted");
    }

    // Protected routes: dashboard requires authentication
    if (path.startsWith("/dashboard")) {
      if (!token) {
        console.warn("[Middleware] No token for protected path:", path);
        return NextResponse.redirect(new URL("/", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized({ token }) {
        // Always return true to let the middleware function handle auth logic
        // This prevents redirect loops while still allowing token inspection
        return true;
      },
    },
    pages: {
      signIn: "/",
      error: "/",
    },
    // Note: secret is automatically read from NEXTAUTH_SECRET env var
  }
);

// CRITICAL: Only match protected routes, EXCLUDE /api/auth/*
// DO NOT include /api/auth/* in the matcher - it will break authentication
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/api/admin/:path*",
    "/api/bookings/:path*",
  ],
};
