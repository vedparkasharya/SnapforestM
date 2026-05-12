import { NextRequest } from "next/server";
import { getServerSession } from "@/lib/auth";
import connectDB from "@/lib/db";
import Booking from "@/models/Booking";
import User from "@/models/User";
import { successResponse, errorResponse, unauthorizedError, forbiddenError } from "@/lib/api-response";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return unauthorizedError();
    }

    await connectDB();

    const user = await User.findOne({ email: session.user.email });
    if (!user || user.role !== "admin") {
      return forbiddenError();
    }

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
