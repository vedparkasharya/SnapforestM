import { NextRequest } from "next/server";
import crypto from "crypto";
import Razorpay from "razorpay";
import mongoose from "mongoose";
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
    const body = await request.json();
    const { bookingId, razorpayPaymentId, razorpayOrderId, razorpaySignature } = body;
    if (!bookingId || typeof bookingId !== "string" || !mongoose.isValidObjectId(bookingId)) {
      return errorResponse("Valid booking ID is required", 400);
    }

    await connectDB();
    const existing = await Booking.findById(bookingId);
    if (!existing) return errorResponse("Booking not found", 404);

    if (["cancelled", "completed"].includes(existing.status)) {
      return errorResponse("This booking can no longer be confirmed", 409);
    }

    if (existing.status !== "pending" || existing.paymentStatus !== "pending") {
      if (existing.status === "confirmed" && existing.paymentStatus === "paid") {
        return successResponse(existing, "Payment already processed");
      }
      return errorResponse("This booking is not awaiting payment", 409);
    }

    if (existing.expiresAt && existing.expiresAt <= new Date()) {
      return errorResponse("This payment session has expired. Please create a new booking.", 409);
    }

    const isDemoMode = existing.razorpayOrderId?.startsWith("demo_") === true;
    const demoAllowed = process.env.NODE_ENV !== "production" && process.env.ALLOW_DEMO_PAYMENTS === "true";

    if (isDemoMode) {
      if (!demoAllowed) return errorResponse("Demo payments are disabled", 403);
      if (razorpayOrderId !== existing.razorpayOrderId) {
        return errorResponse("Order does not match booking", 400);
      }
      if (typeof razorpayPaymentId !== "string" || !razorpayPaymentId.startsWith("demo_payment_")) {
        return errorResponse("Invalid demo payment", 400);
      }
    } else {
      if (!razorpayPaymentId || !razorpayOrderId || !razorpaySignature) {
        return errorResponse("Payment ID, Order ID and signature are required", 400);
      }
      if (existing.razorpayOrderId !== razorpayOrderId) {
        return errorResponse("Order does not match booking", 400);
      }

      const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
      const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;
      if (!razorpayKeyId || !razorpayKeySecret) return errorResponse("Payment gateway not configured", 500);

      const expected = crypto
        .createHmac("sha256", razorpayKeySecret)
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest("hex");

      if (!timingSafeEqual(expected, String(razorpaySignature))) {
        return errorResponse("Invalid payment signature", 400);
      }

      const razorpay = new Razorpay({ key_id: razorpayKeyId, key_secret: razorpayKeySecret });
      const order = await razorpay.orders.fetch(razorpayOrderId);
      if (Number(order.amount) !== Math.round(existing.totalAmount * 100) || order.currency !== "INR") {
        return errorResponse("Payment amount does not match booking", 400);
      }
    }

    const paymentId = isDemoMode ? String(razorpayPaymentId) : String(razorpayPaymentId);
    const booking = await Booking.findOneAndUpdate(
      {
        _id: bookingId,
        status: "pending",
        paymentStatus: "pending",
        razorpayOrderId: existing.razorpayOrderId,
      },
      {
        $set: {
          paymentStatus: "paid",
          status: "confirmed",
          expiresAt: null,
          razorpayPaymentId: paymentId,
        },
      },
      { new: true }
    )
      .populate("room")
      .populate("user");

    if (!booking) {
      const current = await Booking.findById(bookingId);
      if (current?.status === "confirmed" && current.paymentStatus === "paid") {
        return successResponse(current, "Payment already processed");
      }
      return errorResponse("Booking could not be confirmed", 409);
    }

    let emailSent = false;
    if (booking.guestEmail) {
      try {
        emailSent = await sendBookingConfirmationEmail({
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
        console.error("[Verify] Email send failed (non-critical):", emailError);
      }
    }

    return successResponse(
      { booking, emailSent },
      isDemoMode ? "Demo payment verified and booking confirmed" : "Payment verified and booking confirmed"
    );
  } catch (error: any) {
    console.error("[Verify] Payment verification error:", error);
    return errorResponse(error.message || "Payment verification failed");
  }
}
