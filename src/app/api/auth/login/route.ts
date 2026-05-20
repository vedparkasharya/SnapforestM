import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import {
  generateSecureToken,
  trackLoginAttempt,
  resetLoginAttempts,
  comparePassword,
  checkRateLimit,
  getClientIP,
  getSecurityHeaders,
  sanitizeInput,
} from "@/lib/security";

export async function POST(request: NextRequest) {
  const headers = getSecurityHeaders();
  const clientIP = getClientIP(request.headers);
  const rateLimitKey = `login:${clientIP}`;

  try {
    // Rate limiting: 10 attempts per 15 minutes per IP
    const rateLimit = checkRateLimit(rateLimitKey, 10, 15 * 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          message: "Too many login attempts. Please try again later.",
          retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000),
        },
        { status: 429, headers }
      );
    }

    await connectDB();
    const body = await request.json();
    const { email, password } = body;

    // Input validation
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password are required" },
        { status: 400, headers }
      );
    }

    if (typeof email !== "string" || typeof password !== "string") {
      return NextResponse.json(
        { success: false, message: "Invalid input format" },
        { status: 400, headers }
      );
    }

    const sanitizedEmail = sanitizeInput(email).toLowerCase().trim();

    if (!sanitizedEmail || !password) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password" },
        { status: 400, headers }
      );
    }

    // Brute force check
    const bruteForceCheck = trackLoginAttempt(`${clientIP}:${sanitizedEmail}`);
    if (bruteForceCheck.locked) {
      const minutes = Math.ceil(bruteForceCheck.lockDuration / 60000);
      return NextResponse.json(
        {
          success: false,
          message: `Too many failed attempts. Account locked for ${minutes} minute(s).`,
        },
        { status: 423, headers }
      );
    }

    const user = await User.findOne({ email: sanitizedEmail });
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password" },
        { status: 401, headers }
      );
    }

    // Check if user has a password (OAuth users might not)
    if (!user.password) {
      return NextResponse.json(
        {
          success: false,
          message: "Please use social login for this account",
        },
        { status: 401, headers }
      );
    }

    // Prevent admin accounts from user login endpoint
    if (user.role === "admin") {
      return NextResponse.json(
        {
          success: false,
          message: "Please use admin login portal",
        },
        { status: 403, headers }
      );
    }

    const isValidPassword = await comparePassword(password, user.password);
    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password" },
        { status: 401, headers }
      );
    }

    // Success - reset login attempts
    resetLoginAttempts(`${clientIP}:${sanitizedEmail}`);

    // Generate HMAC-signed secure token
    const tokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      type: "user",
      ip: clientIP,
    };
    const secureToken = generateSecureToken(tokenPayload);

    const userResponse = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      image: user.image,
      role: user.role,
      token: secureToken,
    };

    return NextResponse.json(
      {
        success: true,
        data: userResponse,
        message: "Login successful",
      },
      { status: 200, headers }
    );
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, message: "Authentication failed. Please try again." },
      { status: 500, headers }
    );
  }
}
