import { NextRequest } from "next/server";
import crypto from "crypto";
import connectDB from "@/lib/db";
import Booking from "@/models/Booking";
import { successResponse, errorResponse } from "@/lib/api-response";
import { sendBookingConfirmationEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

function timingSafeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("x-razorpay-signature");
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!webhookSecret) return successResponse({}, "Webhook not configured - ignored");
    if (!signature) return errorResponse("Missing webhook signature", 400);

    const expectedSignature = crypto.createHmac("sha256", webhookSecret).update(body).digest("hex");
    if (!timingSafeEqual(signature, expectedSignature)) return errorResponse("Invalid webhook signature", 400);

    let event: any;
    try {
      event = JSON.parse(body);
    } catch {
      return errorResponse("Invalid webhook payload", 400);
    }

    if (event.event !== "payment.captured") return successResponse({}, "Webhook event ignored");

    const payment = event?.payload?.payment?.entity;
    if (!payment?.id || !payment?.order_id) return errorResponse("Invalid payment payload", 400);

    await connectDB();
    const existingPayment = await Booking.findOne({ razorpayPaymentId: payment.id });
    if (existingPayment) return successResponse({}, "Payment already processed");

    const booking = await Booking.findOneAndUpdate(
      {
        razorpayOrderId: payment.order_id,
        status: "pending",
        paymentStatus: "pending",
      },
      {
        $set: {
          razorpayPaymentId: payment.id,
          paymentStatus: "paid",
          status: "confirmed",
          expiresAt: null,
        },
      },
      { new: true }
    ).populate("room");

    if (!booking) return successResponse({}, "Booking already handled or not found");

    if (booking.guestEmail) {
      try {
        await sendBookingConfirmationEmail({
          userName: booking.guestName || "Guest",
          userEmail: booking.guestEmail,
          roomName: booking.room?.name || "Studio",
          roomAddress: booking.room ? `${booking.room.address}, ${booking.room.city}` : "",
          date: new Date(booking.date).toLocaleDateString("en-IN"),
          startTime: booking.startTime,
          endTime: booking.endTime,
          totalAmount: booking.totalAmount,
          bookingType: booking.bookingType,
          mapLink: booking.room?.mapLink,
          status: "Confirmed",
          bookingId: booking.bookingId,
          guestPhone: booking.guestPhone,
          purpose: booking.purpose,
          notes: booking.notes,
        });
      } catch (emailError) {
        console.error("[Webhook] Email send failed (non-critical):", emailError);
      }
    }

    return successResponse({}, "Webhook processed");
  } catch (error: any) {
    console.error("Webhook error:", error);
    return errorResponse(error.message || "Webhook processing failed");
  }
}
