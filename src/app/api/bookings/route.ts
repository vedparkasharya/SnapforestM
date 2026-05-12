import { NextRequest } from "next/server";
import Razorpay from "razorpay";
import connectDB from "@/lib/db";
import Booking from "@/models/Booking";
import Room from "@/models/Room";
import { successResponse, errorResponse, validationError } from "@/lib/api-response";
import { BookingSchema } from "@/types";

export const dynamic = 'force-dynamic';

/**
 * Create booking + Razorpay order
 *
 * No authentication required - anyone can book.
 */
export async function POST(request: NextRequest) {
  try {
    // Validate request body
    const body = await request.json();
    const validated = BookingSchema.safeParse(body);
    if (!validated.success) {
      return validationError("Invalid booking data", validated.error.message);
    }

    // Connect to database
    await connectDB();

    // Find room
    const room = await Room.findById(body.roomId);
    if (!room) return errorResponse("Room not found", 404);

    // Check for overlapping bookings
    const existingBooking = await Booking.findOne({
      room: body.roomId,
      date: new Date(body.date),
      status: { $in: ["pending", "confirmed"] },
      $or: [
        { startTime: { $lte: body.endTime }, endTime: { $gte: body.startTime } },
      ],
    });

    if (existingBooking) {
      return errorResponse("This time slot is already booked. Please select a different time.", 409);
    }

    // Create pending booking with expiry
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);

    const booking = await Booking.create({
      room: body.roomId,
      date: new Date(body.date),
      startTime: body.startTime,
      endTime: body.endTime,
      totalAmount: body.totalAmount,
      bookingType: body.bookingType,
      status: "pending",
      paymentStatus: "pending",
      expiresAt,
    });

    // Create Razorpay order
    const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
    const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!razorpayKeyId || !razorpayKeySecret) {
      console.error("[Bookings] Razorpay credentials missing");
      return errorResponse("Payment gateway not configured", 500);
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
