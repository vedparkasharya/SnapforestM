"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import RoomCard from "./RoomCard";
import FilterBar from "./FilterBar";
import { Skeleton } from "@/components/ui/skeleton";

interface Room {
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
}

export default function RoomList() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    city: "All Cities",
    category: "All Categories",
    priceRange: "All Prices",
    search: "",
  });

  const fetchRooms = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.city !== "All Cities") params.append("city", filters.city);
      if (filters.category !== "All Categories")
        params.append("category", filters.category);
      if (filters.search) params.append("search", filters.search);
      if (filters.priceRange !== "All Prices") {
        const [min, max] = filters.priceRange.includes("Under")
          ? ["0", "500"]
          : filters.priceRange.includes("Above")
          ? ["2000", "100000"]
          : filters.priceRange.match(/\d+/g) || ["0", "100000"];
        if (min) params.append("minPrice", min);
        if (max) params.append("maxPrice", max);
      }

      const res = await fetch(`/api/rooms?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setRooms(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch rooms:", error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  return (
    <section className="relative bg-[#0f0f0f] section-padding overflow-hidden" id="studios">
      {/* Background Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />
      
      {/* Subtle Radial Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#1a472a]/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full bg-[#1a472a]/10 border border-[#1a472a]/20">
            <span className="w-2 h-2 rounded-full bg-[#1a472a] animate-pulse" />
            <p className="sf-label-forest text-[11px] tracking-[0.15em]">OUR STUDIOS</p>
          </div>
          <h2
            className="text-heading-lg text-white mb-4"
            style={{ fontFamily: "var(--font-primary)" }}
          >
            Spaces Built for Creators
          </h2>
          <p className="text-[#888888] max-w-lg mx-auto text-base leading-relaxed">
            Browse and book premium creator spaces in Patna — designed for professionals, priced for everyone.
          </p>
        </motion.div>

        <FilterBar onFilter={setFilters} />

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7 mt-10">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden bg-[#1a1a1a] border border-white/[0.04]">
                <Skeleton className="aspect-video bg-[#252525]" />
                <div className="p-5 space-y-3">
                  <Skeleton className="h-5 w-3/4 bg-[#252525]" />
                  <Skeleton className="h-4 w-1/2 bg-[#252525]" />
                  <Skeleton className="h-4 w-1/3 bg-[#252525]" />
                </div>
              </div>
            ))}
          </div>
        ) : rooms.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-[#888888] text-lg">
              No studios found matching your criteria.
            </p>
            <p className="text-sm text-[#888888] mt-2">
              Try adjusting your filters.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7 mt-10">
            {rooms.map((room, i) => (
              <RoomCard key={room._id} room={room} index={i} />
            ))}
          </div>
        )}

        {/* Bottom Stats Bar */}
        {!loading && rooms.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mt-16 flex flex-wrap items-center justify-center gap-8 py-6 px-8 rounded-2xl bg-[#1a1a1a]/50 border border-white/[0.04] backdrop-blur-sm"
          >
            <div className="text-center">
              <p className="text-2xl font-light text-white">{rooms.length}+</p>
              <p className="text-xs text-[#888888] mt-0.5">Studios</p>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="text-center">
              <p className="text-2xl font-light text-white">4.8</p>
              <p className="text-xs text-[#888888] mt-0.5">Avg Rating</p>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="text-center">
              <p className="text-2xl font-light text-white">1000+</p>
              <p className="text-xs text-[#888888] mt-0.5">Bookings</p>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="text-center">
              <p className="text-2xl font-light text-white">24/7</p>
              <p className="text-xs text-[#888888] mt-0.5">Support</p>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
