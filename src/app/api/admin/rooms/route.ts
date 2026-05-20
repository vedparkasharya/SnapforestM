import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import Room from "@/models/Room";
import { successResponse, errorResponse } from "@/lib/api-response";
import { checkAdminAuth } from "@/lib/admin-auth";

export const dynamic = 'force-dynamic';

/**
 * POST /api/admin/rooms
 * Create a new room
 *
 * Required fields: name, slug, category, pricePerHour
 * Optional fields: description, city, address, images, equipment, pricePerDay, capacity, featured, mapLink
 */
export async function POST(request: NextRequest) {
  // Route-level auth check
  const auth = checkAdminAuth(request);
  if (!auth.success) return auth.response;

  try {
    await connectDB();

    const body = await request.json();

    console.log("[Rooms API] Create room request:", JSON.stringify(body, null, 2));

    // Validate required fields
    if (!body.name || typeof body.name !== "string" || body.name.trim().length < 2) {
      return errorResponse("Room name is required and must be at least 2 characters");
    }

    if (!body.slug || typeof body.slug !== "string" || body.slug.trim().length < 2) {
      return errorResponse("Slug is required and must be at least 2 characters");
    }

    // Validate slug format (lowercase, hyphens, alphanumeric)
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    if (!slugRegex.test(body.slug)) {
      return errorResponse("Slug must contain only lowercase letters, numbers, and hyphens (e.g., 'podcast-studio')");
    }

    if (!body.category) {
      return errorResponse("Category is required");
    }

    const validCategories = [
      "podcast", "youtube", "music", "photography", "dance",
      "coworking", "gaming", "streaming", "meeting",
    ];
    if (!validCategories.includes(body.category)) {
      return errorResponse(`Invalid category. Must be one of: ${validCategories.join(", ")}`);
    }

    if (body.pricePerHour === undefined || body.pricePerHour === null || Number(body.pricePerHour) < 0) {
      return errorResponse("Price per hour is required and must be a positive number");
    }

    // Validate images array
    const images = Array.isArray(body.images) && body.images.length > 0
      ? body.images.filter((img: string) => typeof img === "string" && img.trim().length > 0)
      : ["/rooms/exterior-main.jpg"];

    if (images.length === 0) {
      images.push("/rooms/exterior-main.jpg");
    }

    // Validate equipment array
    const equipment = Array.isArray(body.equipment)
      ? body.equipment.filter((eq: string) => typeof eq === "string" && eq.trim().length > 0)
      : [];

    // Set defaults for optional fields
    const roomData = {
      name: body.name.trim(),
      slug: body.slug.trim().toLowerCase(),
      description: body.description?.trim() || `${body.name} - A premium creator studio space.`,
      category: body.category,
      city: body.city?.trim() || "Patna",
      address: body.address?.trim() || "Patna, Bihar",
      images: images,
      equipment: equipment,
      pricePerHour: Number(body.pricePerHour) || 0,
      pricePerDay: Number(body.pricePerDay) || (Number(body.pricePerHour) * 8) || 0,
      featured: body.featured === true,
      rating: 4.5,
      reviews: 0,
      capacity: Number(body.capacity) || 1,
      isAvailable: body.isAvailable !== false, // default to true
      mapLink: body.mapLink?.trim() || null,
    };

    console.log("[Rooms API] Creating room with data:", JSON.stringify(roomData, null, 2));

    const room = await Room.create(roomData);

    console.log("[Rooms API] Room created successfully:", room._id);

    return successResponse(room, "Room created successfully", 201);
  } catch (error: any) {
    console.error("[Rooms API] Create room error:", error);

    // Check for duplicate key error (MongoDB error code 11000)
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue || {})[0] || "field";
      return errorResponse(`A room with this ${field} already exists. Please use a unique ${field}.`);
    }

    // Check for Mongoose validation errors
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors || {}).map((err: any) => err.message).join(", ");
      return errorResponse(`Validation failed: ${messages}`);
    }

    return errorResponse(error.message || "Failed to create room");
  }
}

/**
 * GET /api/admin/rooms
 * Get all rooms (admin endpoint - includes unavailable rooms)
 */
export async function GET(request: NextRequest) {
  // Route-level auth check
  const auth = checkAdminAuth(request);
  if (!auth.success) return auth.response;

  try {
    await connectDB();

    const rooms = await Room.find().sort({ createdAt: -1 }).lean();
    return successResponse(rooms);
  } catch (error: any) {
    console.error("[Rooms API] Get rooms error:", error);
    return errorResponse("Failed to fetch rooms: " + (error.message || "Unknown error"));
  }
}
