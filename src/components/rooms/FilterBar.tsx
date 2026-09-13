"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, SlidersHorizontal, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const CITIES = ["All Cities", "Patna"];
const CATEGORIES = ["All Categories", "podcast", "youtube", "music", "photography", "dance", "coworking", "gaming", "streaming", "meeting"];
const PRICE_RANGES = ["All Prices", "Under Rs. 500", "Rs. 500 - 1000", "Rs. 1000 - 2000", "Above Rs. 2000"];

interface FilterBarProps {
  onFilter: (filters: { city: string; category: string; priceRange: string; search: string }) => void;
}

export default function FilterBar({ onFilter }: FilterBarProps) {
  const [city, setCity] = useState("All Cities");
  const [category, setCategory] = useState("All Categories");
  const [priceRange, setPriceRange] = useState("All Prices");
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const handleFilter = () => onFilter({ city, category, priceRange, search });
  const handleReset = () => { setCity("All Cities"); setCategory("All Categories"); setPriceRange("All Prices"); setSearch(""); onFilter({ city: "All Cities", category: "All Categories", priceRange: "All Prices", search: "" }); };
  const hasActiveFilters = city !== "All Cities" || category !== "All Categories" || priceRange !== "All Prices" || search !== "";

  return (
    <div className="relative z-20 rounded-[1.5rem] border border-white/[0.09] bg-[#151817]/85 p-2 shadow-2xl backdrop-blur-2xl">
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
          <Input placeholder="Search a studio, setup or session..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleFilter()} className="h-12 rounded-xl border-0 bg-white/[0.04] pl-11 text-sm text-white placeholder:text-white/30 shadow-none focus-visible:ring-1 focus-visible:ring-[#b9f5ca]" />
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={() => setShowFilters((value) => !value)} className={`h-12 rounded-xl border-white/10 bg-white/[0.04] px-4 text-white/65 hover:bg-white/[0.08] hover:text-white ${showFilters ? "border-[#b9f5ca]/30 text-[#b9f5ca]" : ""}`}>
            <SlidersHorizontal className="mr-2 h-4 w-4" /> Filters
          </Button>
          <Button type="button" variant="neon" onClick={handleFilter} className="h-12 rounded-xl px-5">Search <ArrowRight className="ml-2 h-4 w-4" /></Button>
          {hasActiveFilters && <Button type="button" variant="ghost" size="icon" onClick={handleReset} aria-label="Reset filters" className="h-12 w-12 rounded-xl text-white/45 hover:bg-white/[0.06] hover:text-white"><X className="h-4 w-4" /></Button>}
        </div>
      </div>

      <AnimatePresence initial={false}>
        {showFilters && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="grid grid-cols-1 gap-2 border-t border-white/[0.08] px-1 pb-1 pt-2 sm:grid-cols-3">
              <Select value={city} onValueChange={setCity}><SelectTrigger className="h-11 rounded-xl border-white/[0.08] bg-white/[0.03] text-white/60"><MapPin className="mr-2 h-4 w-4 text-white/25" /><SelectValue placeholder="City" /></SelectTrigger><SelectContent>{CITIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select>
              <Select value={category} onValueChange={setCategory}><SelectTrigger className="h-11 rounded-xl border-white/[0.08] bg-white/[0.03] text-white/60"><SelectValue placeholder="Category" /></SelectTrigger><SelectContent>{CATEGORIES.map((cat) => <SelectItem key={cat} value={cat}>{cat === "All Categories" ? cat : cat.charAt(0).toUpperCase() + cat.slice(1)}</SelectItem>)}</SelectContent></Select>
              <Select value={priceRange} onValueChange={setPriceRange}><SelectTrigger className="h-11 rounded-xl border-white/[0.08] bg-white/[0.03] text-white/60"><SelectValue placeholder="Price Range" /></SelectTrigger><SelectContent>{PRICE_RANGES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent></Select>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
