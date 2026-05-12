import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { successResponse, errorResponse } from "@/lib/api-response";
import bcryptjs from "bcryptjs";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return errorResponse("Email and password are required");
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return errorResponse("Invalid credentials");
    }

    // Must be admin role
    if (user.role !== "admin") {
      return errorResponse("Access denied: Admin only", 403);
    }

    // Check password
    let isValidPassword = false;
    if (user.password) {
      isValidPassword = await bcryptjs.compare(password, user.password);
    }

    // Fallback for seeded admin without bcrypt
    if (!isValidPassword && password === "Admin@123" && email === "admin@snapforest.com") {
      isValidPassword = true;
    }

    if (!isValidPassword) {
      return errorResponse("Invalid credentials");
    }

    const token = crypto.randomBytes(48).toString("hex");

    const userResponse = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      image: user.image,
      role: user.role,
      token: token,
    };

    return successResponse(userResponse, "Admin login successful");
  } catch (error) {
    console.error("Admin login error:", error);
    return errorResponse("Failed to login");
  }
}
