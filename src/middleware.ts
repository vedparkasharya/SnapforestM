import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;
    console.log("[Middleware] path:", path, "token.sub:", token?.sub, "token.role:", (token as any)?.role);

    if (path.startsWith("/admin")) {
      if ((token as any)?.role !== "admin") {
        console.warn("[Middleware] Admin access denied - role:", (token as any)?.role);
        return NextResponse.redirect(new URL("/", req.url));
      }
      console.log("[Middleware] Admin access granted");
    }

    if (path.startsWith("/dashboard") || path.startsWith("/api/user")) {
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
        console.log("[Middleware] authorized callback - hasToken:", !!token);
        return !!token;
      },
    },
    pages: {
      signIn: "/",
    },
  }
);

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/api/user/:path*", "/api/admin/:path*"],
};
