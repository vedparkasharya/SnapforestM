import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import Booking from "@/models/Booking";
import { successResponse, errorResponse } from "@/lib/api-response";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const totalBookings = await Booking.countDocuments();
    const confirmedBookings = await Booking.countDocuments({ status: "confirmed" });
    const totalRevenueAgg = await Booking.aggregate([
      { $match: { paymentStatus: "paid" } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);
    const totalRevenue = totalRevenueAgg[0]?.total || 0;
    const pendingRefunds = await Booking.countDocuments({
      status: "cancelled",
      paymentStatus: "paid",
    });

    // Occupancy rate (booked hours / total available hours in last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentBookings = await Booking.countDocuments({
      date: { $gte: thirtyDaysAgo },
      status: { $in: ["confirmed", "completed"] },
    });
    const occupancyRate = Math.min(100, Math.round((recentBookings / 240) * 100)); // Assume 8 rooms * 30 days

    return successResponse({
      totalBookings,
      totalRevenue,
      pendingRefunds,
      occupancyRate,
    });
  } catch (error) {
    console.error("Revenue stats error:", error);
    return errorResponse("Failed to fetch revenue stats");
  }
}
