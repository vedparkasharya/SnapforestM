/**
 * Central Model Registry
 *
 * This file ensures all Mongoose models are registered in the correct order.
 * Import this file whenever you need to ensure all models are available.
 *
 * Usage: import "@/models" or import { User, Room, Booking } from "@/models"
 */

import "./User";
import "./Room";
import "./Booking";

// Re-export for convenience
export { default as User } from "./User";
export { default as Room } from "./Room";
export { default as Booking } from "./Booking";
