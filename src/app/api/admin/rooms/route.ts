import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import Room from "@/models/Room";
import { successResponse, errorResponse } from "@/lib/api-response";

export const dynamic = 'force-dynamic';

// Create room (no auth required)
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const room = await Room.create(body);

    return successResponse(room, "Room created successfully", 201);
  } catch (error: any) {
    console.error("Create room error:", error);
    return errorResponse(error.message || "Failed to create room");
  }
}

// Get all rooms (no auth required)
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const rooms = await Room.find().sort({ createdAt: -1 }).lean();
    return successResponse(rooms);
  } catch (error: any) {
    console.error("Get rooms error:", error);
    return errorResponse(error.message || "Failed to fetch rooms");
  }
}
