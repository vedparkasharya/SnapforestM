import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import Booking from "@/models/Booking";
import { successResponse, errorResponse } from "@/lib/api-response";
import { checkAdminAuth } from "@/lib/admin-auth";

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  // Route-level auth check
  const auth = checkAdminAuth(request);
  if (!auth.success) return auth.response;

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
