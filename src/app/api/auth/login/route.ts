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
      return errorResponse("Invalid email or password");
    }

    // Check if user has a password (OAuth users might not)
    if (!user.password) {
      return errorResponse("Please use social login for this account");
    }

    const isValidPassword = await bcryptjs.compare(password, user.password);
    if (!isValidPassword) {
      return errorResponse("Invalid email or password");
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

    return successResponse(userResponse, "Login successful");
  } catch (error) {
    console.error("Login error:", error);
    return errorResponse("Failed to login");
  }
}
