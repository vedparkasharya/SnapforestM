import mongoose, { Schema, Document } from 'mongoose';

export interface IRoom extends Document {
  name: string;
  slug: string;
  description: string;
  category: string;
  pricePerHour: number;
  city: string;
  area: string;
  address: string;
  images: string[];
  equipment: string[];
  features: string[];
  maxPeople: number;
  rating: number;
  reviewCount: number;
  availability: {
    monday: { open: string; close: string; available: boolean };
    tuesday: { open: string; close: string; available: boolean };
    wednesday: { open: string; close: string; available: boolean };
    thursday: { open: string; close: string; available: boolean };
    friday: { open: string; close: string; available: boolean };
    saturday: { open: string; close: string; available: boolean };
    sunday: { open: string; close: string; available: boolean };
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const RoomSchema = new Schema<IRoom>(
  {
    name: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        'Content Creation Room',
        'Podcast Studio',
        'Interview Studio',
        'Gaming & Streaming Room',
        'Selfie Point Room',
        'Instagram Reel Room',
        'YouTube Creator Studio',
        'Luxury Aesthetic Room',
        'Editing Setup Room',
        'Photography Studio',
        'Cinematic Video Studio',
        'Couple Creator Room',
        'Product Shoot Room',
        'Green Screen Studio',
        'Tech Review Setup',
        'Fashion Shoot Room',
        'Neon RGB Creator Room',
        'Music Recording Room',
        'Live Streaming Studio',
        'Unboxing Creator Room',
        'Startup Pitch Room',
        'Brand Collaboration Room',
        'AI Creator Workspace',
        'Virtual Production Room',
      ],
    },
    pricePerHour: {
      type: Number,
      required: true,
      min: 0,
    },
    city: {
      type: String,
      required: true,
    },
    area: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    images: {
      type: [String],
      default: [],
    },
    equipment: {
      type: [String],
      default: [],
    },
    features: {
      type: [String],
      default: [],
    },
    maxPeople: {
      type: Number,
      default: 2,
    },
    rating: {
      type: Number,
      default: 4.5,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    availability: {
      monday: { open: { type: String, default: '09:00' }, close: { type: String, default: '21:00' }, available: { type: Boolean, default: true } },
      tuesday: { open: { type: String, default: '09:00' }, close: { type: String, default: '21:00' }, available: { type: Boolean, default: true } },
      wednesday: { open: { type: String, default: '09:00' }, close: { type: String, default: '21:00' }, available: { type: Boolean, default: true } },
      thursday: { open: { type: String, default: '09:00' }, close: { type: String, default: '21:00' }, available: { type: Boolean, default: true } },
      friday: { open: { type: String, default: '09:00' }, close: { type: String, default: '21:00' }, available: { type: Boolean, default: true } },
      saturday: { open: { type: String, default: '09:00' }, close: { type: String, default: '22:00' }, available: { type: Boolean, default: true } },
      sunday: { open: { type: String, default: '09:00' }, close: { type: String, default: '22:00' }, available: { type: Boolean, default: true } },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

RoomSchema.index({ city: 1, category: 1 });
RoomSchema.index({ category: 1 });
RoomSchema.index({ pricePerHour: 1 });

const Room = mongoose.models.Room || mongoose.model<IRoom>('Room', RoomSchema);

export default Room;
