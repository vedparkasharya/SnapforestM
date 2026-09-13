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
  podcast: "Podcast", youtube: "YouTube", music: "Music", photography: "Photo", dance: "Dance", coworking: "Coworking", gaming: "Gaming", streaming: "Streaming", meeting: "Meeting",
};

const categoryGradients: Record<string, string> = {
  podcast: "from-emerald-400 to-teal-500", youtube: "from-red-500 to-pink-500", music: "from-purple-500 to-violet-500", photography: "from-amber-500 to-orange-500", dance: "from-pink-500 to-rose-500", coworking: "from-emerald-500 to-teal-500", gaming: "from-green-500 to-emerald-500", streaming: "from-indigo-500 to-purple-500", meeting: "from-blue-500 to-indigo-500",
};

export default function RoomCard({ room, index = 0 }: RoomCardProps) {
  const hasReviews = room.reviews > 0 && room.rating > 0;

  return (
    <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.5, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }} className="h-full">
      <Link href={`/rooms/${room.slug}`} className="block h-full">
        <article className="group relative h-full cursor-pointer overflow-hidden rounded-2xl border border-white/[0.04] bg-[#1a1a1a] transition-all duration-500 hover:-translate-y-2 hover:border-white/[0.08] hover:shadow-[0_24px_64px_rgba(0,0,0,0.4)]">
          <div className="relative aspect-[4/3] w-full overflow-hidden">
            <Image src={room.images[0] || "/rooms/photo-studio.jpg"} alt={room.name} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover transition-transform duration-700 ease-out group-hover:scale-110" priority={index < 3} />
            <div className="absolute inset-0 z-[1] bg-gradient-to-t from-[#1a1a1a] via-[#1a1a1a]/20 to-transparent" />
            <div className="absolute inset-0 z-[1] bg-gradient-to-r from-black/20 to-transparent" />
            <div className="absolute inset-0 z-[2] opacity-[0.03]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)", backgroundSize: "20px 20px" }} />

            <div className="absolute left-3 top-3 z-[4] flex flex-wrap gap-2">
              <Badge variant="neon" className={`border-0 bg-gradient-to-r ${categoryGradients[room.category] || "from-[#1a472a] to-[#236b3a]"} text-[10px] font-semibold uppercase tracking-widest text-white shadow-lg backdrop-blur-sm`}>{categoryLabels[room.category] || room.category}</Badge>
              {room.isAvailable ? <Badge className="border border-green-500/30 bg-green-500/20 text-[10px] font-medium text-green-300 backdrop-blur-sm"><span className="mr-1.5 h-1.5 w-1.5 animate-pulse rounded-full bg-green-400" />Available</Badge> : <Badge className="border border-red-500/30 bg-red-500/20 text-[10px] font-medium text-red-300 backdrop-blur-sm">Currently unavailable</Badge>}
            </div>

            <div className="absolute right-3 top-3 z-[4] flex items-center gap-1 rounded-lg border border-white/10 bg-black/50 px-2.5 py-1.5 backdrop-blur-md">
              {hasReviews ? <><Star className="h-3.5 w-3.5 fill-[#f9a825] text-[#f9a825]" /><span className="text-xs font-semibold text-white">{room.rating.toFixed(1)}</span><span className="text-[10px] text-white/50">({room.reviews})</span></> : <span className="text-[10px] font-medium text-white/60">New</span>}
            </div>
          </div>

          <div className="relative z-[2] p-5">
            <h3 className="truncate text-lg font-semibold text-white transition-colors duration-300 group-hover:text-[#c8e6c9]" style={{ fontFamily: "var(--font-primary)" }}>{room.name}</h3>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1 text-xs text-[#888888]"><MapPin className="h-3 w-3" /><span>{room.city}</span></div>
              <div className="flex items-center gap-1 text-xs text-[#888888]"><Users className="h-3 w-3" /><span>Up to {room.capacity}</span></div>
              <div className="flex items-center gap-1 text-xs text-[#888888]"><Clock className="h-3 w-3" /><span>Hourly / daily</span></div>
            </div>
            <div className="mb-4 mt-4 h-px bg-gradient-to-r from-white/10 via-white/5 to-transparent" />
            <div className="flex items-center justify-between">
              <div className="flex items-baseline gap-1"><span className="text-2xl font-light tracking-tight text-[#f9a825]">{formatPrice(room.pricePerHour)}</span><span className="text-xs text-[#666666]">/hour</span></div>
              <span className="flex items-center gap-1.5 rounded-full border border-[#1a472a]/30 bg-[#1a472a]/20 px-3 py-1.5 text-xs font-medium text-[#c8e6c9] transition-transform duration-300 group-hover:translate-x-1">View details<ArrowRight className="h-3.5 w-3.5" /></span>
            </div>
          </div>
        </article>
      </Link>
    </motion.div>
  );
}
