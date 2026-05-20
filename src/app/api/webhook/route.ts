import { NextRequest } from "next/server";
import crypto from "crypto";
import connectDB from "@/lib/db";
import Booking from "@/models/Booking";
import Room from "@/models/Room";
import User from "@/models/User";
import { successResponse, errorResponse } from "@/lib/api-response";
import { sendBookingConfirmationEmail } from "@/lib/email";

export const dynamic = 'force-dynamic';

/**
 * POST /api/webhook
 * Razorpay webhook handler for payment events
 *
 * This handles:
 * - payment.captured: Update booking status and send confirmation email
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("x-razorpay-signature");

    // Check if webhook secret is configured
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.log("[Webhook] RAZORPAY_WEBHOOK_SECRET not configured - skipping webhook processing");
      return successResponse({}, "Webhook not configured - ignored");
    }

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(body)
      .digest("hex");

    if (signature !== expectedSignature) {
      return errorResponse("Invalid webhook signature", 400);
    }

    const event = JSON.parse(body);

    // Handle payment captured event
    if (event.event === "payment.captured") {
      const payment = event.payload.payment.entity;
      const orderId = payment.order_id;

      await connectDB();

      // Check if already processed
      const existing = await Booking.findOne({
        razorpayPaymentId: payment.id,
        status: "confirmed",
      });

      if (existing) {
        return successResponse({}, "Payment already processed");
      }

      const booking = await Booking.findOneAndUpdate(
        { razorpayOrderId: orderId },
        {
          razorpayPaymentId: payment.id,
          paymentStatus: "paid",
          status: "confirmed",
          expiresAt: null,
        },
        { new: true }
      )
        .populate("room")
        .populate("user");

      // Send confirmation email to guest email (always present now)
      if (booking?.guestEmail) {
        try {
          await sendBookingConfirmationEmail({
            userName: booking.guestName || booking.user?.name || "Guest",
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
          console.log(`[Webhook] Confirmation email sent to ${booking.guestEmail}`);
        } catch (emailError) {
          console.error("[Webhook] Email send failed (non-critical):", emailError);
        }
      }
    }

    return successResponse({}, "Webhook processed");
  } catch (error: any) {
    console.error("Webhook error:", error);
    return errorResponse(error.message || "Webhook processing failed");
  }
}
