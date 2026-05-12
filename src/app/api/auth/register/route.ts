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
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return errorResponse("Name, email and password are required");
    }

    if (password.length < 6) {
      return errorResponse("Password must be at least 6 characters");
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return errorResponse("User already exists with this email");
    }

    const hashedPassword = await bcryptjs.hash(password, 12);
    const token = crypto.randomBytes(48).toString("hex");

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      image: null,
      role: "user",
    });

    // Create session token entry (stored in client localStorage)
    const userResponse = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      image: user.image,
      role: user.role,
      token: token,
    };

    return successResponse(userResponse, "User registered successfully");
  } catch (error) {
    console.error("Register error:", error);
    return errorResponse("Failed to register user");
  }
}
