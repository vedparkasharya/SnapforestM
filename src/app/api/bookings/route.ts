import { NextRequest } from "next/server";
import { getServerSession } from "@/lib/auth";
import connectDB from "@/lib/db";
import Booking from "@/models/Booking";
import Room from "@/models/Room";
import User from "@/models/User";
import { successResponse, errorResponse, unauthorizedError, validationError } from "@/lib/api-response";
import { BookingSchema } from "@/types";

// Create booking + Razorpay order
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return unauthorizedError("Please sign in to book");
    }

    const body = await request.json();
    const validated = BookingSchema.safeParse(body);
    if (!validated.success) {
      return validationError("Invalid booking data", validated.error.message);
    }

    await connectDB();

    const user = await User.findOne({ email: session.user.email });
    if (!user) return errorResponse("User not found", 404);

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
      user: user._id,
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
    const Razorpay = require("razorpay");
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const order = await razorpay.orders.create({
      amount: body.totalAmount * 100, // paise
      currency: "INR",
      receipt: `booking_${booking._id}`,
      notes: {
        bookingId: booking._id.toString(),
        userId: user._id.toString(),
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
    console.error("Create booking error:", error);
    return errorResponse(error.message || "Failed to create booking");
  }
}

// Get user bookings
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return unauthorizedError();
    }

    await connectDB();

    const user = await User.findOne({ email: session.user.email });
    if (!user) return errorResponse("User not found", 404);

    const bookings = await Booking.find({ user: user._id })
      .populate("room", "name address city images slug")
      .sort({ createdAt: -1 })
      .lean();

    return successResponse(bookings);
  } catch (error) {
    console.error("Get bookings error:", error);
    return errorResponse("Failed to fetch bookings");
  }
}
