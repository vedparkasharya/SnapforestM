import nodemailer from "nodemailer";

/**
 * Email Service for Snapforest
 *
 * Handles sending booking confirmation emails to users after payment.
 * Uses Gmail SMTP by default but can be configured for other providers.
 *
 * Required environment variables:
 * - SMTP_USER: Gmail address (e.g., your_email@gmail.com)
 * - SMTP_PASS: Gmail App Password (NOT your regular password)
 *
 * To get a Gmail App Password:
 * 1. Go to https://myaccount.google.com/apppasswords
 * 2. Sign in with your Google account
 * 3. Select "Mail" and your device
 * 4. Copy the 16-character password
 */

// Check if SMTP is configured
const isSMTPConfigured = (): boolean => {
  return !!(
    process.env.SMTP_USER &&
    process.env.SMTP_PASS &&
    process.env.SMTP_USER.includes("@")
  );
};

// Create transporter only if SMTP is configured
const createTransporter = () => {
  if (!isSMTPConfigured()) {
    console.warn(
      "[Email] SMTP not configured. Set SMTP_USER and SMTP_PASS environment variables."
    );
    return null;
  }

  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // TLS
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: true,
      minVersion: "TLSv1.2",
    },
    pool: true, // Use pooled connections for better performance
    maxConnections: 3,
  });
};

interface BookingEmailData {
  userName: string;
  userEmail: string;
  roomName: string;
  roomAddress: string;
  date: string;
  startTime: string;
  endTime: string;
  totalAmount: number;
  bookingType: string;
  mapLink?: string;
  status: string;
  bookingId?: string;
  guestPhone?: string;
  purpose?: string;
  notes?: string;
}

/**
 * Send booking confirmation email to the user
 * @returns true if email was sent successfully, false otherwise
 */
export async function sendBookingConfirmationEmail(
  data: BookingEmailData
): Promise<boolean> {
  try {
    // Validate email configuration
    if (!isSMTPConfigured()) {
      console.warn(
        "[Email] Cannot send email - SMTP not configured. Set SMTP_USER and SMTP_PASS env vars."
      );
      return false;
    }

    // Validate recipient email
    if (!data.userEmail || !data.userEmail.includes("@")) {
      console.warn("[Email] Invalid recipient email:", data.userEmail);
      return false;
    }

    const transporter = createTransporter();
    if (!transporter) {
      return false;
    }

    // Verify SMTP connection before sending
    try {
      await transporter.verify();
      console.log("[Email] SMTP connection verified");
    } catch (verifyError) {
      console.error(
        "[Email] SMTP verification failed:",
        (verifyError as Error).message
      );
      return false;
    }

    const {
      userName,
      userEmail,
      roomName,
      roomAddress,
      date,
      startTime,
      endTime,
      totalAmount,
      bookingType,
      mapLink,
      status,
      bookingId,
      guestPhone,
      purpose,
      notes,
    } = data;

    const htmlContent = buildEmailTemplate({
      userName,
      roomName,
      roomAddress,
      date,
      startTime,
      endTime,
      totalAmount,
      bookingType,
      mapLink,
      status,
      bookingId,
      guestPhone,
      purpose,
      notes,
    });

    const info = await transporter.sendMail({
      from: `"Snapforest" <${process.env.SMTP_USER}>`,
      to: userEmail,
      subject: `Booking Confirmed - ${roomName} | Snapforest`,
      html: htmlContent,
      text: buildPlainTextEmail({
        userName,
        roomName,
        roomAddress,
        date,
        startTime,
        endTime,
        totalAmount,
        bookingType,
        status,
        bookingId,
        guestPhone,
        purpose,
        notes,
      }),
    });

    console.log(
      `[Email] Confirmation sent to ${userEmail}, messageId: ${info.messageId}`
    );
    return true;
  } catch (error) {
    console.error("[Email] Failed to send confirmation email:", error);
    return false;
  }
}

/**
 * Send a test email to verify SMTP configuration
 */
export async function sendTestEmail(
  testEmail: string
): Promise<boolean> {
  try {
    if (!isSMTPConfigured()) {
      console.warn("[Email] SMTP not configured");
      return false;
    }

    const transporter = createTransporter();
    if (!transporter) return false;

    await transporter.verify();

    const info = await transporter.sendMail({
      from: `"Snapforest" <${process.env.SMTP_USER}>`,
      to: testEmail,
      subject: "Snapforest - SMTP Test Email",
      html: `<!DOCTYPE html>
<html><body style="font-family: Arial, sans-serif; background: #0a0a0a; color: #fff; padding: 20px;">
<div style="max-width: 600px; margin: 0 auto; background: #111; border-radius: 16px; padding: 30px;">
<h1 style="color: #00f5d4;">SMTP Test Successful</h1>
<p>Your Snapforest email configuration is working correctly!</p>
<p style="color: #888; font-size: 12px;">Sent at: ${new Date().toLocaleString("en-IN")}</p>
</div></body></html>`,
    });

    console.log(`[Email] Test email sent to ${testEmail}, messageId: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error("[Email] Test email failed:", error);
    return false;
  }
}

// ─── Email Template Builder ──────────────────────────

function buildEmailTemplate(data: {
  userName: string;
  roomName: string;
  roomAddress: string;
  date: string;
  startTime: string;
  endTime: string;
  totalAmount: number;
  bookingType: string;
  mapLink?: string;
  status: string;
  bookingId?: string;
  guestPhone?: string;
  purpose?: string;
  notes?: string;
}): string {
  const {
    userName,
    roomName,
    roomAddress,
    date,
    startTime,
    endTime,
    totalAmount,
    bookingType,
    mapLink,
    status,
    bookingId,
    guestPhone,
    purpose,
    notes,
  } = data;

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Booking Confirmation - Snapforest</title>
  <style>
    @media only screen and (max-width: 600px) {
      .container { width: 100% !important; padding: 10px !important; }
      .content { padding: 20px !important; }
      .header { padding: 20px !important; }
    }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #0a0a0a; color: #ffffff; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; padding: 30px; background: linear-gradient(135deg, #00f5d4, #9b5de5); border-radius: 16px 16px 0 0; }
    .header h1 { margin: 0; color: #0a0a0a; font-size: 28px; }
    .content { background: #111111; padding: 30px; border-radius: 0 0 16px 16px; border: 1px solid #222; }
    .detail-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #222; }
    .detail-row:last-child { border-bottom: none; }
    .detail-label { color: #00f5d4; font-weight: 600; min-width: 120px; }
    .detail-value { color: #ffffff; text-align: right; flex: 1; margin-left: 10px; }
    .status-badge { display: inline-block; padding: 8px 16px; border-radius: 20px; font-weight: 600; font-size: 14px; }
    .status-confirmed { background: rgba(0, 245, 212, 0.2); color: #00f5d4; }
    .booking-id { background: #1a1a1a; padding: 12px; border-radius: 8px; text-align: center; margin: 15px 0; border: 1px solid #333; }
    .booking-id-label { color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; }
    .booking-id-value { color: #00f5d4; font-size: 18px; font-weight: 600; letter-spacing: 2px; margin-top: 4px; }
    .footer { text-align: center; padding: 20px; color: #888; font-size: 12px; }
    .map-btn { display: inline-block; margin-top: 15px; padding: 12px 24px; background: linear-gradient(135deg, #00f5d4, #9b5de5); color: #0a0a0a; text-decoration: none; border-radius: 8px; font-weight: 600; }
    .info-box { margin-top: 20px; padding: 15px; background: rgba(0, 245, 212, 0.05); border-radius: 8px; border-left: 3px solid #00f5d4; }
    .contact-box { margin-top: 15px; padding: 15px; background: rgba(155, 93, 229, 0.05); border-radius: 8px; border-left: 3px solid #9b5de5; }
    .section-title { color: #00f5d4; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; margin: 20px 0 10px; font-weight: 600; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Snapforest</h1>
      <p style="margin: 8px 0 0; color: #0a0a0a; font-size: 16px;">Booking Confirmation</p>
    </div>
    <div class="content">
      <p style="font-size: 16px; margin-bottom: 20px;">Hi <strong>${escapeHtml(userName)}</strong>,</p>
      <p style="color: #aaa; margin-bottom: 25px;">Your booking has been confirmed! Here are your booking details:</p>

      <div style="text-align: center; margin: 20px 0;">
        <span class="status-badge status-confirmed">${status.toUpperCase()}</span>
      </div>

      ${bookingId ? `
      <div class="booking-id">
        <div class="booking-id-label">Booking Reference</div>
        <div class="booking-id-value">${bookingId}</div>
      </div>
      ` : ""}

      <div class="section-title">Booking Details</div>

      <div class="detail-row">
        <span class="detail-label">Room</span>
        <span class="detail-value">${escapeHtml(roomName)}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Address</span>
        <span class="detail-value">${escapeHtml(roomAddress)}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Date</span>
        <span class="detail-value">${date}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Time</span>
        <span class="detail-value">${startTime} - ${endTime}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Booking Type</span>
        <span class="detail-value">${bookingType === "hourly" ? "Hourly" : "Full Day"}</span>
      </div>

      <div class="section-title">Your Information</div>

      <div class="detail-row">
        <span class="detail-label">Name</span>
        <span class="detail-value">${escapeHtml(userName)}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Email</span>
        <span class="detail-value">${escapeHtml(data.userEmail || "")}</span>
      </div>
      ${guestPhone ? `
      <div class="detail-row">
        <span class="detail-label">Phone</span>
        <span class="detail-value">${escapeHtml(guestPhone)}</span>
      </div>
      ` : ""}
      ${purpose ? `
      <div class="detail-row">
        <span class="detail-label">Purpose</span>
        <span class="detail-value">${escapeHtml(purpose)}</span>
      </div>
      ` : ""}
      ${notes ? `
      <div class="detail-row">
        <span class="detail-label">Notes</span>
        <span class="detail-value">${escapeHtml(notes)}</span>
      </div>
      ` : ""}

      <div class="detail-row" style="border-bottom: none; margin-top: 10px; padding-top: 15px; border-top: 2px solid #333;">
        <span class="detail-label" style="font-size: 16px;">Total Amount</span>
        <span class="detail-value" style="font-size: 20px; color: #00f5d4; font-weight: 600;">Rs. ${totalAmount.toLocaleString("en-IN")}</span>
      </div>

      ${mapLink ? `<div style="text-align: center; margin-top: 20px;"><a href="${escapeHtml(mapLink)}" class="map-btn" target="_blank">View Location on Map</a></div>` : ""}

      <div class="info-box">
        <p style="margin: 0; font-size: 13px; color: #888;"><strong style="color: #00f5d4;">Important:</strong> Please arrive 10 minutes before your scheduled time. Carry a valid ID for verification. Cancellation is allowed up to 30 minutes before your booking starts.</p>
      </div>

      <div class="contact-box">
        <p style="margin: 0; font-size: 13px; color: #888;">Need help? Contact us at <a href="mailto:support@snapforest.in" style="color: #9b5de5;">support@snapforest.in</a></p>
      </div>
    </div>
    <div class="footer">
      <p>Snapforest - Creator Studio Booking Platform</p>
      <p>Patna, Bihar, India</p>
      <p style="margin-top: 10px; font-size: 11px; color: #555;">This is an automated email. Please do not reply to this email.</p>
    </div>
  </div>
</body>
</html>`;
}

function buildPlainTextEmail(data: {
  userName: string;
  roomName: string;
  roomAddress: string;
  date: string;
  startTime: string;
  endTime: string;
  totalAmount: number;
  bookingType: string;
  status: string;
  bookingId?: string;
  guestPhone?: string;
  purpose?: string;
  notes?: string;
}): string {
  const lines = [
    `Hi ${data.userName},`,
    "",
    `Your booking has been ${data.status}!`,
    "",
    data.bookingId ? `Booking Reference: ${data.bookingId}` : "",
    `Room: ${data.roomName}`,
    `Address: ${data.roomAddress}`,
    `Date: ${data.date}`,
    `Time: ${data.startTime} - ${data.endTime}`,
    `Type: ${data.bookingType === "hourly" ? "Hourly" : "Full Day"}`,
    `Amount: Rs. ${data.totalAmount.toLocaleString("en-IN")}`,
    "",
    data.guestPhone ? `Phone: ${data.guestPhone}` : "",
    data.purpose ? `Purpose: ${data.purpose}` : "",
    data.notes ? `Notes: ${data.notes}` : "",
    "",
    "Important: Please arrive 10 minutes before your scheduled time.",
    "Carry a valid ID for verification.",
    "",
    "Snapforest - Creator Studio Booking Platform",
    "Patna, Bihar, India",
  ];
  return lines.filter(Boolean).join("\n");
}

function escapeHtml(text: string): string {
  if (!text) return "";
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
