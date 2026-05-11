import { NextRequest } from "next/server";
import crypto from "crypto";
import connectDB from "@/lib/db";
import Booking from "@/models/Booking";
import Room from "@/models/Room";
import User from "@/models/User";
import { successResponse, errorResponse } from "@/lib/api-response";
import { sendBookingConfirmationEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookingId, razorpayPaymentId, razorpayOrderId, razorpaySignature } = body;

    // Verify Razorpay signature
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");

    if (generatedSignature !== razorpaySignature) {
      return errorResponse("Invalid payment signature", 400);
    }

    await connectDB();

    // Check for duplicate payment
    const existingBooking = await Booking.findOne({
      razorpayPaymentId,
      status: "confirmed",
    });

    if (existingBooking) {
      return successResponse(existingBooking, "Payment already processed");
    }

    // Update booking
    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      {
        razorpayPaymentId,
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

    // Send confirmation email
    await sendBookingConfirmationEmail({
      userName: booking.user.name,
      userEmail: booking.user.email,
      roomName: booking.room.name,
      roomAddress: `${booking.room.address}, ${booking.room.city}`,
      date: new Date(booking.date).toLocaleDateString("en-IN"),
      startTime: booking.startTime,
      endTime: booking.endTime,
      totalAmount: booking.totalAmount,
      bookingType: booking.bookingType,
      mapLink: booking.room.mapLink,
      status: "Confirmed",
    });

    return successResponse(booking, "Payment verified and booking confirmed");
  } catch (error: any) {
    console.error("Payment verification error:", error);
    return errorResponse(error.message || "Payment verification failed");
  }
}
