"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, MapPin, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const CITIES = ["All Cities", "Patna"];
const CATEGORIES = [
  "All Categories",
  "podcast",
  "youtube",
  "music",
  "photography",
  "dance",
  "coworking",
  "gaming",
  "streaming",
  "meeting",
];
const PRICE_RANGES = [
  "All Prices",
  "Under Rs. 500",
  "Rs. 500 - 1000",
  "Rs. 1000 - 2000",
  "Above Rs. 2000",
];

interface FilterBarProps {
  onFilter: (filters: {
    city: string;
    category: string;
    priceRange: string;
    search: string;
  }) => void;
}

export default function FilterBar({ onFilter }: FilterBarProps) {
  const [city, setCity] = useState("All Cities");
  const [category, setCategory] = useState("All Categories");
  const [priceRange, setPriceRange] = useState("All Prices");
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const handleFilter = () => {
    onFilter({ city, category, priceRange, search });
  };

  const handleReset = () => {
    setCity("All Cities");
    setCategory("All Categories");
    setPriceRange("All Prices");
    setSearch("");
    onFilter({ city: "All Cities", category: "All Categories", priceRange: "All Prices", search: "" });
  };

  const hasActiveFilters =
    city !== "All Cities" ||
    category !== "All Categories" ||
    priceRange !== "All Prices" ||
    search !== "";

  return (
    <div className="space-y-4">
      {/* Search Row */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search studios..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); }}
            onKeyDown={(e) => e.key === "Enter" && handleFilter()}
            className="pl-10 bg-white/5 border-white/10"
          />
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setShowFilters(!showFilters)}
          className={showFilters ? "border-[#1a472a] text-[#c8e6c9]" : ""}
        >
          <SlidersHorizontal className="w-4 h-4" />
        </Button>
        <Button variant="neon" onClick={handleFilter}>
          Search
        </Button>
        {hasActiveFilters && (
          <Button variant="ghost" size="icon" onClick={handleReset}>
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Filter Row */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-3"
        >
          <Select value={city} onValueChange={setCity}>
            <SelectTrigger className="bg-white/5 border-white/10">
              <MapPin className="w-4 h-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="City" />
            </SelectTrigger>
            <SelectContent>
              {CITIES.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="bg-white/5 border-white/10">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat === "All Categories" ? cat : cat.charAt(0).toUpperCase() + cat.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={priceRange} onValueChange={setPriceRange}>
            <SelectTrigger className="bg-white/5 border-white/10">
              <SelectValue placeholder="Price Range" />
            </SelectTrigger>
            <SelectContent>
              {PRICE_RANGES.map((p) => (
                <SelectItem key={p} value={p}>{p}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </motion.div>
      )}
    </div>
  );
}
