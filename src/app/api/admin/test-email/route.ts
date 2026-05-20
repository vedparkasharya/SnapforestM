import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api-response";
import { sendTestEmail, sendBookingConfirmationEmail } from "@/lib/email";

export const dynamic = 'force-dynamic';

/**
 * POST /api/admin/test-email
 * Test email configuration by sending a test email
 *
 * Body: { email?: string } - optional email to send test to (defaults to SMTP_USER)
 *
 * This endpoint helps verify that:
 * 1. SMTP credentials are correct
 * 2. Gmail app password is working
 * 3. Emails can be sent successfully
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const testEmail = body.email || process.env.SMTP_USER;

    if (!testEmail) {
      return errorResponse(
        "No email provided. Set SMTP_USER in environment variables or provide an email in the request body.",
        400
      );
    }

    // Check if SMTP is configured
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      return errorResponse(
        "SMTP is not configured. Please set SMTP_USER and SMTP_PASS environment variables in Vercel.",
        500,
        {
          smtpUser: process.env.SMTP_USER ? "set" : "missing",
          smtpPass: process.env.SMTP_PASS ? "set" : "missing",
        }
      );
    }

    console.log(`[TestEmail] Sending test email to: ${testEmail}`);

    // Send a test email
    const testSent = await sendTestEmail(testEmail);

    if (testSent) {
      return successResponse(
        {
          email: testEmail,
          smtpUser: process.env.SMTP_USER,
        },
        "Test email sent successfully! Check your inbox (and spam folder)."
      );
    } else {
      return errorResponse(
        "Failed to send test email. Please check your SMTP credentials. Common issues:\n" +
        "1. Make sure you're using a Gmail App Password (not your regular password)\n" +
        "2. Enable 2-Factor Authentication on your Google account\n" +
        "3. Generate an App Password at https://myaccount.google.com/apppasswords",
        500,
        {
          smtpUser: process.env.SMTP_USER,
          hint: "Use Gmail App Password, not regular password",
        }
      );
    }
  } catch (error: any) {
    console.error("[TestEmail] Error:", error);
    return errorResponse(error.message || "Failed to send test email");
  }
}

/**
 * GET /api/admin/test-email
 * Check if SMTP is configured without sending an email
 */
export async function GET(request: NextRequest) {
  try {
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const isConfigured = !!(smtpUser && smtpPass && smtpUser.includes("@"));

    return successResponse(
      {
        configured: isConfigured,
        smtpUser: smtpUser || null,
        smtpPass: smtpPass ? "***set***" : "***missing***",
      },
      isConfigured
        ? "SMTP is configured"
        : "SMTP is not configured. Set SMTP_USER and SMTP_PASS environment variables."
    );
  } catch (error: any) {
    return errorResponse(error.message || "Failed to check email config");
  }
}
