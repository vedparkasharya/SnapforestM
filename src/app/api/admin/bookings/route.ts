import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import Booking from "@/models/Booking";
import User from "@/models/User";
import { successResponse, errorResponse } from "@/lib/api-response";
import { checkAdminAuth } from "@/lib/admin-auth";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  // Route-level auth check
  const auth = checkAdminAuth(request);
  if (!auth.success) return auth.response;

  try {
    await connectDB();

    const bookings = await Booking.find()
      .populate("user", "name email")
      .populate("room", "name")
      .sort({ createdAt: -1 })
      .lean();

    return successResponse(bookings);
  } catch (error) {
    console.error("Admin bookings error:", error);
    return errorResponse("Failed to fetch bookings");
  }
}
