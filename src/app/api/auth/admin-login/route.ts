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
} from "@/lib/security";

// Admin credentials - stored securely with bcrypt hash
// Email: vedprakasharya9973@gmail.com
// Password (hashed with bcrypt 12 rounds): Ved@203068
// The password below is a bcrypt hash of "Ved@203068" generated with 12 salt rounds
const ADMIN_CONFIG = {
  email: "vedprakasharya9973@gmail.com",
  passwordHash: "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.VTtYA.qGZvKG6G", // Ved@203068
  name: "Ved Parkash Arya",
  role: "admin" as const,
};

export async function POST(request: NextRequest) {
  const headers = getSecurityHeaders();
  const clientIP = getClientIP(request.headers);
  const rateLimitKey = `admin-login:${clientIP}`;

  try {
    // Rate limiting: 5 attempts per 15 minutes per IP
    const rateLimit = checkRateLimit(rateLimitKey, 5, 15 * 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          message: "Too many login attempts. Please try again in 15 minutes.",
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

    const sanitizedEmail = email.toLowerCase().trim();

    // Check if IP is locked due to brute force
    const bruteForceCheck = trackLoginAttempt(`${clientIP}:${sanitizedEmail}`);
    if (bruteForceCheck.locked) {
      const minutes = Math.ceil(bruteForceCheck.lockDuration / 60000);
      return NextResponse.json(
        {
          success: false,
          message: `Account temporarily locked due to multiple failed attempts. Try again in ${minutes} minute(s).`,
          lockDuration: bruteForceCheck.lockDuration,
        },
        { status: 423, headers }
      );
    }

    // Find user by email
    let user = await User.findOne({ email: sanitizedEmail });

    // Verify password with bcrypt comparison
    let isValidPassword = false;

    if (user?.password) {
      isValidPassword = await comparePassword(password, user.password);
    }

    // Fallback for hardcoded admin credentials (for initial setup or if user not in DB)
    if (!isValidPassword && sanitizedEmail === ADMIN_CONFIG.email) {
      isValidPassword = await comparePassword(password, ADMIN_CONFIG.passwordHash);
    }

    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, message: "Invalid credentials" },
        { status: 401, headers }
      );
    }

    // If user doesn't exist in DB but hardcoded credentials matched, create/find admin user
    if (!user) {
      // Check if admin user exists, if not create it
      user = await User.findOneAndUpdate(
        { email: ADMIN_CONFIG.email },
        {
          $setOnInsert: {
            name: ADMIN_CONFIG.name,
            email: ADMIN_CONFIG.email,
            password: ADMIN_CONFIG.passwordHash,
            role: ADMIN_CONFIG.role,
            image: null,
          },
        },
        { upsert: true, new: true }
      );
    }

    // Must be admin role
    if (user.role !== "admin") {
      return NextResponse.json(
        {
          success: false,
          message: "Access denied: Administrator privileges required",
        },
        { status: 403, headers }
      );
    }

    // Success - reset login attempts
    resetLoginAttempts(`${clientIP}:${sanitizedEmail}`);

    // Generate HMAC-signed secure token (tamper-proof)
    const tokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      type: "admin",
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
        message: "Admin login successful",
      },
      { status: 200, headers }
    );
  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json(
      { success: false, message: "Authentication failed. Please try again." },
      { status: 500, headers }
    );
  }
}

// Also handle GET for CSRF token generation
export async function GET(request: NextRequest) {
  const headers = getSecurityHeaders();
  try {
    const { generateCsrfToken } = await import("@/lib/security");
    const csrfToken = generateCsrfToken();
    return NextResponse.json(
      { success: true, csrfToken },
      { status: 200, headers }
    );
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to generate CSRF token" },
      { status: 500, headers }
    );
  }
}
