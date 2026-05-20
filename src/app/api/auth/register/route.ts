import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import {
  generateSecureToken,
  hashPassword,
  checkRateLimit,
  getClientIP,
  getSecurityHeaders,
  sanitizeInput,
} from "@/lib/security";

// Email validation regex
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export async function POST(request: NextRequest) {
  const headers = getSecurityHeaders();
  const clientIP = getClientIP(request.headers);
  const rateLimitKey = `register:${clientIP}`;

  try {
    // Rate limiting: 3 registrations per hour per IP
    const rateLimit = checkRateLimit(rateLimitKey, 3, 60 * 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          message: "Too many registration attempts. Please try again later.",
          retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000),
        },
        { status: 429, headers }
      );
    }

    await connectDB();
    const body = await request.json();
    const { name, email, password } = body;

    // Input validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, message: "Name, email and password are required" },
        { status: 400, headers }
      );
    }

    if (typeof name !== "string" || typeof email !== "string" || typeof password !== "string") {
      return NextResponse.json(
        { success: false, message: "Invalid input format" },
        { status: 400, headers }
      );
    }

    // Sanitize inputs
    const sanitizedName = sanitizeInput(name);
    const sanitizedEmail = sanitizeInput(email).toLowerCase().trim();

    if (!sanitizedName || sanitizedName.length < 2) {
      return NextResponse.json(
        { success: false, message: "Name must be at least 2 characters" },
        { status: 400, headers }
      );
    }

    // Validate email format
    if (!EMAIL_REGEX.test(sanitizedEmail)) {
      return NextResponse.json(
        { success: false, message: "Please enter a valid email address" },
        { status: 400, headers }
      );
    }

    // Password strength validation
    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: "Password must be at least 6 characters" },
        { status: 400, headers }
      );
    }

    if (password.length > 128) {
      return NextResponse.json(
        { success: false, message: "Password is too long" },
        { status: 400, headers }
      );
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email: sanitizedEmail });
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "An account with this email already exists" },
        { status: 409, headers }
      );
    }

    // Prevent registration with admin email
    if (sanitizedEmail === "vedprakasharya9973@gmail.com") {
      return NextResponse.json(
        { success: false, message: "This email is reserved" },
        { status: 409, headers }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await User.create({
      name: sanitizedName,
      email: sanitizedEmail,
      password: hashedPassword,
      image: null,
      role: "user",
      loginAttempts: 0,
      lockUntil: 0,
    });

    // Generate HMAC-signed secure token
    const tokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: "user",
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
        message: "Account created successfully",
      },
      { status: 201, headers }
    );
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create account. Please try again." },
      { status: 500, headers }
    );
  }
}
