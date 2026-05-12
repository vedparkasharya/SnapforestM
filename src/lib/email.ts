import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendBookingConfirmationEmail(
  to: string,
  bookingDetails: {
    bookingId: string;
    roomName: string;
    date: string;
    startTime: string;
    endTime: string;
    duration: number;
    totalAmount: number;
    address: string;
  }
) {
  const { bookingId, roomName, date, startTime, endTime, duration, totalAmount, address } = bookingDetails;

  const mailOptions = {
    from: `"SnapforestX" <${process.env.SMTP_USER}>`,
    to,
    subject: `Booking Confirmed - ${bookingId}`,
    html: `
      <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <div style="background: linear-gradient(135deg, #8b5cf6, #ec4899); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">SnapforestX</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0;">Creator Studio Booking Confirmed</p>
        </div>
        <div style="background: #fff; padding: 30px; border: 1px solid #e5e5e5; border-top: none; border-radius: 0 0 10px 10px;">
          <h2 style="color: #8b5cf6; margin-top: 0;">Your Studio Session is Booked!</h2>
          
          <div style="background: #f8f7ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Booking ID:</strong> <span style="color: #ec4899;">${bookingId}</span></p>
            <p style="margin: 5px 0;"><strong>Creator Studio:</strong> ${roomName}</p>
            <p style="margin: 5px 0;"><strong>Date:</strong> ${date}</p>
            <p style="margin: 5px 0;"><strong>Time:</strong> ${startTime} - ${endTime}</p>
            <p style="margin: 5px 0;"><strong>Duration:</strong> ${duration} hour(s)</p>
            <p style="margin: 5px 0;"><strong>Total Paid:</strong> Rs. ${totalAmount}</p>
            <p style="margin: 5px 0;"><strong>Location:</strong> ${address}</p>
          </div>

          <div style="background: #fff8f0; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px;"><strong>Important:</strong> Please arrive 15 minutes before your session. A 30-minute setup/cleaning buffer is included.</p>
          </div>

          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/bookings" style="background: linear-gradient(135deg, #8b5cf6, #ec4899); color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; display: inline-block;">View My Bookings</a>
          </div>

          <p style="color: #999; font-size: 12px; text-align: center; margin-top: 30px;">
            SnapforestX - Creator Studio Booking Platform<br>
            For support, contact us at snapforestx@gmail.com
          </p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Email sending failed:', error);
    return { success: false, error };
  }
}
