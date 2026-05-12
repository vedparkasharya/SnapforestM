import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import Room from "@/models/Room";
import { successResponse, errorResponse } from "@/lib/api-response";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const city = searchParams.get("city");
    const category = searchParams.get("category");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const slug = searchParams.get("slug");
    const search = searchParams.get("search");

    const query: any = { isAvailable: true };

    if (slug) {
      query.slug = slug;
    }

    if (city && city !== "All Cities") {
      query.city = { $regex: city, $options: "i" };
    }

    if (category && category !== "All Categories") {
      query.category = category;
    }

    if (minPrice || maxPrice) {
      query.pricePerHour = {};
      if (minPrice) query.pricePerHour.$gte = Number(minPrice);
      if (maxPrice) query.pricePerHour.$lte = Number(maxPrice);
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { address: { $regex: search, $options: "i" } },
      ];
    }

    const rooms = await Room.find(query).sort({ featured: -1, createdAt: -1 }).lean();

    return successResponse(rooms);
  } catch (error) {
    console.error("Get rooms error:", error);
    return errorResponse("Failed to fetch rooms");
  }
}
