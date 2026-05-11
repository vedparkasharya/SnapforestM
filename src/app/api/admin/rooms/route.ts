import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/db";
import Room from "@/models/Room";
import User from "@/models/User";
import { successResponse, errorResponse, unauthorizedError, forbiddenError } from "@/lib/api-response";

export async function POST(request: NextRequest) {
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
    const room = await Room.create(body);

    return successResponse(room, "Room created successfully", 201);
  } catch (error: any) {
    console.error("Create room error:", error);
    return errorResponse(error.message || "Failed to create room");
  }
}
