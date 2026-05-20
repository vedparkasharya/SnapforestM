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
 * POST /api/bookings/verify
 * Verify payment and confirm booking
 *
 * This endpoint:
 * 1. Verifies the Razorpay payment signature (for real payments)
 * 2. Updates booking status to "confirmed"
 * 3. Sends confirmation email to guest email address
 * 4. Handles both real and demo mode payments
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookingId, razorpayPaymentId, razorpayOrderId, razorpaySignature } = body;

    console.log(`[Verify] Processing payment verification for booking: ${bookingId}`);
    console.log(`[Verify] Payment ID: ${razorpayPaymentId}, Order ID: ${razorpayOrderId}`);

    if (!bookingId) {
      return errorResponse("Booking ID is required", 400);
    }

    await connectDB();

    // Find the booking first to check if it's demo mode
    const existingBookingCheck = await Booking.findById(bookingId);
    if (!existingBookingCheck) {
      return errorResponse("Booking not found", 404);
    }

    const isDemoMode = existingBookingCheck.razorpayOrderId?.startsWith("demo_");

    // Only verify Razorpay signature for real payments
    if (!isDemoMode) {
      if (!razorpayPaymentId || !razorpayOrderId) {
        return errorResponse("Payment ID and Order ID are required for real payments", 400);
      }

      const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;
      if (!razorpayKeySecret) {
        return errorResponse("Payment gateway not configured", 500);
      }

      // Verify Razorpay signature
      const generatedSignature = crypto
        .createHmac("sha256", razorpayKeySecret)
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest("hex");

      if (generatedSignature !== razorpaySignature) {
        console.error(`[Verify] Invalid payment signature for booking: ${bookingId}`);
        return errorResponse("Invalid payment signature", 400);
      }

      console.log(`[Verify] Payment signature verified successfully`);
    } else {
      console.log(`[Verify] Demo mode - skipping signature verification`);
    }

    // Check for duplicate payment (real payments only)
    if (!isDemoMode && razorpayPaymentId) {
      const duplicateBooking = await Booking.findOne({
        razorpayPaymentId,
        status: "confirmed",
      });

      if (duplicateBooking) {
        console.log(`[Verify] Duplicate payment detected: ${razorpayPaymentId}`);
        return successResponse(duplicateBooking, "Payment already processed");
      }
    }

    // Update booking to confirmed status
    const updateData: any = {
      paymentStatus: "paid",
      status: "confirmed",
      expiresAt: null,
    };

    // Only set razorpayPaymentId if it's a real payment
    if (!isDemoMode && razorpayPaymentId) {
      updateData.razorpayPaymentId = razorpayPaymentId;
    } else if (isDemoMode) {
      updateData.razorpayPaymentId = `demo_payment_${Date.now()}`;
    }

    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      updateData,
      { new: true }
    )
      .populate("room")
      .populate("user");

    if (!booking) {
      return errorResponse("Booking not found after update", 404);
    }

    console.log(`[Verify] Booking ${bookingId} confirmed successfully`);

    // Send confirmation email to guest email
    // guestEmail is now always present (required field)
    let emailSent = false;
    if (booking?.guestEmail) {
      try {
        emailSent = await sendBookingConfirmationEmail({
          userName: booking.guestName || booking.user?.name || "Guest",
          userEmail: booking.guestEmail,
          roomName: booking.room?.name || "Studio",
          roomAddress: booking.room
            ? `${booking.room.address}, ${booking.room.city}`
            : "",
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

        if (emailSent) {
          console.log(`[Verify] Confirmation email sent to ${booking.guestEmail}`);
        } else {
          console.warn(`[Verify] Email service returned false - may not be configured`);
        }
      } catch (emailError) {
        console.error("[Verify] Email send failed (non-critical):", emailError);
        // Don't fail the booking if email fails
      }
    } else {
      console.warn(`[Verify] No guest email found for booking ${bookingId}`);
    }

    return successResponse(
      {
        booking,
        emailSent,
      },
      isDemoMode
        ? "Demo payment verified and booking confirmed"
        : "Payment verified and booking confirmed"
    );
  } catch (error: any) {
    console.error("[Verify] Payment verification error:", error);
    return errorResponse(error.message || "Payment verification failed");
  }
}
