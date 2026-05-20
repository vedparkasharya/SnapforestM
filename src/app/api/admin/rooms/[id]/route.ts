import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import Room from "@/models/Room";
import { successResponse, errorResponse, notFoundError } from "@/lib/api-response";
import { checkAdminAuth } from "@/lib/admin-auth";

export const dynamic = 'force-dynamic';

// Update room (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Route-level auth check
  const auth = checkAdminAuth(request);
  if (!auth.success) return auth.response;

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

// Delete room (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Route-level auth check
  const auth = checkAdminAuth(request);
  if (!auth.success) return auth.response;

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
