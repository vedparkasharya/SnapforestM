import { NextRequest } from "next/server";
import { getServerSession } from "@/lib/auth";
import connectDB from "@/lib/db";
import Booking from "@/models/Booking";
import User from "@/models/User";
import { successResponse, errorResponse, unauthorizedError } from "@/lib/api-response";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return unauthorizedError();
    }

    const body = await request.json();
    const { bookingId } = body;

    await connectDB();

    const user = await User.findOne({ email: session.user.email });
    if (!user) return errorResponse("User not found", 404);

    const booking = await Booking.findOne({
      _id: bookingId,
      user: user._id,
    });

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
