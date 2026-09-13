import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Room from "@/models/Room";
import { demoRooms } from "@/lib/seed-data";

export const dynamic = "force-dynamic";

function authorized(request: NextRequest) {
  const secret = process.env.SEED_SECRET;
  if (!secret) return false;
  const header = request.headers.get("x-seed-secret");
  return Boolean(header && header === secret);
}

export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { success: false, message: "Seed endpoint is disabled in production." },
      { status: 404 }
    );
  }

  if (!authorized(request)) {
    return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
  }

  try {
    await connectDB();

    let seeded = 0;
    for (const room of demoRooms) {
      await Room.findOneAndUpdate(
        { slug: room.slug },
        { $set: room },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      seeded += 1;
    }

    return NextResponse.json({
      success: true,
      message: `Seeded ${seeded} rooms. Admin credentials are never created by this endpoint.`,
      rooms: seeded,
    });
  } catch (error: any) {
    console.error("Seed error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Seed failed" },
      { status: 500 }
    );
  }
}
