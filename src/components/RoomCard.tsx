'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  MapPin,
  Star,
  Clock,
  Users,
  Wifi,
  Wind,
} from 'lucide-react';

interface RoomCardProps {
  room: {
    _id: string;
    name: string;
    slug: string;
    category: string;
    pricePerHour: number;
    city: string;
    area: string;
    images: string[];
    equipment: string[];
    maxPeople: number;
    rating: number;
    reviewCount: number;
  };
}

export default function RoomCard({ room }: RoomCardProps) {
  const imageUrl = room.images?.[0] || '/placeholder.jpg';

  return (
    <Link href={`/rooms/${room._id}`}>
      <div className="room-card rounded-xl overflow-hidden bg-[#13131f] h-full flex flex-col">
        {/* Image */}
        <div className="relative h-48 overflow-hidden">
          <img
            src={imageUrl}
            alt={room.name}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
          />
          <div className="absolute top-3 left-3">
            <span className="category-badge text-xs font-medium px-3 py-1 rounded-full">
              {room.category}
            </span>
          </div>
          <div className="absolute top-3 right-3">
            <div className="flex items-center gap-1 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-full">
              <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
              <span className="text-xs text-white font-medium">{room.rating}</span>
            </div>
          </div>
          <div className="absolute bottom-3 right-3">
            <span className="price-tag text-sm px-3 py-1 rounded-full">
              Rs. {room.pricePerHour}/hr
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 flex-1 flex flex-col">
          <h3 className="text-white font-semibold text-lg mb-1 line-clamp-1">
            {room.name}
          </h3>
          <div className="flex items-center gap-1 text-gray-400 text-sm mb-3">
            <MapPin className="w-3.5 h-3.5 text-purple-400" />
            <span>{room.area}, {room.city}</span>
          </div>

          {/* Equipment */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {room.equipment?.slice(0, 3).map((eq) => (
              <span
                key={eq}
                className="text-xs bg-white/5 text-gray-300 px-2 py-0.5 rounded-md border border-white/5"
              >
                {eq}
              </span>
            ))}
            {room.equipment?.length > 3 && (
              <span className="text-xs text-purple-400 px-1">
                +{room.equipment.length - 3}
              </span>
            )}
          </div>

          {/* Footer */}
          <div className="mt-auto flex items-center justify-between text-sm text-gray-400">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                <span>{room.maxPeople}</span>
              </div>
              <div className="flex items-center gap-1">
                <Wifi className="w-3.5 h-3.5" />
                <span>WiFi</span>
              </div>
            </div>
            <span className="text-xs text-gray-500">{room.reviewCount} reviews</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
