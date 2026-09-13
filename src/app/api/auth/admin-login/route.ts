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

// Admin credentials must be configured through environment variables.
const ADMIN_EMAIL = process.env.ADMIN_EMAIL?.toLowerCase().trim();
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH;
const ADMIN_NAME = process.env.ADMIN_NAME || "Snapforest Admin";

export async function POST(request: NextRequest) {
  const headers = getSecurityHeaders();
  const clientIP = getClientIP(request.headers);
  const rateLimitKey = `admin-login:${clientIP}`;

  try {
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

    const body = await request.json();
    const { email, password } = body;

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

    if (!ADMIN_EMAIL || !ADMIN_PASSWORD_HASH) {
      console.error("[Admin Login] ADMIN_EMAIL / ADMIN_PASSWORD_HASH are not configured");
      return NextResponse.json(
        { success: false, message: "Admin authentication is not configured" },
        { status: 503, headers }
      );
    }

    const sanitizedEmail = email.toLowerCase().trim();
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

    if (sanitizedEmail !== ADMIN_EMAIL) {
      return NextResponse.json(
        { success: false, message: "Invalid credentials" },
        { status: 401, headers }
      );
    }

    let user: any = null;
    let isValidPassword = await comparePassword(password, ADMIN_PASSWORD_HASH);

    try {
      await connectDB();
      user = await User.findOne({ email: sanitizedEmail });

      if (user?.password) {
        isValidPassword = await comparePassword(password, user.password);
      }
    } catch (dbError) {
      console.warn("[Admin Login] DB unavailable; authenticating from configured admin secret", dbError);
    }

    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, message: "Invalid credentials" },
        { status: 401, headers }
      );
    }

    if (user && user.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Access denied: Administrator privileges required" },
        { status: 403, headers }
      );
    }

    let userId = "admin-configured";
    let userName = ADMIN_NAME;
    let userEmail = ADMIN_EMAIL;
    let userImage: string | null = null;
    let userRole = "admin";

    if (user) {
      userId = user._id.toString();
      userName = user.name;
      userEmail = user.email;
      userImage = user.image;
      userRole = user.role;
    }

    resetLoginAttempts(`${clientIP}:${sanitizedEmail}`);

    const secureToken = generateSecureToken({
      userId,
      email: userEmail,
      role: userRole,
      type: "admin",
      ip: clientIP,
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          id: userId,
          name: userName,
          email: userEmail,
          image: userImage,
          role: userRole,
          token: secureToken,
        },
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

export async function GET() {
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
