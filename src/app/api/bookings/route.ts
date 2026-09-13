import { NextRequest } from "next/server";
import Razorpay from "razorpay";
import connectDB from "@/lib/db";
import Booking from "@/models/Booking";
import Room from "@/models/Room";
import { successResponse, errorResponse, validationError } from "@/lib/api-response";
import { BookingSchema } from "@/types";
import { verifySecureToken } from "@/lib/security";

export const dynamic = "force-dynamic";

function getTodayInIndia(): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function getDateRange(dateStr: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) throw new Error("Invalid booking date");
  const date = new Date(`${dateStr}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== dateStr) {
    throw new Error("Invalid booking date");
  }

  if (dateStr < getTodayInIndia()) {
    throw new Error("Bookings cannot be made for a date in the past");
  }

  const start = date;
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

function parseTime(time: string): number | null {
  const match = /^(\d{2}):(\d{2})$/.exec(time);
  if (!match) return null;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (hour < 0 || hour > 23 || ![0, 30].includes(minute)) return null;
  return hour * 60 + minute;
}

function calculateAmount(room: any, startTime: string, endTime: string, bookingType: string) {
  if (bookingType === "daily") return Number(room.pricePerDay || 0);

  const start = parseTime(startTime);
  const end = parseTime(endTime);
  if (start === null || end === null || end <= start) return null;

  const durationHours = (end - start) / 60;
  if (durationHours <= 0 || durationHours > 24) return null;
  return Math.round(Number(room.pricePerHour || 0) * durationHours);
}

function buildSlotKeys(startTime: string, endTime: string, bookingType: "hourly" | "daily") {
  if (bookingType === "daily") {
    return Array.from({ length: 48 }, (_, index) => {
      const minutes = index * 30;
      return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
    });
  }

  const start = parseTime(startTime);
  const end = parseTime(endTime);
  if (start === null || end === null || end <= start) return null;

  const slots: string[] = [];
  for (let minutes = start; minutes < end; minutes += 30) {
    slots.push(`${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`);
  }
  return slots;
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

    const auth = getAuthPayload(request);
    const guestEmail = validated.data.guestEmail.trim().toLowerCase();

    await connectDB();
    const room = await Room.findById(validated.data.roomId).lean();
    if (!room || !room.isAvailable) return errorResponse("Room is not available", 404);

    const { start: dateStart } = getDateRange(validated.data.date);
    const todayInIndia = getTodayInIndia();

    if (validated.data.bookingType === "hourly") {
      const startMinutes = parseTime(validated.data.startTime);
      const endMinutes = parseTime(validated.data.endTime);
      if (startMinutes === null || endMinutes === null || endMinutes <= startMinutes) {
        return errorResponse("Choose valid 30-minute time slots", 400);
      }

      if (validated.data.date === todayInIndia) {
        const nowParts = new Intl.DateTimeFormat("en-GB", {
          timeZone: "Asia/Kolkata",
          hour: "2-digit",
          minute: "2-digit",
          hourCycle: "h23",
        }).formatToParts(new Date());
        const nowMinutes = Number(nowParts.find((part) => part.type === "hour")?.value || 0) * 60 +
          Number(nowParts.find((part) => part.type === "minute")?.value || 0);
        if (startMinutes <= nowMinutes) {
          return errorResponse("Please choose a future time slot", 400);
        }
      }
    }

    const amount = calculateAmount(
      room,
      validated.data.startTime,
      validated.data.endTime,
      validated.data.bookingType
    );
    if (amount === null || amount <= 0) return errorResponse("Invalid booking duration or room pricing", 400);

    const slotKeys = buildSlotKeys(
      validated.data.startTime,
      validated.data.endTime,
      validated.data.bookingType
    );
    if (!slotKeys?.length) return errorResponse("Invalid booking slot", 400);

    // Expired payment holds are no longer active. Marking them cancelled also
    // removes their slot keys from the unique active-booking index.
    await Booking.updateMany(
      { status: "pending", expiresAt: { $lte: new Date() } },
      { $set: { status: "cancelled", paymentStatus: "failed" } }
    );

    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    const overlapQuery = validated.data.bookingType === "daily"
      ? {
          room: validated.data.roomId,
          date: dateStart,
          status: { $in: ["pending", "confirmed"] },
        }
      : {
          room: validated.data.roomId,
          date: dateStart,
          status: { $in: ["pending", "confirmed"] },
          startTime: { $lt: validated.data.endTime },
          endTime: { $gt: validated.data.startTime },
        };

    const existingBooking = await Booking.findOne(overlapQuery).select("_id").lean();
    if (existingBooking) {
      return errorResponse("This time slot is already booked. Please select a different time.", 409);
    }

    const bookingData = {
      room: validated.data.roomId,
      date: dateStart,
      startTime: validated.data.startTime,
      endTime: validated.data.endTime,
      slotKeys,
      totalAmount: amount,
      bookingType: validated.data.bookingType,
      status: "pending" as const,
      paymentStatus: "pending" as const,
      expiresAt,
      user: auth?.userId || null,
      guestName: validated.data.guestName.trim(),
      guestEmail,
      guestPhone: validated.data.guestPhone.replace(/\D/g, ""),
      purpose: validated.data.purpose?.trim() || "",
      notes: validated.data.notes?.trim() || "",
    };

    let booking;
    try {
      booking = await Booking.create(bookingData);
    } catch (error: any) {
      if (error?.code === 11000) {
        return errorResponse("This time slot was just booked. Please choose another slot.", 409);
      }
      throw error;
    }

    const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
    const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;
    const allowDemoPayments = process.env.NODE_ENV !== "production" && process.env.ALLOW_DEMO_PAYMENTS === "true";

    if (!razorpayKeyId || !razorpayKeySecret) {
      if (!allowDemoPayments) {
        await Booking.findByIdAndUpdate(booking._id, { status: "cancelled", paymentStatus: "failed" });
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
        guestEmail,
        guestName: validated.data.guestName.trim(),
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
