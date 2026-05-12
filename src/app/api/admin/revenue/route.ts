import { NextRequest } from "next/server";
import { getServerSession } from "@/lib/auth";
import connectDB from "@/lib/db";
import Booking from "@/models/Booking";
import User from "@/models/User";
import { successResponse, errorResponse, unauthorizedError, forbiddenError } from "@/lib/api-response";

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
