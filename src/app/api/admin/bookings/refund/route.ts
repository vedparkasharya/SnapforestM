import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import Booking from "@/models/Booking";
import { successResponse, errorResponse } from "@/lib/api-response";
import { requireAdminAuth } from "@/lib/admin-auth";

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  // Auth check (fallback if middleware doesn't catch it)
  const authError = requireAdminAuth(request);
  if (authError) return authError;

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
