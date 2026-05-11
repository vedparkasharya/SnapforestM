import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    if (path.startsWith("/admin")) {
      if ((token as any)?.role !== "admin") {
        return NextResponse.redirect(new URL("/", req.url));
      }
    }

    if (path.startsWith("/dashboard") || path.startsWith("/api/user")) {
      if (!token) {
        return NextResponse.redirect(new URL("/", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized({ token }) {
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
