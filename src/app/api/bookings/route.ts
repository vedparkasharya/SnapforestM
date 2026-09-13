import { NextRequest } from "next/server";
import Razorpay from "razorpay";
import connectDB from "@/lib/db";
import Booking from "@/models/Booking";
import Room from "@/models/Room";
import { successResponse, errorResponse, validationError } from "@/lib/api-response";
import { BookingSchema } from "@/types";
import { verifySecureToken } from "@/lib/security";

export const dynamic = "force-dynamic";

function getDateRange(dateStr: string) {
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) throw new Error("Invalid booking date");
  const start = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);
  return { start, end };
}

function getToken(request: NextRequest) {
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) return null;
  return header.slice(7).trim() || null;
}

function getAuthPayload(request: NextRequest) {
  const token = getToken(request);
  return token ? verifySecureToken(token) : null;
}

function calculateAmount(room: any, startTime: string, endTime: string, bookingType: string) {
  if (bookingType === "daily") return Number(room.pricePerDay || 0);
  const [startHour, startMinute] = startTime.split(":").map(Number);
  const [endHour, endMinute] = endTime.split(":").map(Number);
  const duration = endHour + endMinute / 60 - (startHour + startMinute / 60);
  if (!Number.isFinite(duration) || duration <= 0 || duration > 24) return null;
  return Math.round(Number(room.pricePerHour || 0) * duration);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = BookingSchema.safeParse(body);
    if (!validated.success) {
      return validationError(
        "Invalid booking data",
        validated.error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ")
      );
    }

    await connectDB();
    const room = await Room.findById(validated.data.roomId);
    if (!room) return errorResponse("Room not found", 404);

    const { start: dateStart } = getDateRange(validated.data.date);
    const amount = calculateAmount(
      room,
      validated.data.startTime,
      validated.data.endTime,
      validated.data.bookingType
    );
    if (amount === null || amount <= 0) return errorResponse("Invalid booking duration or room pricing", 400);

    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    const existingBooking = await Booking.findOne({
      room: validated.data.roomId,
      date: dateStart,
      status: { $in: ["pending", "confirmed"] },
      $or: [{ startTime: { $lt: validated.data.endTime }, endTime: { $gt: validated.data.startTime } }],
      $and: [
        {
          $or: [
            { status: "confirmed" },
            { expiresAt: { $gt: new Date() } },
          ],
        },
      ],
    });

    if (existingBooking) {
      return errorResponse("This time slot is already booked. Please select a different time.", 409);
    }

    const booking = await Booking.create({
      room: validated.data.roomId,
      date: dateStart,
      startTime: validated.data.startTime,
      endTime: validated.data.endTime,
      totalAmount: amount,
      bookingType: validated.data.bookingType,
      status: "pending",
      paymentStatus: "pending",
      expiresAt,
      guestName: validated.data.guestName,
      guestEmail: validated.data.guestEmail,
      guestPhone: validated.data.guestPhone,
      purpose: validated.data.purpose || "",
      notes: validated.data.notes || "",
    });

    const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
    const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

    // Demo checkout is explicitly opt-in and never available in production.
    const allowDemoPayments = process.env.NODE_ENV !== "production" && process.env.ALLOW_DEMO_PAYMENTS === "true";
    if (!razorpayKeyId || !razorpayKeySecret) {
      if (!allowDemoPayments) {
        await Booking.findByIdAndDelete(booking._id);
        return errorResponse("Online payments are temporarily unavailable. Please try again later.", 503);
      }

      const demoOrderId = `demo_${booking._id}_${Date.now()}`;
      await Booking.findByIdAndUpdate(booking._id, { razorpayOrderId: demoOrderId });
      return successResponse(
        {
          booking,
          razorpayOrder: { id: demoOrderId, amount: amount * 100, currency: "INR" },
          razorpayKeyId: null,
          demoMode: true,
        },
        "Demo booking created.",
        201
      );
    }

    const razorpay = new Razorpay({ key_id: razorpayKeyId, key_secret: razorpayKeySecret });
    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: "INR",
      receipt: `booking_${booking._id}`,
      notes: {
        bookingId: booking._id.toString(),
        roomId: validated.data.roomId,
        guestEmail: validated.data.guestEmail,
        guestName: validated.data.guestName,
      },
    });

    await Booking.findByIdAndUpdate(booking._id, { razorpayOrderId: order.id });

    return successResponse(
      {
        booking,
        razorpayOrder: { id: order.id, amount: order.amount, currency: order.currency },
        razorpayKeyId,
        demoMode: false,
      },
      "Booking created. Complete payment to confirm.",
      201
    );
  } catch (error: any) {
    console.error("[Bookings] Create booking error:", error);
    if (error?.statusCode === 401) return errorResponse("Payment gateway authentication failed.", 500);
    if (error?.error?.description) return errorResponse(`Payment error: ${error.error.description}`);
    return errorResponse(error.message || "Failed to create booking");
  }
}

export async function GET(request: NextRequest) {
  try {
    const auth = getAuthPayload(request);
    if (!auth?.userId || !["user", "admin"].includes(auth.type)) {
      return errorResponse("Unauthorized", 401);
    }

    await connectDB();
    const query = auth.type === "admin" || auth.role === "admin"
      ? {}
      : { $or: [{ user: auth.userId }, { guestEmail: String(auth.email).toLowerCase() }] };

    const bookings = await Booking.find(query)
      .populate("room", "name address city images slug")
      .sort({ createdAt: -1 })
      .lean();

    return successResponse(bookings);
  } catch (error) {
    console.error("[Bookings] Get bookings error:", error);
    return errorResponse("Failed to fetch bookings");
  }
}
