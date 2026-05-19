import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import Room from "@/models/Room";
import { successResponse, errorResponse } from "@/lib/api-response";

export const dynamic = 'force-dynamic';

// Create room
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    
    // Ensure required fields are present
    if (!body.name || !body.slug || !body.category || !body.pricePerHour) {
      return errorResponse("Missing required fields: name, slug, category, pricePerHour");
    }

    // Set defaults for optional fields
    const roomData = {
      ...body,
      isAvailable: body.isAvailable !== undefined ? body.isAvailable : true,
      featured: body.featured || false,
      rating: body.rating || 4.5,
      reviews: body.reviews || 0,
      images: body.images && body.images.length > 0 ? body.images : ["/rooms/default-room.jpg"],
    };

    const room = await Room.create(roomData);

    return successResponse(room, "Room created successfully", 201);
  } catch (error: any) {
    console.error("Create room error:", error);
    // Check for duplicate key error
    if (error.code === 11000) {
      return errorResponse("A room with this slug already exists. Please use a unique slug.");
    }
    return errorResponse(error.message || "Failed to create room");
  }
}

// Get all rooms
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const rooms = await Room.find().sort({ createdAt: -1 }).lean();
    return successResponse(rooms);
  } catch (error: any) {
    console.error("Get rooms error:", error);
    return successResponse([]);
  }
}
