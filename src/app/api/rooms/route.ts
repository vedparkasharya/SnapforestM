import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Room from "@/models/Room";
import { successResponse, errorResponse } from "@/lib/api-response";
import { demoRooms } from "@/lib/seed-data";
import { verifySecureToken } from "@/lib/security";

export const dynamic = "force-dynamic";

const VALID_CATEGORIES = new Set([
  "podcast",
  "youtube",
  "music",
  "photography",
  "dance",
  "coworking",
  "gaming",
  "streaming",
  "meeting",
]);

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getAdminToken(request: NextRequest) {
  const header = request.headers.get("authorization");
  if (header?.startsWith("Bearer ")) return header.slice(7).trim();
  return request.headers.get("token")?.trim() || null;
}

function isAdminRequest(request: NextRequest) {
  const token = getAdminToken(request);
  if (!token) return false;
  const payload = verifySecureToken(token);
  return payload?.role === "admin" && payload?.type === "admin";
}

/**
 * GET /api/rooms
 * Fetch publicly available rooms with optional filters.
 * `all=true` is admin-only and includes unavailable rooms.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get("city")?.trim() || "";
  const category = searchParams.get("category")?.trim().toLowerCase() || "";
  const minPriceRaw = searchParams.get("minPrice");
  const maxPriceRaw = searchParams.get("maxPrice");
  const slug = searchParams.get("slug")?.trim() || "";
  const search = searchParams.get("search")?.trim() || "";
  const all = searchParams.get("all") === "true";

  if (all && !isAdminRequest(request)) {
    return errorResponse("Admin access required", 403);
  }

  if (search.length > 100 || city.length > 80 || slug.length > 120) {
    return errorResponse("Filter value is too long", 400);
  }

  if (category && category !== "all categories" && !VALID_CATEGORIES.has(category)) {
    return errorResponse("Invalid room category", 400);
  }

  const minPrice = minPriceRaw === null || minPriceRaw === "" ? null : Number(minPriceRaw);
  const maxPrice = maxPriceRaw === null || maxPriceRaw === "" ? null : Number(maxPriceRaw);
  if ((minPrice !== null && !Number.isFinite(minPrice)) || (maxPrice !== null && !Number.isFinite(maxPrice))) {
    return errorResponse("Invalid price filter", 400);
  }
  if (minPrice !== null && minPrice < 0 || maxPrice !== null && maxPrice < 0 || minPrice !== null && maxPrice !== null && minPrice > maxPrice) {
    return errorResponse("Invalid price range", 400);
  }

  try {
    await connectDB();

    const query: Record<string, any> = {};
    if (!all) query.isAvailable = true;

    if (slug) query.slug = slug;
    if (city && city.toLowerCase() !== "all cities") {
      query.city = { $regex: escapeRegex(city), $options: "i" };
    }
    if (category && category !== "all categories") query.category = category;

    if (minPrice !== null || maxPrice !== null) {
      query.pricePerHour = {};
      if (minPrice !== null) query.pricePerHour.$gte = minPrice;
      if (maxPrice !== null) query.pricePerHour.$lte = maxPrice;
    }

    if (search) {
      const safeSearch = escapeRegex(search);
      query.$or = [
        { name: { $regex: safeSearch, $options: "i" } },
        { description: { $regex: safeSearch, $options: "i" } },
        { address: { $regex: safeSearch, $options: "i" } },
      ];
    }

    const rooms = await Room.find(query)
      .sort({ featured: -1, createdAt: -1 })
      .lean();

    return successResponse(rooms);
  } catch (error: any) {
    console.error("[Rooms API] Get rooms error:", error);

    // Demo data is useful during local development, but must never silently
    // replace production database data with fabricated availability/prices.
    if (process.env.NODE_ENV !== "production") {
      let filteredRooms = demoRooms;
      if (slug) filteredRooms = filteredRooms.filter((room) => room.slug === slug);
      if (city && city.toLowerCase() !== "all cities") {
        filteredRooms = filteredRooms.filter((room) => room.city.toLowerCase() === city.toLowerCase());
      }
      if (category && category !== "all categories") {
        filteredRooms = filteredRooms.filter((room) => room.category === category);
      }
      if (search) {
        const needle = search.toLowerCase();
        filteredRooms = filteredRooms.filter((room) =>
          `${room.name} ${room.description} ${room.address}`.toLowerCase().includes(needle)
        );
      }
      return NextResponse.json({
        success: true,
        message: "Returning local development demo rooms.",
        data: filteredRooms,
        fallback: true,
      });
    }

    return errorResponse("Studios are temporarily unavailable. Please try again later.", 503);
  }
}
