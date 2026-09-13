import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import Booking from "@/models/Booking";
import { successResponse, errorResponse } from "@/lib/api-response";
import { verifySecureToken } from "@/lib/security";

export const dynamic = "force-dynamic";

function getAuth(request: NextRequest) {
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) return null;
  return verifySecureToken(header.slice(7).trim());
}

export async function POST(request: NextRequest) {
  try {
    const auth = getAuth(request);
    if (!auth?.userId || !["user", "admin"].includes(auth.type)) {
      return errorResponse("Unauthorized", 401);
    }

    const body = await request.json();
    const bookingId = typeof body?.bookingId === "string" ? body.bookingId.trim() : "";
    if (!bookingId) return errorResponse("Booking ID is required", 400);

    await connectDB();
    const booking = await Booking.findById(bookingId);
    if (!booking) return errorResponse("Booking not found", 404);

    const isAdmin = auth.type === "admin" || auth.role === "admin";
    const ownsBooking =
      booking.user?.toString() === String(auth.userId) ||
      booking.guestEmail?.toLowerCase() === String(auth.email).toLowerCase();

    if (!isAdmin && !ownsBooking) return errorResponse("You are not allowed to cancel this booking", 403);
    if (["cancelled", "completed"].includes(booking.status)) {
      return errorResponse(`Booking is already ${booking.status}`, 400);
    }

    const bookingDate = new Date(booking.date);
    const [hours, minutes] = booking.startTime.split(":").map(Number);
    if (!Number.isInteger(hours) || !Number.isInteger(minutes)) {
      return errorResponse("Booking has an invalid start time", 400);
    }
    bookingDate.setUTCHours(hours, minutes, 0, 0);
    const cancellationDeadline = new Date(bookingDate.getTime() - 30 * 60 * 1000);

    if (new Date() >= cancellationDeadline && !isAdmin) {
      return errorResponse("Cancellation is only allowed up to 30 minutes before the booking starts", 400);
    }

    booking.status = "cancelled";
    // Cancellation is not the same as a refund. Refunds must be performed through Razorpay/admin tooling.
    if (booking.paymentStatus !== "paid") booking.paymentStatus = "cancelled";
    await booking.save();

    return successResponse(
      booking,
      booking.paymentStatus === "paid"
        ? "Booking cancelled. Your paid amount is pending refund processing."
        : "Booking cancelled successfully"
    );
  } catch (error: any) {
    console.error("Cancel booking error:", error);
    return errorResponse(error.message || "Failed to cancel booking");
  }
}
