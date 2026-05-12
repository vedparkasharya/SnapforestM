import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

/**
 * Middleware for protecting admin and dashboard routes
 *
 * CRITICAL: /api/auth/* routes are automatically excluded by NextAuth
 * DO NOT include /api/auth/* in the matcher
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
        // Let middleware function handle the actual auth logic
        return true;
      },
    },
    pages: {
      signIn: "/",
      error: "/",
    },
    // Explicitly pass the secret - ensures consistency
    secret: process.env.NEXTAUTH_SECRET,
  }
);

// CRITICAL: Only match protected routes, EXCLUDE /api/auth/*
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/api/admin/:path*",
    "/api/bookings/:path*",
  ],
};
