"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import RoomCard from "./RoomCard";
import FilterBar from "./FilterBar";
import { Skeleton } from "@/components/ui/skeleton";
import { SearchX } from "lucide-react";

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
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    city: "All Cities",
    category: "All Categories",
    priceRange: "All Prices",
    search: "",
  });

  const fetchRooms = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (filters.city !== "All Cities") params.append("city", filters.city);
      if (filters.category !== "All Categories") params.append("category", filters.category);
      if (filters.search) params.append("search", filters.search);
      if (filters.priceRange !== "All Prices") {
        const [min, max] = filters.priceRange.includes("Under")
          ? ["0", "500"]
          : filters.priceRange.includes("Above")
            ? ["2000", "100000"]
            : filters.priceRange.match(/\d+/g) || ["0", "100000"];
        params.append("minPrice", min);
        params.append("maxPrice", max);
      }

      const res = await fetch(`/api/rooms?${params.toString()}`, {
        signal,
        headers: { Accept: "application/json" },
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "We could not load the studios right now.");
      }

      setRooms(Array.isArray(data.data) ? data.data : []);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      console.error("Failed to fetch rooms:", err);
      setRooms([]);
      setError("We could not load the studios right now. Please try again.");
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const controller = new AbortController();
    fetchRooms(controller.signal);
    return () => controller.abort();
  }, [fetchRooms]);

  return (
    <section className="relative overflow-hidden bg-[#0f0f0f] section-padding" id="studios">
      <div className="pointer-events-none absolute inset-0 opacity-[0.025] [background-image:linear-gradient(rgba(255,255,255,0.28)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.28)_1px,transparent_1px)] [background-size:60px_60px]" />
      <div className="pointer-events-none absolute left-1/2 top-0 h-[360px] w-[720px] -translate-x-1/2 rounded-full bg-[#1a472a]/5 blur-[140px]" />

      <div className="relative mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mb-12 text-center"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#1a472a]/20 bg-[#1a472a]/10 px-4 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#c8e6c9]" aria-hidden="true" />
            <p className="sf-label-forest text-[11px] tracking-[0.15em]">AVAILABLE SPACES</p>
          </div>
          <h2 className="mb-4 text-heading-lg text-white" style={{ fontFamily: "var(--font-primary)" }}>
            Spaces built for creators.
          </h2>
          <p className="mx-auto max-w-xl text-base leading-relaxed text-[#888888]">
            Browse rooms in Patna, compare the details and choose the setup that fits your session.
          </p>
        </motion.div>

        <FilterBar onFilter={setFilters} />

        {loading ? (
          <div className="mt-10 grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true" aria-label="Loading studios">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="overflow-hidden rounded-2xl border border-white/[0.04] bg-[#1a1a1a]">
                <Skeleton className="aspect-video bg-[#252525]" />
                <div className="space-y-3 p-5">
                  <Skeleton className="h-5 w-3/4 bg-[#252525]" />
                  <Skeleton className="h-4 w-1/2 bg-[#252525]" />
                  <Skeleton className="h-4 w-1/3 bg-[#252525]" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="mx-auto mt-10 max-w-lg rounded-2xl border border-white/[0.08] bg-[#181818] px-6 py-12 text-center">
            <p className="text-base font-medium text-white">Something went wrong.</p>
            <p className="mt-2 text-sm leading-6 text-white/50">{error}</p>
            <button
              type="button"
              onClick={() => fetchRooms()}
              className="mt-6 inline-flex min-h-10 items-center justify-center rounded-full border border-white/15 px-5 text-sm font-medium text-white transition-colors hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c8e6c9]"
            >
              Try again
            </button>
          </div>
        ) : rooms.length === 0 ? (
          <div className="mx-auto mt-10 max-w-lg rounded-2xl border border-white/[0.06] bg-[#181818] px-6 py-14 text-center">
            <SearchX className="mx-auto h-7 w-7 text-white/30" aria-hidden="true" />
            <p className="mt-4 text-base font-medium text-white">No studios match those filters.</p>
            <p className="mt-2 text-sm leading-6 text-white/45">Try a different category, price range or search term.</p>
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {rooms.map((room, i) => (
              <RoomCard key={room._id} room={room} index={i} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
