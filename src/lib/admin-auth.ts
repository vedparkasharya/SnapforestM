import { NextRequest, NextResponse } from "next/server";
import { verifySecureToken } from "./security";

/**
 * Extract admin token from request headers
 * Supports: Authorization: Bearer <token>, Authorization: <token>, token: <token>
 */
export function extractAdminToken(request: NextRequest): string | null {
  // Try Authorization header with Bearer prefix
  const authHeader = request.headers.get("authorization");
  if (authHeader) {
    if (authHeader.startsWith("Bearer ")) {
      return authHeader.slice(7);
    }
    return authHeader;
  }

  // Try 'token' header (legacy support)
  const tokenHeader = request.headers.get("token");
  if (tokenHeader) {
    return tokenHeader;
  }

  return null;
}

/**
 * Verify admin authentication from request
 * Returns decoded token payload or null if invalid
 */
export function verifyAdminAuth(request: NextRequest): Record<string, any> | null {
  try {
    const token = extractAdminToken(request);
    if (!token) return null;

    const decoded = verifySecureToken(token);
    if (!decoded || decoded.role !== "admin") return null;

    return decoded;
  } catch (error) {
    console.error("[Admin Auth] Verification error:", error);
    return null;
  }
}

/**
 * Middleware-style admin auth check for API routes
 * Returns a NextResponse error if auth fails, or null if auth passes
 */
export function requireAdminAuth(request: NextRequest): NextResponse | null {
  const token = extractAdminToken(request);

  if (!token) {
    return NextResponse.json(
      { success: false, message: "Unauthorized: No token provided" },
      { status: 401 }
    );
  }

  const decoded = verifyAdminAuth(request);
  if (!decoded) {
    return NextResponse.json(
      { success: false, message: "Unauthorized: Admin access required" },
      { status: 403 }
    );
  }

  return null; // Auth passed
}
