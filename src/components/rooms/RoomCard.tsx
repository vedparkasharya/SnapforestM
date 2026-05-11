"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { MapPin, Star, Users, Clock, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";

interface RoomCardProps {
  room: {
    _id: string;
    name: string;
    slug: string;
    city: string;
    category: string;
    images: string[];
    pricePerHour: number;
    rating: number;
    reviews: number;
    capacity: number;
    isAvailable: boolean;
  };
  index?: number;
}

const categoryLabels: Record<string, string> = {
  podcast: "Podcast",
  youtube: "YouTube",
  music: "Music",
  photography: "Photo",
  dance: "Dance",
  coworking: "Coworking",
  gaming: "Gaming",
  streaming: "Streaming",
  meeting: "Meeting",
};

export default function RoomCard({ room, index = 0 }: RoomCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <Link href={`/rooms/${room.slug}`}>
        <div className="group glass-card overflow-hidden hover:border-neon-cyan/30 transition-all duration-300 hover:shadow-lg hover:shadow-neon-cyan/5 cursor-pointer">
          {/* Image */}
          <div className="relative aspect-[16/10] overflow-hidden">
            <Image
              src={room.images[0] || "/rooms/photo-studio.jpg"}
              alt={room.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute top-3 left-3 flex gap-2">
              <Badge variant="neon" className="text-xs">
                {categoryLabels[room.category] || room.category}
              </Badge>
              {room.isAvailable ? (
                <Badge variant="success" className="text-xs">Available</Badge>
              ) : (
                <Badge variant="destructive" className="text-xs">Booked</Badge>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-lg group-hover:text-neon-cyan transition-colors">
                  {room.name}
                </h3>
                <div className="flex items-center gap-1 text-muted-foreground text-sm mt-1">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{room.city}</span>
                </div>
              </div>
              <div className="flex items-center gap-1 text-sm">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <span className="font-medium">{room.rating}</span>
                <span className="text-muted-foreground">({room.reviews})</span>
              </div>
            </div>

            <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>Up to {room.capacity}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>Hourly/Daily</span>
              </div>
            </div>

            <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5">
              <div>
                <span className="text-xl font-bold text-neon-cyan">
                  {formatPrice(room.pricePerHour)}
                </span>
                <span className="text-muted-foreground text-sm">/hour</span>
              </div>
              <Button variant="ghost" size="sm" className="text-neon-cyan group-hover:translate-x-1 transition-transform">
                View
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
