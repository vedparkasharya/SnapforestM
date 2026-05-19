import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

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
}

export async function sendBookingConfirmationEmail(
  data: BookingEmailData
): Promise<boolean> {
  try {
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
    } = data;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #0a0a0a; color: #ffffff; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; padding: 30px; background: linear-gradient(135deg, #00f5d4, #9b5de5); border-radius: 16px 16px 0 0; }
          .header h1 { margin: 0; color: #0a0a0a; font-size: 28px; }
          .content { background: #111111; padding: 30px; border-radius: 0 0 16px 16px; border: 1px solid #222; }
          .detail-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #222; }
          .detail-label { color: #00f5d4; font-weight: 600; }
          .detail-value { color: #ffffff; }
          .status-badge { display: inline-block; padding: 8px 16px; border-radius: 20px; font-weight: 600; font-size: 14px; }
          .status-confirmed { background: rgba(0, 245, 212, 0.2); color: #00f5d4; }
          .footer { text-align: center; padding: 20px; color: #888; font-size: 12px; }
          .map-btn { display: inline-block; margin-top: 15px; padding: 12px 24px; background: linear-gradient(135deg, #00f5d4, #9b5de5); color: #0a0a0a; text-decoration: none; border-radius: 8px; font-weight: 600; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Snapforest</h1>
            <p style="margin: 8px 0 0; color: #0a0a0a; font-size: 16px;">Booking Confirmation</p>
          </div>
          <div class="content">
            <p style="font-size: 16px; margin-bottom: 20px;">Hi <strong>${userName}</strong>,</p>
            <p style="color: #aaa; margin-bottom: 25px;">Your booking has been confirmed! Here are your booking details:</p>
            
            <div style="text-align: center; margin: 20px 0;">
              <span class="status-badge status-confirmed">${status.toUpperCase()}</span>
            </div>
            
            <div class="detail-row">
              <span class="detail-label">Room</span>
              <span class="detail-value">${roomName}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Address</span>
              <span class="detail-value">${roomAddress}</span>
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
            <div class="detail-row" style="border-bottom: none;">
              <span class="detail-label">Total Amount</span>
              <span class="detail-value" style="font-size: 18px; color: #00f5d4;">Rs. ${totalAmount.toLocaleString("en-IN")}</span>
            </div>
            
            ${mapLink ? `<div style="text-align: center; margin-top: 20px;"><a href="${mapLink}" class="map-btn" target="_blank">View on Map</a></div>` : ""}
            
            <div style="margin-top: 30px; padding: 15px; background: rgba(0, 245, 212, 0.05); border-radius: 8px; border-left: 3px solid #00f5d4;">
              <p style="margin: 0; font-size: 13px; color: #888;">Please arrive 10 minutes before your scheduled time. Cancellation is allowed up to 30 minutes before your booking starts.</p>
            </div>
          </div>
          <div class="footer">
            <p>Snapforest - Creator Studio Booking Platform</p>
            <p>Patna, Bihar, India</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: `"Snapforest" <${process.env.SMTP_USER}>`,
      to: userEmail,
      subject: "Booking Confirmed - Snapforest",
      html: htmlContent,
    });

    return true;
  } catch (error) {
    console.error("Email send failed:", error);
    return false;
  }
}
