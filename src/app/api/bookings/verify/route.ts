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
    const body = await request.json();
    const { bookingId, razorpayPaymentId, razorpayOrderId, razorpaySignature } = body;
    if (!bookingId || typeof bookingId !== "string") return errorResponse("Booking ID is required", 400);

    await connectDB();
    const existing = await Booking.findById(bookingId);
    if (!existing) return errorResponse("Booking not found", 404);

    // A cancelled/completed booking must never be resurrected by a payment callback.
    if (["cancelled", "completed"].includes(existing.status)) {
      return errorResponse("This booking can no longer be confirmed", 409);
    }

    const isDemoMode = existing.razorpayOrderId?.startsWith("demo_") === true;
    const demoAllowed = process.env.NODE_ENV !== "production" && process.env.ALLOW_DEMO_PAYMENTS === "true";

    if (isDemoMode) {
      if (!demoAllowed) return errorResponse("Demo payments are disabled", 403);
      if (razorpayOrderId && razorpayOrderId !== existing.razorpayOrderId) {
        return errorResponse("Order does not match booking", 400);
      }
    } else {
      if (!razorpayPaymentId || !razorpayOrderId || !razorpaySignature) {
        return errorResponse("Payment ID, Order ID and signature are required", 400);
      }
      if (existing.razorpayOrderId !== razorpayOrderId) {
        return errorResponse("Order does not match booking", 400);
      }

      const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;
      if (!razorpayKeySecret) return errorResponse("Payment gateway not configured", 500);

      const expected = crypto
        .createHmac("sha256", razorpayKeySecret)
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest("hex");

      if (!timingSafeEqual(expected, String(razorpaySignature))) {
        return errorResponse("Invalid payment signature", 400);
      }
    }

    // Confirm only once. A repeated browser callback/webhook returns the existing booking without re-sending email.
    if (existing.status === "confirmed" && existing.paymentStatus === "paid") {
      return successResponse(existing, "Payment already processed");
    }

    const paymentId = isDemoMode ? `demo_payment_${existing._id}` : String(razorpayPaymentId);
    const booking = await Booking.findOneAndUpdate(
      {
        _id: bookingId,
        status: "pending",
        paymentStatus: "pending",
        ...(isDemoMode ? {} : { razorpayOrderId, razorpayPaymentId: { $in: [null, paymentId] } }),
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
