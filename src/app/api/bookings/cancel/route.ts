import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import Booking from "@/models/Booking";
import { successResponse, errorResponse } from "@/lib/api-response";

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookingId } = body;

    await connectDB();

    const booking = await Booking.findById(bookingId);

    if (!booking) return errorResponse("Booking not found", 404);

    // Check cancellation window (30 min before start)
    const bookingDate = new Date(booking.date);
    const [hours, minutes] = booking.startTime.split(":").map(Number);
    bookingDate.setHours(hours, minutes, 0, 0);
    const cancellationDeadline = new Date(bookingDate.getTime() - 30 * 60 * 1000);

    if (new Date() >= cancellationDeadline) {
      return errorResponse("Cancellation is only allowed up to 30 minutes before the booking starts", 400);
    }

    booking.status = "cancelled";
    booking.paymentStatus = booking.paymentStatus === "paid" ? "refunded" : "cancelled";
    await booking.save();

    return successResponse(booking, "Booking cancelled successfully");
  } catch (error: any) {
    console.error("Cancel booking error:", error);
    return errorResponse(error.message || "Failed to cancel booking");
  }
}
