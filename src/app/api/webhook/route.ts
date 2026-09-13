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
    const existingPayment = await Booking.findOne({ razorpayPaymentId: payment.id }).select("_id").lean();
    if (existingPayment) return successResponse({}, "Payment already processed");

    const booking = await Booking.findOne({
      razorpayOrderId: payment.order_id,
      status: "pending",
      paymentStatus: "pending",
    });

    if (!booking) return successResponse({}, "Booking already handled or not found");

    if (Number(payment.amount) !== Math.round(booking.totalAmount * 100) || payment.currency !== "INR") {
      return errorResponse("Payment amount does not match booking", 400);
    }

    if (booking.expiresAt && booking.expiresAt <= new Date()) {
      return errorResponse("Booking payment session has expired", 409);
    }

    const confirmedBooking = await Booking.findOneAndUpdate(
      {
        _id: booking._id,
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

    if (!confirmedBooking) return successResponse({}, "Booking already handled");

    if (confirmedBooking.guestEmail) {
      try {
        await sendBookingConfirmationEmail({
          userName: confirmedBooking.guestName || "Guest",
          userEmail: confirmedBooking.guestEmail,
          roomName: confirmedBooking.room?.name || "Studio",
          roomAddress: confirmedBooking.room ? `${confirmedBooking.room.address}, ${confirmedBooking.room.city}` : "",
          date: new Date(confirmedBooking.date).toLocaleDateString("en-IN"),
          startTime: confirmedBooking.startTime,
          endTime: confirmedBooking.endTime,
          totalAmount: confirmedBooking.totalAmount,
          bookingType: confirmedBooking.bookingType,
          mapLink: confirmedBooking.room?.mapLink,
          status: "Confirmed",
          bookingId: confirmedBooking.bookingId,
          guestPhone: confirmedBooking.guestPhone,
          purpose: confirmedBooking.purpose,
          notes: confirmedBooking.notes,
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
