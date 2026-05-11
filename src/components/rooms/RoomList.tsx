"use client";

import { useState, useEffect, useCallback } from "react";
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
      if (filters.category !== "All Categories") params.append("category", filters.category);
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
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold mb-2">
          Available <span className="text-neon-cyan">Studios</span>
        </h2>
        <p className="text-muted-foreground">
          Browse and book premium creator spaces in Patna
        </p>
      </div>

      <FilterBar onFilter={setFilters} />

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl overflow-hidden">
              <Skeleton className="aspect-[16/10]" />
              <div className="p-4 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : rooms.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-muted-foreground text-lg">No studios found matching your criteria.</p>
          <p className="text-sm text-muted-foreground mt-2">Try adjusting your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {rooms.map((room, i) => (
            <RoomCard key={room._id} room={room} index={i} />
          ))}
        </div>
      )}
    </section>
  );
}
