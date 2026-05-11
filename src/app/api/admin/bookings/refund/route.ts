import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/db";
import Booking from "@/models/Booking";
import User from "@/models/User";
import { successResponse, errorResponse, unauthorizedError, forbiddenError } from "@/lib/api-response";

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { bookingId } = body;

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
