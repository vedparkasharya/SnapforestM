import mongoose, { Schema, Document } from "mongoose";

export interface IRoom extends Document {
  name: string;
  slug: string;
  description: string;
  category: string;
  city: string;
  address: string;
  images: string[];
  equipment: string[];
  pricePerHour: number;
  pricePerDay: number;
  featured: boolean;
  rating: number;
  reviews: number;
  capacity: number;
  isAvailable: boolean;
  mapLink?: string;
  cleaningBuffer: number;
  createdAt: Date;
  updatedAt: Date;
}

const RoomSchema = new Schema<IRoom>(
  {
    name: {
      type: String,
      required: [true, "Room name is required"],
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: [
        "podcast",
        "youtube",
        "music",
        "photography",
        "dance",
        "coworking",
        "gaming",
        "streaming",
        "meeting",
      ],
    },
    city: {
      type: String,
      required: [true, "City is required"],
      trim: true,
    },
    address: {
      type: String,
      required: [true, "Address is required"],
    },
    images: [
      {
        type: String,
        required: true,
      },
    ],
    equipment: [
      {
        type: String,
      },
    ],
    pricePerHour: {
      type: Number,
      required: [true, "Price per hour is required"],
      min: 0,
    },
    pricePerDay: {
      type: Number,
      required: [true, "Price per day is required"],
      min: 0,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    rating: {
      type: Number,
      default: 4.5,
      min: 0,
      max: 5,
    },
    reviews: {
      type: Number,
      default: 0,
    },
    capacity: {
      type: Number,
      required: [true, "Capacity is required"],
      min: 1,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    mapLink: {
      type: String,
      default: null,
    },
    cleaningBuffer: {
      type: Number,
      default: 30,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

RoomSchema.index({ city: 1, category: 1 });
RoomSchema.index({ slug: 1 });
RoomSchema.index({ featured: 1 });

const Room = mongoose.models.Room || mongoose.model<IRoom>("Room", RoomSchema);

export default Room;
