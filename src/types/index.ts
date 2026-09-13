import { z } from "zod";

export const roomCategoryEnum = z.enum([
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

export const bookingStatusEnum = z.enum([
  "pending",
  "confirmed",
  "cancelled",
  "completed",
]);

export const paymentStatusEnum = z.enum([
  "pending",
  "paid",
  "failed",
  "cancelled",
  "refunded",
]);

export const bookingTypeEnum = z.enum(["hourly", "daily"]);
export const userRoleEnum = z.enum(["user", "admin"]);

export const RoomSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  slug: z.string().min(2),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: roomCategoryEnum,
  city: z.string().min(1, "City is required"),
  address: z.string().min(5, "Address is required"),
  images: z.array(z.string()).min(1, "At least one image is required"),
  equipment: z.array(z.string()).optional(),
  pricePerHour: z.number().min(0),
  pricePerDay: z.number().min(0),
  featured: z.boolean().optional(),
  rating: z.number().min(0).max(5).optional(),
  capacity: z.number().min(1),
  mapLink: z.string().optional(),
});

export const BookingSchema = z.object({
  roomId: z.string().min(1, "Room ID is required"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  startTime: z.string().regex(/^$|^([01]\d|2[0-3]):(00|30)$/, "Invalid time format"),
  endTime: z.string().regex(/^$|^([01]\d|2[0-3]):(00|30)$/, "Invalid time format"),
  bookingType: bookingTypeEnum,
  totalAmount: z.number().min(0),
  guestName: z.string().trim().min(2, "Your name is required").max(100, "Name is too long"),
  guestEmail: z.string().trim().email("Please enter a valid email address").max(254, "Email is too long"),
  guestPhone: z.string().regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit Indian mobile number"),
  purpose: z.string().trim().max(200, "Purpose is too long").optional(),
  notes: z.string().trim().max(1000, "Notes are too long").optional(),
});

export const BookingQuerySchema = z.object({
  city: z.string().optional(),
  category: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  date: z.string().optional(),
});

export type RoomInput = z.infer<typeof RoomSchema>;
export type BookingInput = z.infer<typeof BookingSchema>;
export type BookingQuery = z.infer<typeof BookingQuerySchema>;

export interface RoomFilters {
  city?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  date?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}
