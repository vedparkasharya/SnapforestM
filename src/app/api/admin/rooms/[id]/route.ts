import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import Room from "@/models/Room";
import { successResponse, errorResponse, notFoundError } from "@/lib/api-response";
import { requireAdminAuth } from "@/lib/admin-auth";

export const dynamic = 'force-dynamic';

// Update room
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Auth check (fallback if middleware doesn't catch it)
  const authError = requireAdminAuth(request);
  if (authError) return authError;

  try {
    await connectDB();

    const body = await request.json();
    const room = await Room.findByIdAndUpdate(
      params.id,
      { $set: body },
      { new: true, runValidators: true }
    );

    if (!room) {
      return notFoundError("Room not found");
    }

    return successResponse(room, "Room updated successfully");
  } catch (error: any) {
    console.error("Update room error:", error);
    return errorResponse(error.message || "Failed to update room");
  }
}

// Delete room
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Auth check (fallback if middleware doesn't catch it)
  const authError = requireAdminAuth(request);
  if (authError) return authError;

  try {
    await connectDB();

    const room = await Room.findByIdAndDelete(params.id);

    if (!room) {
      return notFoundError("Room not found");
    }

    return successResponse(null, "Room deleted successfully");
  } catch (error: any) {
    console.error("Delete room error:", error);
    return errorResponse(error.message || "Failed to delete room");
  }
}
