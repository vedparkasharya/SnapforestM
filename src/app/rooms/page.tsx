'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Search,
  SlidersHorizontal,
  X,
  MapPin,
  Star,
  ChevronDown,
} from 'lucide-react';
import RoomCard from '@/components/RoomCard';

const categories = [
  'All',
  'Content Creation Room',
  'Podcast Studio',
  'Interview Studio',
  'Gaming & Streaming Room',
  'Selfie Point Room',
  'Instagram Reel Room',
  'YouTube Creator Studio',
  'Luxury Aesthetic Room',
  'Editing Setup Room',
  'Photography Studio',
  'Cinematic Video Studio',
  'Couple Creator Room',
  'Product Shoot Room',
  'Green Screen Studio',
  'Tech Review Setup',
  'Fashion Shoot Room',
  'Neon RGB Creator Room',
  'Music Recording Room',
  'Live Streaming Studio',
  'Unboxing Creator Room',
  'Startup Pitch Room',
  'Brand Collaboration Room',
  'AI Creator Workspace',
  'Virtual Production Room',
];

const sortOptions = [
  { value: 'createdAt:desc', label: 'Newest First' },
  { value: 'createdAt:asc', label: 'Oldest First' },
  { value: 'pricePerHour:asc', label: 'Price: Low to High' },
  { value: 'pricePerHour:desc', label: 'Price: High to Low' },
  { value: 'rating:desc', label: 'Highest Rated' },
];

function RoomsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const [searchCity, setSearchCity] = useState(searchParams.get('city') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [sortBy, setSortBy] = useState('createdAt:desc');

  useEffect(() => {
    fetchRooms();
  }, [searchParams, sortBy]);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      const city = searchParams.get('city');
      const category = searchParams.get('category');
      const minP = searchParams.get('minPrice');
      const maxP = searchParams.get('maxPrice');

      if (city) params.set('city', city);
      if (category && category !== 'All') params.set('category', category);
      if (minP) params.set('minPrice', minP);
      if (maxP) params.set('maxPrice', maxP);

      const [sortField, sortOrder] = sortBy.split(':');
      params.set('sortBy', sortField);
      params.set('sortOrder', sortOrder);

      const res = await fetch(`/api/rooms?${params.toString()}`);
      const data = await res.json();
      if (data.success) setRooms(data.data);
    } catch (error) {
      console.error('Failed to fetch rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    const params = new URLSearchParams();
    if (searchCity) params.set('city', searchCity);
    if (selectedCategory && selectedCategory !== 'All') params.set('category', selectedCategory);
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);
    router.push(`/rooms?${params.toString()}`);
    setShowFilters(false);
  };

  const clearFilters = () => {
    setSearchCity('');
    setSelectedCategory('All');
    setMinPrice('');
    setMaxPrice('');
    router.push('/rooms');
  };

  return (
    <div className="pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">
            Creator <span className="text-gradient">Studios</span>
          </h1>
          <p className="text-gray-400">
            Find and book the perfect creator studio for your content
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex-1 relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search by city (e.g., Patna)"
              value={searchCity}
              onChange={(e) => setSearchCity(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-[#13131f] border border-[#1e1e2e] rounded-xl text-white placeholder-gray-500 focus:border-purple-500 transition-all"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-5 py-3 bg-[#13131f] border border-[#1e1e2e] rounded-xl text-gray-300 hover:text-white hover:border-purple-500/50 transition-all"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {(selectedCategory !== 'All' || minPrice || maxPrice) && (
              <span className="w-2 h-2 bg-purple-500 rounded-full" />
            )}
          </button>
          <button
            onClick={applyFilters}
            className="btn-primary px-6 py-3 rounded-xl text-white font-medium"
          >
            Search
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="glass-card rounded-2xl p-6 mb-6 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">Filters</h3>
              <button
                onClick={clearFilters}
                className="text-sm text-red-400 hover:text-red-300 flex items-center gap-1"
              >
                <X className="w-3 h-3" /> Clear All
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-2 bg-white/5 border border-[#1e1e2e] rounded-xl text-white focus:border-purple-500"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Min Price (Rs./hr)</label>
                <input
                  type="number"
                  placeholder="0"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full px-4 py-2 bg-white/5 border border-[#1e1e2e] rounded-xl text-white placeholder-gray-500 focus:border-purple-500"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Max Price (Rs./hr)</label>
                <input
                  type="number"
                  placeholder="1000"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full px-4 py-2 bg-white/5 border border-[#1e1e2e] rounded-xl text-white placeholder-gray-500 focus:border-purple-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Sort & Results Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-400 text-sm">
            {rooms.length} creator studio{rooms.length !== 1 ? 's' : ''} found
          </p>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 bg-[#13131f] border border-[#1e1e2e] rounded-lg text-sm text-white focus:border-purple-500"
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Rooms Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-[#13131f] rounded-xl h-80 animate-pulse" />
            ))}
          </div>
        ) : rooms.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map((room) => (
              <RoomCard key={room._id} room={room} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-10 h-10 text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No studios found</h3>
            <p className="text-gray-400 mb-4">Try adjusting your filters or search criteria</p>
            <button
              onClick={clearFilters}
              className="btn-primary px-6 py-2 rounded-xl text-white"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function RoomsPage() {
  return (
    <Suspense fallback={<div className="pt-20 pb-16 text-center"><div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto" /></div>}>
      <RoomsContent />
    </Suspense>
  );
}
