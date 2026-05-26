"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { MapPin, Star, Users, Clock, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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

const categoryGradients: Record<string, string> = {
  podcast: "from-emerald-400 to-teal-500",
  youtube: "from-red-500 to-pink-500",
  music: "from-purple-500 to-violet-500",
  photography: "from-amber-500 to-orange-500",
  dance: "from-pink-500 to-rose-500",
  coworking: "from-emerald-500 to-teal-500",
  gaming: "from-green-500 to-emerald-500",
  streaming: "from-indigo-500 to-purple-500",
  meeting: "from-blue-500 to-indigo-500",
};

export default function RoomCard({ room, index = 0 }: RoomCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        duration: 0.5,
        delay: index * 0.1,
        ease: [0.16, 1, 0.3, 1],
      }}
      className="h-full"
    >
      <Link href={`/rooms/${room.slug}`} className="block h-full">
        <article className="group relative h-full bg-[#1a1a1a] rounded-2xl overflow-hidden cursor-pointer transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_24px_64px_rgba(0,0,0,0.4)] border border-white/[0.04] hover:border-white/[0.08]">
          {/* Image Container - Full Frame Edge-to-Edge */}
          <div className="relative w-full aspect-[4/3] overflow-hidden">
            {/* Full-bleed background image using div background for perfect coverage */}
            <div className="absolute inset-0 w-full h-full">
              <Image
                src={room.images[0] || "/rooms/photo-studio.jpg"}
                alt={room.name}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                priority={index < 3}
              />
            </div>
            
            {/* Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] via-[#1a1a1a]/20 to-transparent z-[1]" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent z-[1]" />
            
            {/* Tech Grid Overlay */}
            <div 
              className="absolute inset-0 z-[2] opacity-[0.03]"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
                `,
                backgroundSize: '20px 20px',
              }}
            />

            {/* Corner Accent - Tech Style */}
            <div className="absolute top-0 left-0 w-8 h-8 z-[3]">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-white/30 to-transparent" />
              <div className="absolute top-0 left-0 h-full w-[1px] bg-gradient-to-b from-white/30 to-transparent" />
            </div>
            <div className="absolute top-0 right-0 w-8 h-8 z-[3]">
              <div className="absolute top-0 right-0 w-full h-[1px] bg-gradient-to-l from-white/30 to-transparent" />
              <div className="absolute top-0 right-0 h-full w-[1px] bg-gradient-to-b from-white/30 to-transparent" />
            </div>

            {/* Badges */}
            <div className="absolute top-3 left-3 z-[4] flex flex-wrap gap-2">
              <Badge
                variant="neon"
                className={`text-[10px] font-semibold uppercase tracking-widest bg-gradient-to-r ${
                  categoryGradients[room.category] || "from-[#1a472a] to-[#236b3a]"
                } text-white border-0 shadow-lg backdrop-blur-sm`}
              >
                {categoryLabels[room.category] || room.category}
              </Badge>
              {room.isAvailable ? (
                <Badge className="text-[10px] font-medium bg-green-500/20 text-green-300 border border-green-500/30 backdrop-blur-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 mr-1.5 animate-pulse" />
                  Available
                </Badge>
              ) : (
                <Badge className="text-[10px] font-medium bg-red-500/20 text-red-300 border border-red-500/30 backdrop-blur-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 mr-1.5" />
                  Booked
                </Badge>
              )}
            </div>

            {/* Rating Badge - Top Right */}
            <div className="absolute top-3 right-3 z-[4] flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-black/50 backdrop-blur-md border border-white/10">
              <Star className="w-3.5 h-3.5 text-[#f9a825] fill-[#f9a825]" />
              <span className="text-xs font-semibold text-white">{room.rating}</span>
            </div>
          </div>

          {/* Content */}
          <div className="relative p-5 z-[2]">
            {/* Title */}
            <h3
              className="font-semibold text-lg text-white group-hover:text-[#c8e6c9] transition-colors duration-300 truncate"
              style={{ fontFamily: "var(--font-primary)" }}
            >
              {room.name}
            </h3>

            {/* Location & Meta */}
            <div className="flex flex-wrap items-center gap-3 mt-2">
              <div className="flex items-center gap-1 text-[#888888] text-xs">
                <MapPin className="w-3 h-3" />
                <span>{room.city}</span>
              </div>
              <div className="flex items-center gap-1 text-[#888888] text-xs">
                <Users className="w-3 h-3" />
                <span>Up to {room.capacity}</span>
              </div>
              <div className="flex items-center gap-1 text-[#888888] text-xs">
                <Clock className="w-3 h-3" />
                <span>Hourly/Daily</span>
              </div>
            </div>

            {/* Divider */}
            <div className="mt-4 mb-4 h-px bg-gradient-to-r from-white/10 via-white/5 to-transparent" />

            {/* Price & CTA */}
            <div className="flex items-center justify-between">
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-light text-[#f9a825] tracking-tight">
                  {formatPrice(room.pricePerHour)}
                </span>
                <span className="text-[#666666] text-xs">/hour</span>
              </div>
              <span className="text-xs font-medium text-[#c8e6c9] flex items-center gap-1.5 group-hover:translate-x-1 transition-transform duration-300 bg-[#1a472a]/20 px-3 py-1.5 rounded-full border border-[#1a472a]/30 group-hover:bg-[#1a472a]/30 group-hover:border-[#1a472a]/50">
                View Details
                <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
              </span>
            </div>
          </div>

          {/* Hover Glow Effect */}
          <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{
            background: 'radial-gradient(ellipse at 50% 0%, rgba(26,71,42,0.15) 0%, transparent 70%)',
          }} />
        </article>
      </Link>
    </motion.div>
  );
}
