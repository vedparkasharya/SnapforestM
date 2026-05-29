import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/admin/health
 * Health check endpoint that reports which services are configured
 * Used by frontend to auto-enable demo mode when services are missing
 *
 * No auth required - used before login to detect environment
 */
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  // Check Cloudinary config
  const cloudinaryConfigured = !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );

  // Check MongoDB config
  const mongodbConfigured = !!process.env.MONGODB_URI;

  // Check Razorpay config
  const razorpayConfigured = !!(
    process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET
  );

  // Check email config
  const emailConfigured = !!(
    process.env.EMAIL_HOST &&
    process.env.EMAIL_USER &&
    process.env.EMAIL_PASS
  );

  const allConfigured =
    cloudinaryConfigured && mongodbConfigured && razorpayConfigured;

  const status = allConfigured
    ? "healthy"
    : cloudinaryConfigured && mongodbConfigured
      ? "degraded"
      : "demo-recommended";

  return NextResponse.json({
    success: true,
    status,
    services: {
      mongodb: {
        configured: mongodbConfigured,
        message: mongodbConfigured
          ? "MongoDB is configured"
          : "MongoDB URI not set - demo mode recommended",
      },
      cloudinary: {
        configured: cloudinaryConfigured,
        message: cloudinaryConfigured
          ? "Cloudinary is configured"
          : "Cloudinary not configured - image upload will not work without demo mode",
      },
      razorpay: {
        configured: razorpayConfigured,
        message: razorpayConfigured
          ? "Razorpay is configured"
          : "Razorpay not configured - payments will be simulated",
      },
      email: {
        configured: emailConfigured,
        message: emailConfigured
          ? "Email service is configured"
          : "Email service not configured - notifications disabled",
      },
    },
    demoModeRecommended: !allConfigured,
    message: allConfigured
      ? "All services are configured and ready"
      : "Some services are not configured. Demo mode is recommended for presentations.",
  });
}
