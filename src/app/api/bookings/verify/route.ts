import { NextRequest } from "next/server";
import crypto from "crypto";
import connectDB from "@/lib/db";
import Booking from "@/models/Booking";
import Room from "@/models/Room";
import User from "@/models/User";
import { successResponse, errorResponse } from "@/lib/api-response";
import { sendBookingConfirmationEmail } from "@/lib/email";

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookingId, razorpayPaymentId, razorpayOrderId, razorpaySignature } = body;

    await connectDB();

    // Find the booking first to check if it's demo mode
    const existingBookingCheck = await Booking.findById(bookingId);
    if (!existingBookingCheck) {
      return errorResponse("Booking not found", 404);
    }

    const isDemoMode = existingBookingCheck.razorpayOrderId?.startsWith("demo_");

    // Only verify Razorpay signature for real payments
    // Demo mode bookings bypass signature verification
    if (!isDemoMode) {
      const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;
      if (!razorpayKeySecret) {
        return errorResponse("Payment gateway not configured", 500);
      }

      const generatedSignature = crypto
        .createHmac("sha256", razorpayKeySecret)
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest("hex");

      if (generatedSignature !== razorpaySignature) {
        return errorResponse("Invalid payment signature", 400);
      }
    }

    // Check for duplicate payment (real payments only)
    if (!isDemoMode && razorpayPaymentId) {
      const duplicateBooking = await Booking.findOne({
        razorpayPaymentId,
        status: "confirmed",
      });

      if (duplicateBooking) {
        return successResponse(duplicateBooking, "Payment already processed");
      }
    }

    // Update booking
    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      {
        razorpayPaymentId: razorpayPaymentId || `demo_payment_${Date.now()}`,
        paymentStatus: "paid",
        status: "confirmed",
        expiresAt: null,
      },
      { new: true }
    )
      .populate("room")
      .populate("user");

    if (!booking) {
      return errorResponse("Booking not found", 404);
    }

    // Send confirmation email only if user exists
    // Since auth is optional, booking.user may be null
    if (booking.user?.email) {
      try {
        await sendBookingConfirmationEmail({
          userName: booking.user.name || "Guest",
          userEmail: booking.user.email,
          roomName: booking.room?.name || "Studio",
          roomAddress: booking.room ? `${booking.room.address}, ${booking.room.city}` : "",
          date: new Date(booking.date).toLocaleDateString("en-IN"),
          startTime: booking.startTime,
          endTime: booking.endTime,
          totalAmount: booking.totalAmount,
          bookingType: booking.bookingType,
          mapLink: booking.room?.mapLink,
          status: "Confirmed",
        });
      } catch (emailError) {
        console.error("[Verify] Email send failed (non-critical):", emailError);
        // Don't fail the booking if email fails
      }
    }

    return successResponse(
      booking,
      isDemoMode
        ? "Demo payment verified and booking confirmed"
        : "Payment verified and booking confirmed"
    );
  } catch (error: any) {
    console.error("Payment verification error:", error);
    return errorResponse(error.message || "Payment verification failed");
  }
}
