import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import Room from "@/models/Room";
import { successResponse, errorResponse } from "@/lib/api-response";

export const dynamic = 'force-dynamic';

/**
 * GET /api/rooms
 * Fetch rooms with optional filters
 *
 * Query params:
 * - city: Filter by city name (case-insensitive regex)
 * - category: Filter by room category
 * - minPrice/maxPrice: Filter by price range
 * - slug: Get single room by slug
 * - search: Search in name, description, address
 * - all: If "true", include unavailable rooms (admin)
 */
export async function GET(request: NextRequest) {
  try {
    // Connect to database first
    await connectDB();

    const { searchParams } = new URL(request.url);
    const city = searchParams.get("city");
    const category = searchParams.get("category");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const slug = searchParams.get("slug");
    const search = searchParams.get("search");
    const all = searchParams.get("all"); // Admin flag to get all rooms including unavailable

    const query: any = {};

    // Only filter by isAvailable if not requesting all rooms (admin)
    if (!all) {
      query.isAvailable = true;
    }

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

    // Fetch rooms from database
    const rooms = await Room.find(query)
      .sort({ featured: -1, createdAt: -1 })
      .lean();

    // Log for debugging
    console.log(`[Rooms API] Found ${rooms.length} rooms with query:`, JSON.stringify(query));

    return successResponse(rooms);
  } catch (error: any) {
    console.error("[Rooms API] Get rooms error:", error);

    // Return proper error response so frontend can show error message
    // instead of silently failing with empty array
    return errorResponse(
      `Failed to fetch rooms: ${error?.message || "Unknown error"}. Check your MongoDB connection.`,
      500,
      error?.message
    );
  }
}
