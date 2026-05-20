/**
 * Shared admin authentication helper for API routes.
 * Use this at the top of every admin API route handler.
 */
import { NextRequest, NextResponse } from "next/server";
import { verifySecureToken } from "./security";

export function checkAdminAuth(request: NextRequest):
  | { success: true; decoded: Record<string, any> }
  | { success: false; response: NextResponse } {
  // 1. Bypass OPTIONS preflight (CORS)
  if (request.method === "OPTIONS") {
    return { success: true, decoded: { role: "admin", bypass: true } };
  }

  // 2. Read token from Authorization header (Bearer <token>)
  const authHeader = request.headers.get("authorization");
  let token: string | null = null;

  if (authHeader?.startsWith("Bearer ")) {
    token = authHeader.slice(7);
  }

  // 3. Also try reading from 'token' header (legacy support)
  if (!token) {
    token = request.headers.get("token");
  }

  // 4. No token found
  if (!token) {
    return {
      success: false,
      response: NextResponse.json(
        { success: false, message: "Unauthorized: No token provided" },
        { status: 401 }
      ),
    };
  }

  // 5. Verify token
  const decoded = verifySecureToken(token);
  if (!decoded || decoded.role !== "admin") {
    return {
      success: false,
      response: NextResponse.json(
        { success: false, message: "Unauthorized: Admin access required" },
        { status: 403 }
      ),
    };
  }

  return { success: true, decoded };
}
