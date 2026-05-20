import { NextRequest } from "next/server";
import Razorpay from "razorpay";
import connectDB from "@/lib/db";
import Booking from "@/models/Booking";
import Room from "@/models/Room";
import { successResponse, errorResponse, validationError } from "@/lib/api-response";
import { BookingSchema } from "@/types";

export const dynamic = 'force-dynamic';

/**
 * Normalize a date string to start/end of day range
 * This handles timezone issues by matching any time within the target day
 */
function getDateRange(dateStr: string) {
  const date = new Date(dateStr);
  // Set to midnight UTC to ensure consistent comparison
  const start = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);
  return { start, end };
}

/**
 * Create booking + Razorpay order
 *
 * No authentication required - anyone can book with their details.
 * Guest information (name, email, phone) is now required for all bookings.
 */
export async function POST(request: NextRequest) {
  try {
    // Validate request body
    const body = await request.json();
    const validated = BookingSchema.safeParse(body);
    if (!validated.success) {
      return validationError("Invalid booking data", validated.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', '));
    }

    // Connect to database
    await connectDB();

    // Find room
    const room = await Room.findById(body.roomId);
    if (!room) return errorResponse("Room not found", 404);

    // Normalize date for comparison - use date range to handle timezone issues
    const { start: dateStart, end: dateEnd } = getDateRange(body.date);

    // Check for overlapping bookings on the same day
    const existingBooking = await Booking.findOne({
      room: body.roomId,
      date: { $gte: dateStart, $lt: dateEnd },
      status: { $in: ["pending", "confirmed"] },
      $or: [
        { startTime: { $lt: body.endTime }, endTime: { $gt: body.startTime } },
      ],
    });

    if (existingBooking) {
      return errorResponse("This time slot is already booked. Please select a different time.", 409);
    }

    // Create pending booking with expiry (15 minutes to complete payment)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);

    // Normalize date to midnight UTC for consistent storage and comparison
    const normalizedDate = getDateRange(body.date).start;

    // Create booking with guest information
    const booking = await Booking.create({
      room: body.roomId,
      date: normalizedDate,
      startTime: body.startTime,
      endTime: body.endTime,
      totalAmount: body.totalAmount,
      bookingType: body.bookingType,
      status: "pending",
      paymentStatus: "pending",
      expiresAt,
      // Guest information
      guestName: body.guestName,
      guestEmail: body.guestEmail,
      guestPhone: body.guestPhone,
      purpose: body.purpose || "",
      notes: body.notes || "",
    });

    // Create Razorpay order
    const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
    const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

    // If Razorpay keys are not configured, return demo mode response
    // This allows testing the booking flow without real payment credentials
    if (!razorpayKeyId || !razorpayKeySecret) {
      console.log("[Bookings] Razorpay keys not configured - running in demo mode");

      // Generate a demo order ID for testing
      const demoOrderId = `demo_${booking._id}_${Date.now()}`;

      await Booking.findByIdAndUpdate(booking._id, {
        razorpayOrderId: demoOrderId,
      });

      return successResponse(
        {
          booking,
          razorpayOrder: {
            id: demoOrderId,
            amount: body.totalAmount * 100, // paise
            currency: "INR",
          },
          razorpayKeyId: null,
          demoMode: true,
        },
        "Demo booking created. Add Razorpay keys to enable real payments.",
        201
      );
    }

    const razorpay = new Razorpay({
      key_id: razorpayKeyId,
      key_secret: razorpayKeySecret,
    });

    const order = await razorpay.orders.create({
      amount: body.totalAmount * 100, // paise
      currency: "INR",
      receipt: `booking_${booking._id}`,
      notes: {
        bookingId: booking._id.toString(),
        roomId: body.roomId,
        guestEmail: body.guestEmail,
        guestName: body.guestName,
      },
    });

    // Update booking with Razorpay order ID
    await Booking.findByIdAndUpdate(booking._id, {
      razorpayOrderId: order.id,
    });

    return successResponse(
      {
        booking,
        razorpayOrder: {
          id: order.id,
          amount: order.amount,
          currency: order.currency,
        },
        razorpayKeyId: razorpayKeyId,
        demoMode: false,
      },
      "Booking created. Complete payment to confirm.",
      201
    );
  } catch (error: any) {
    console.error("[Bookings] Create booking error:", error);

    // Handle specific Razorpay errors
    if (error?.statusCode === 401) {
      return errorResponse("Payment gateway authentication failed. Check Razorpay keys.", 500);
    }
    if (error?.error?.description) {
      return errorResponse(`Payment error: ${error.error.description}`);
    }

    return errorResponse(error.message || "Failed to create booking");
  }
}

// Get all bookings (no auth required)
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const bookings = await Booking.find()
      .populate("room", "name address city images slug")
      .sort({ createdAt: -1 })
      .lean();

    return successResponse(bookings);
  } catch (error) {
    console.error("[Bookings] Get bookings error:", error);
    return errorResponse("Failed to fetch bookings");
  }
}
