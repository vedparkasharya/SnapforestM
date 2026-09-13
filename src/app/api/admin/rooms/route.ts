import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import Room from "@/models/Room";
import { successResponse, errorResponse } from "@/lib/api-response";
import { checkAdminAuth } from "@/lib/admin-auth";

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

function cleanString(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function cleanUrl(value: unknown) {
  const raw = cleanString(value, 1000);
  if (!raw) return null;
  try {
    const url = new URL(raw);
    return url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

function cleanImages(value: unknown) {
  if (!Array.isArray(value)) return ["/rooms/exterior-main.jpg"];
  const images = value
    .filter((image): image is string => typeof image === "string")
    .map((image) => image.trim())
    .filter(Boolean)
    .slice(0, 30);
  return images.length ? images : ["/rooms/exterior-main.jpg"];
}

function cleanEquipment(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim().slice(0, 100))
    .filter(Boolean)
    .slice(0, 50);
}

export async function POST(request: NextRequest) {
  const auth = checkAdminAuth(request);
  if (!auth.success) return auth.response;

  try {
    await connectDB();
    const body = await request.json();

    const name = cleanString(body.name, 120);
    const slug = cleanString(body.slug, 140).toLowerCase();
    const description = cleanString(body.description, 2000);
    const city = cleanString(body.city, 80) || "Patna";
    const address = cleanString(body.address, 300) || "Patna, Bihar";
    const category = cleanString(body.category, 40).toLowerCase();
    const pricePerHour = Number(body.pricePerHour);
    const pricePerDay = body.pricePerDay === undefined || body.pricePerDay === null
      ? pricePerHour * 8
      : Number(body.pricePerDay);
    const capacity = Number(body.capacity ?? 1);

    if (name.length < 2) return errorResponse("Room name is required and must be at least 2 characters", 400);
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      return errorResponse("Slug must contain only lowercase letters, numbers, and hyphens", 400);
    }
    if (!VALID_CATEGORIES.has(category)) return errorResponse("Invalid room category", 400);
    if (!Number.isFinite(pricePerHour) || pricePerHour <= 0) return errorResponse("Price per hour must be greater than 0", 400);
    if (!Number.isFinite(pricePerDay) || pricePerDay <= 0) return errorResponse("Price per day must be greater than 0", 400);
    if (!Number.isInteger(capacity) || capacity < 1 || capacity > 1000) return errorResponse("Capacity must be a valid positive number", 400);

    const images = cleanImages(body.images);
    const equipment = cleanEquipment(body.equipment);
    const mapLink = cleanUrl(body.mapLink);

    const roomData = {
      name,
      slug,
      description: description || `${name} - Creator studio space.`,
      category,
      city,
      address,
      images,
      equipment,
      pricePerHour,
      pricePerDay,
      featured: body.featured === true,
      rating: 0,
      reviews: 0,
      capacity,
      isAvailable: body.isAvailable !== false,
      mapLink,
    };

    const room = await Room.create(roomData);
    return successResponse(room, "Room created successfully", 201);
  } catch (error: any) {
    console.error("[Rooms API] Create room error:", error);

    if (error?.code === 11000) {
      const field = Object.keys(error.keyValue || {})[0] || "field";
      return errorResponse(`A room with this ${field} already exists. Please use a unique ${field}.`, 409);
    }

    if (error?.name === "ValidationError") {
      const messages = Object.values(error.errors || {}).map((err: any) => err.message).join(", ");
      return errorResponse(`Validation failed: ${messages}`, 400);
    }

    return errorResponse("Failed to create room");
  }
}

export async function GET(request: NextRequest) {
  const auth = checkAdminAuth(request);
  if (!auth.success) return auth.response;

  try {
    await connectDB();
    const rooms = await Room.find().sort({ createdAt: -1 }).lean();
    return successResponse(rooms);
  } catch (error) {
    console.error("[Rooms API] Get rooms error:", error);
    return errorResponse("Failed to fetch rooms");
  }
}
