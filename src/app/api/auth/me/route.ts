import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { successResponse, errorResponse } from "@/lib/api-response";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const email = request.headers.get("x-user-email");

    if (!email) {
      return errorResponse("Unauthorized", 401);
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select("-password");
    if (!user) {
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
