'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Camera,
  Mic,
  Gamepad2,
  Play,
  Sparkles,
  Palette,
  Monitor,
  Clapperboard,
  Heart,
  Package,
  MonitorPlay,
  Music,
  Radio,
  Wrench,
  ShoppingBag,
  Star,
  Users,
  Clock,
  CheckCircle,
  ArrowRight,
  Search,
  Zap,
  Shield,
  Headphones,
} from 'lucide-react';
import RoomCard from '@/components/RoomCard';

const categories = [
  { name: 'Content Creation Room', icon: Camera },
  { name: 'Podcast Studio', icon: Mic },
  { name: 'Gaming & Streaming Room', icon: Gamepad2 },
  { name: 'YouTube Creator Studio', icon: Play },
  { name: 'Instagram Reel Room', icon: Sparkles },
  { name: 'Luxury Aesthetic Room', icon: Palette },
  { name: 'Neon RGB Creator Room', icon: Monitor },
  { name: 'Photography Studio', icon: Camera },
  { name: 'Cinematic Video Studio', icon: Clapperboard },
  { name: 'Couple Creator Room', icon: Heart },
  { name: 'Product Shoot Room', icon: Package },
  { name: 'Green Screen Studio', icon: MonitorPlay },
  { name: 'Music Recording Room', icon: Music },
  { name: 'Live Streaming Studio', icon: Radio },
  { name: 'Tech Review Setup', icon: Wrench },
  { name: 'Fashion Shoot Room', icon: ShoppingBag },
];

const howItWorks = [
  {
    step: '01',
    title: 'Choose a Studio',
    description: 'Browse 100+ creator studios across Patna. Filter by category, price, or location.',
    icon: Search,
  },
  {
    step: '02',
    title: 'Pick Your Slot',
    description: 'Select your date and time. Our system checks availability in real-time.',
    icon: Clock,
  },
  {
    step: '03',
    title: 'Pay & Confirm',
    description: 'Secure payment via Razorpay. Instant confirmation with booking details.',
    icon: CheckCircle,
  },
  {
    step: '04',
    title: 'Create Content',
    description: 'Arrive at your studio and start creating. All equipment ready to use.',
    icon: Zap,
  },
];

const stats = [
  { value: '100+', label: 'Creator Studios', icon: Camera },
  { value: '10K+', label: 'Bookings', icon: CheckCircle },
  { value: '50+', label: 'Creator Categories', icon: Star },
  { value: '15K+', label: 'Happy Creators', icon: Users },
];

export default function Home() {
  const router = useRouter();
  const [rooms, setRooms] = useState<any[]>([]);
  const [searchCity, setSearchCity] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    fetch('/api/rooms?limit=6')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setRooms(data.data.slice(0, 6));
      })
      .catch(console.error);
  }, []);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchCity) params.set('city', searchCity);
    if (selectedCategory) params.set('category', selectedCategory);
    router.push(`/rooms?${params.toString()}`);
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        {/* Background */}
        <div className="absolute inset-0 bg-[#0a0a0f]">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(139,92,246,0.15),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(236,72,153,0.1),transparent_50%)]" />
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/5 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-medium mb-6 animate-fade-in">
            <Zap className="w-4 h-4" />
            India&apos;s First Creator Studio Booking Platform
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Book Your Perfect{' '}
            <span className="text-gradient">Creator Studio</span>
            <br />
            in Minutes
          </h1>

          <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-10">
            Professional studios for YouTubers, podcasters, gamers, streamers, and content creators.
            All equipment included. Hourly booking.
          </p>

          {/* Search Bar */}
          <div className="max-w-3xl mx-auto glass-card rounded-2xl p-4 mb-12">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search city (e.g., Patna)"
                  value={searchCity}
                  onChange={(e) => setSearchCity(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-[#1e1e2e] rounded-xl text-white placeholder-gray-500 focus:border-purple-500 transition-all"
                />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 bg-white/5 border border-[#1e1e2e] rounded-xl text-white focus:border-purple-500 transition-all appearance-none cursor-pointer"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.name} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <button
                onClick={handleSearch}
                className="btn-primary px-8 py-3 rounded-xl text-white font-medium flex items-center justify-center gap-2"
              >
                <Search className="w-5 h-5" />
                Search
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center p-4">
                <div className="text-2xl sm:text-3xl font-bold text-gradient mb-1">{stat.value}</div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Explore <span className="text-gradient">Creator Categories</span>
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              From podcast studios to gaming rooms, find the perfect space for your content.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.name}
                href={`/rooms?category=${encodeURIComponent(cat.name)}`}
                className="group flex items-center gap-3 p-4 rounded-xl bg-[#13131f] border border-[#1e1e2e] hover:border-purple-500/50 transition-all hover:-translate-y-1"
              >
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0 group-hover:bg-purple-500/20 transition-all">
                  <cat.icon className="w-5 h-5 text-purple-400" />
                </div>
                <span className="text-sm text-gray-300 group-hover:text-white transition-all">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Studios */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.05),transparent_60%)]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-2">
                Featured <span className="text-gradient">Studios in Patna</span>
              </h2>
              <p className="text-gray-400">
                Top-rated creator studios near you
              </p>
            </div>
            <Link
              href="/rooms"
              className="hidden sm:flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-all"
            >
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.length > 0 ? (
              rooms.map((room: any) => <RoomCard key={room._id} room={room} />)
            ) : (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-[#13131f] rounded-xl h-80 animate-pulse" />
              ))
            )}
          </div>

          <div className="sm:hidden text-center mt-8">
            <Link
              href="/rooms"
              className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-all"
            >
              View All Studios <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              How <span className="text-gradient">It Works</span>
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              Book a creator studio in 4 simple steps. No hassle, no hidden charges.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {howItWorks.map((step) => (
              <div
                key={step.step}
                className="relative p-6 rounded-2xl bg-[#13131f] border border-[#1e1e2e] hover:border-purple-500/30 transition-all group"
              >
                <div className="text-5xl font-bold text-white/5 absolute top-4 right-4">
                  {step.step}
                </div>
                <div className="w-12 h-12 rounded-xl creator-gradient flex items-center justify-center mb-4">
                  <step.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(236,72,153,0.05),transparent_60%)]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Why <span className="text-gradient">SnapforestX?</span>
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              Built by creators, for creators. We understand what you need.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Shield,
                title: 'Secure Payments',
                description: 'Razorpay-powered payments with end-to-end encryption. Your money is safe.',
              },
              {
                icon: Headphones,
                title: '24/7 Support',
                description: 'Our creator support team is always ready to help you with any issues.',
              },
              {
                icon: Zap,
                title: 'Instant Booking',
                description: 'Book a studio in under 2 minutes. Real-time availability check.',
              },
              {
                icon: Star,
                title: 'Verified Studios',
                description: 'Every studio is personally verified for equipment quality and hygiene.',
              },
              {
                icon: Clock,
                title: 'Flexible Hours',
                description: 'Book by the hour. No minimum booking duration. Pay only for what you use.',
              },
              {
                icon: CheckCircle,
                title: 'All Equipment Included',
                description: 'Cameras, lights, mics, editing setup - everything is included in the price.',
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="p-6 rounded-xl bg-[#13131f] border border-[#1e1e2e] hover:border-purple-500/30 transition-all"
              >
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-5 h-5 text-purple-400" />
                </div>
                <h3 className="text-white font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl overflow-hidden p-10 sm:p-16 text-center">
            <div className="absolute inset-0 creator-gradient" />
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Ready to Create?
              </h2>
              <p className="text-white/80 text-lg mb-8 max-w-lg mx-auto">
                Join thousands of creators who trust SnapforestX for their studio bookings.
              </p>
              <Link
                href="/rooms"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-purple-600 rounded-xl font-semibold hover:bg-gray-100 transition-all hover:shadow-lg"
              >
                <Zap className="w-5 h-5" />
                Find a Studio
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
