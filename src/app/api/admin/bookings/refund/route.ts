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

    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      { paymentStatus: "refunded" },
      { new: true }
    );

    if (!booking) return errorResponse("Booking not found", 404);

    return successResponse(booking, "Refund processed");
  } catch (error: any) {
    console.error("Refund error:", error);
    return errorResponse(error.message || "Refund failed");
  }
}
