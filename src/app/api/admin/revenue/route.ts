import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import Booking from "@/models/Booking";
import Room from "@/models/Room";
import { successResponse, errorResponse } from "@/lib/api-response";
import { checkAdminAuth } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const auth = checkAdminAuth(request);
  if (!auth.success) return auth.response;

  try {
    await connectDB();

    const [totalBookings, confirmedBookings, roomCount, totalRevenueAgg, pendingRefunds] = await Promise.all([
      Booking.countDocuments(),
      Booking.countDocuments({ status: "confirmed" }),
      Room.countDocuments({ isAvailable: true }),
      Booking.aggregate([
        { $match: { paymentStatus: "paid" } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),
      Booking.countDocuments({ status: "cancelled", paymentStatus: "paid" }),
    ]);

    const totalRevenue = totalRevenueAgg[0]?.total || 0;
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentBookings = await Booking.countDocuments({
      date: { $gte: thirtyDaysAgo },
      status: { $in: ["confirmed", "completed"] },
    });

    // This is a booking-rate proxy, not a fabricated hour-based occupancy number.
    // It compares confirmed room-day bookings with the number of available room-days.
    const availableRoomDays = Math.max(roomCount * 30, 1);
    const occupancyRate = Math.min(100, Math.round((recentBookings / availableRoomDays) * 100));

    return successResponse({
      totalBookings,
      confirmedBookings,
      totalRevenue,
      pendingRefunds,
      occupancyRate,
      recentBookings,
      availableRooms: roomCount,
    });
  } catch (error) {
    console.error("Revenue stats error:", error);
    return errorResponse("Failed to fetch revenue stats");
  }
}
