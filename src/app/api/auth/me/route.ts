import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { successResponse, errorResponse } from "@/lib/api-response";
import { verifySecureToken } from "@/lib/security";

export const dynamic = "force-dynamic";

function getBearerToken(request: NextRequest): string | null {
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) return null;
  const token = header.slice(7).trim();
  return token || null;
}

export async function GET(request: NextRequest) {
  try {
    const token = getBearerToken(request);
    if (!token) return errorResponse("Unauthorized", 401);

    const payload = verifySecureToken(token);
    if (!payload?.userId || !payload?.email || !["user", "admin"].includes(payload.type)) {
      return errorResponse("Invalid or expired session", 401);
    }

    // Keep the environment-configured admin session valid even if no matching
    // database user exists, including after a page refresh.
    if (payload.type === "admin" && payload.role === "admin" && payload.userId === "admin-configured") {
      return successResponse({
        id: payload.userId,
        name: payload.name || process.env.ADMIN_NAME || "Snapforest Admin",
        email: payload.email,
        image: payload.image || null,
        role: "admin",
      });
    }

    await connectDB();
    const user = await User.findById(payload.userId).select("-password");
    if (!user || user.email.toLowerCase() !== String(payload.email).toLowerCase()) {
      return errorResponse("User not found", 404);
    }

    return successResponse({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      image: user.image,
      role: user.role,
    });
  } catch (error) {
    console.error("Auth me error:", error);
    return errorResponse("Failed to fetch user");
  }
}
