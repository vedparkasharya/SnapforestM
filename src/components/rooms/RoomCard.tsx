"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowUpRight, MapPin, Star, Users } from "lucide-react";
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
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.55, delay: index * 0.055, ease: [0.16, 1, 0.3, 1] }}
      className="h-full"
    >
      <Link href={`/rooms/${room.slug}`} className="group block h-full focus-visible:outline-none">
        <div className="relative h-full overflow-hidden rounded-[1.5rem] border border-white/[0.08] bg-[#151817] shadow-[0_16px_50px_rgba(0,0,0,0.16)] transition-all duration-500 group-hover:-translate-y-1.5 group-hover:border-white/[0.14] group-hover:shadow-[0_28px_70px_rgba(0,0,0,0.28)] group-focus-visible:ring-2 group-focus-visible:ring-[#b9f5ca]">
          <div className="relative aspect-[1.12/1] overflow-hidden bg-[#202321]">
            <Image src={room.images[0] || "/rooms/photo-studio.jpg"} alt={room.name} fill sizes="(max-width:640px) 92vw, (max-width:1024px) 45vw, 31vw" className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.055]" priority={index < 3} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/5 to-transparent" />
            <div className="absolute left-4 right-4 top-4 flex items-center justify-between gap-2">
              <Badge className="rounded-full border border-white/15 bg-black/30 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/85 backdrop-blur-xl">{categoryLabels[room.category] || room.category}</Badge>
              <div className="flex items-center gap-2">
                {room.isAvailable && <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/30 px-2.5 py-1 text-[10px] font-medium text-[#d9f7e2] backdrop-blur-xl"><span className="h-1.5 w-1.5 rounded-full bg-[#9af3b2]" />Available</span>}
                {hasReviews && <span className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-black/30 px-2.5 py-1 text-[10px] font-medium text-white/85 backdrop-blur-xl"><Star className="h-3 w-3 fill-current" />{room.rating.toFixed(1)}</span>}
              </div>
            </div>
            <div className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-4">
              <div className="min-w-0">
                <h3 className="truncate text-2xl leading-none text-white" style={{ fontFamily: "var(--font-primary)" }}>{room.name}</h3>
                <div className="mt-2 flex items-center gap-1.5 text-xs text-white/60"><MapPin className="h-3.5 w-3.5" />{room.city}</div>
              </div>
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-white/15 bg-black/25 text-white backdrop-blur-xl transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"><ArrowUpRight className="h-4.5 w-4.5" /></span>
            </div>
          </div>

          <div className="p-5 sm:p-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-white/45"><Users className="h-3.5 w-3.5" /> Up to {room.capacity} people</div>
              {hasReviews ? <span className="text-xs text-white/35">{room.reviews} reviews</span> : <span className="text-xs text-white/35">New listing</span>}
            </div>
            <div className="mt-5 flex items-end justify-between gap-4 border-t border-white/[0.07] pt-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.15em] text-white/30">Starting at</p>
                <p className="mt-1 text-xl font-semibold tracking-[-0.02em] text-[#d9f7e2]">{formatPrice(room.pricePerHour)} <span className="text-xs font-normal text-white/35">/ hr</span></p>
              </div>
              <span className="text-xs font-medium text-white/55 transition-colors group-hover:text-white">View space →</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
