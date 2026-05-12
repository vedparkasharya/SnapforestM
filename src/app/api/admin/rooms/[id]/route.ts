import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/db";
import Room from "@/models/Room";
import User from "@/models/User";
import { successResponse, errorResponse, unauthorizedError, forbiddenError, notFoundError } from "@/lib/api-response";

// Update room
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
