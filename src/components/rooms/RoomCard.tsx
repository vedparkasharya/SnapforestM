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

export default function RoomCard({ room, index = 0 }: RoomCardProps) {
  const hasReviews = room.reviews > 0 && room.rating > 0;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.45, delay: index * 0.07, ease: [0.16, 1, 0.3, 1] }} className="h-full">
      <Link href={`/rooms/${room.slug}`} className="group block h-full focus-visible:outline-none">
        <article className="relative h-full overflow-hidden rounded-2xl border border-white/[0.07] bg-[#171717] transition-transform duration-300 group-hover:-translate-y-1 group-hover:border-white/[0.12] group-focus-visible:-translate-y-1 group-focus-visible:ring-2 group-focus-visible:ring-[#c8e6c9]">
          <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#222]">
            <Image src={room.images[0] || "/rooms/photo-studio.jpg"} alt={room.name} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]" priority={index < 3} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />

            <div className="absolute left-3 top-3 flex flex-wrap gap-2">
              <Badge className="border border-white/10 bg-black/45 text-[10px] font-medium text-white backdrop-blur-md">{categoryLabels[room.category] || room.category}</Badge>
              {room.isAvailable && <Badge className="border border-emerald-300/20 bg-black/45 text-[10px] font-medium text-emerald-200 backdrop-blur-md">Available</Badge>}
            </div>

            <div className="absolute right-3 top-3 rounded-lg border border-white/10 bg-black/45 px-2.5 py-1.5 backdrop-blur-md">
              {hasReviews ? (
                <span className="flex items-center gap-1 text-xs font-medium text-white"><Star className="h-3.5 w-3.5 fill-[#f9a825] text-[#f9a825]" /> {room.rating.toFixed(1)} <span className="text-white/45">({room.reviews})</span></span>
              ) : <span className="text-[10px] font-medium text-white/60">New listing</span>}
            </div>
          </div>

          <div className="p-5">
            <h3 className="truncate text-lg font-semibold text-white" style={{ fontFamily: "var(--font-primary)" }}>{room.name}</h3>
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-white/45">
              <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{room.city}</span>
              <span className="flex items-center gap-1"><Users className="h-3 w-3" />Up to {room.capacity}</span>
              <span className="flex items-center gap-1"><Clock className="h-3 w-3" />Hourly / daily</span>
            </div>
            <div className="my-4 h-px bg-white/[0.07]" />
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.14em] text-white/35">From</p>
                <p className="mt-0.5 text-xl font-medium text-[#f9a825]">{formatPrice(room.pricePerHour)} <span className="text-xs font-normal text-white/35">/hour</span></p>
              </div>
              <span className="flex items-center gap-1.5 text-xs font-medium text-[#c8e6c9]">View details <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" /></span>
            </div>
          </div>
        </article>
      </Link>
    </motion.div>
  );
}
