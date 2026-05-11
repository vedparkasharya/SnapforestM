"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { MapPin, Star, Users, ArrowLeft, Wifi, Camera, Mic, Music, Monitor, Lightbulb, Speaker } from "lucide-react";
import Link from "next/link";
import BookingWidget from "@/components/booking/BookingWidget";
import { Skeleton } from "@/components/ui/skeleton";

const equipmentIcons: Record<string, React.ReactNode> = {
  "WiFi": <Wifi className="w-4 h-4" />,
  "Camera": <Camera className="w-4 h-4" />,
  "Microphone": <Mic className="w-4 h-4" />,
  "Audio Interface": <Music className="w-4 h-4" />,
  "Monitor": <Monitor className="w-4 h-4" />,
  "LED Lights": <Lightbulb className="w-4 h-4" />,
  "Speakers": <Speaker className="w-4 h-4" />,
};

interface Room {
  _id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  city: string;
  address: string;
  images: string[];
  equipment: string[];
  pricePerHour: number;
  pricePerDay: number;
  rating: number;
  reviews: number;
  capacity: number;
  mapLink?: string;
}

export default function RoomDetailPage() {
  const params = useParams();
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    async function fetchRoom() {
      try {
        const res = await fetch(`/api/rooms?slug=${params.slug}`);
        const data = await res.json();
        if (data.success && data.data.length > 0) {
          setRoom(data.data[0]);
        }
      } catch (error) {
        console.error("Error fetching room:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchRoom();
  }, [params.slug]);

  if (loading) {
    return (
      <main className="min-h-screen pt-20">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Skeleton className="h-8 w-32 mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <Skeleton className="aspect-video rounded-xl" />
              <div className="flex gap-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="w-24 h-16 rounded-lg" />
                ))}
              </div>
            </div>
            <Skeleton className="h-96 rounded-xl" />
          </div>
        </div>
      </main>
    );
  }

  if (!room) {
    return (
      <main className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Room Not Found</h1>
          <Link href="/rooms" className="text-neon-cyan hover:underline">
            Browse all rooms
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Link */}
        <Link
          href="/rooms"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Rooms
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Images & Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Main Image */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative aspect-video rounded-xl overflow-hidden"
            >
              <Image
                src={room.images[selectedImage] || "/rooms/photo-studio.jpg"}
                alt={room.name}
                fill
                className="object-cover"
              />
            </motion.div>

            {/* Thumbnail Gallery */}
            {room.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
                {room.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`relative w-24 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-colors ${
                      selectedImage === i
                        ? "border-neon-cyan"
                        : "border-transparent hover:border-white/20"
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`${room.name} ${i + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Room Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card p-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold">{room.name}</h1>
                  <div className="flex items-center gap-2 text-muted-foreground mt-1">
                    <MapPin className="w-4 h-4" />
                    <span>{room.address}, {room.city}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  <span className="font-semibold text-lg">{room.rating}</span>
                  <span className="text-muted-foreground">({room.reviews} reviews)</span>
                </div>
              </div>

              <p className="text-muted-foreground leading-relaxed">{room.description}</p>

              <div className="flex items-center gap-6 mt-4 text-sm">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-neon-cyan" />
                  <span>Capacity: {room.capacity} people</span>
                </div>
              </div>
            </motion.div>

            {/* Equipment */}
            {room.equipment && room.equipment.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-card p-6"
              >
                <h3 className="text-lg font-semibold mb-4">Equipment</h3>
                <div className="flex flex-wrap gap-3">
                  {room.equipment.map((item, i) => (
                    <span
                      key={i}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 text-sm"
                    >
                      {equipmentIcons[item] || <Monitor className="w-4 h-4" />}
                      {item}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Map Link */}
            {room.mapLink && (
              <motion.a
                href={room.mapLink}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex items-center gap-2 text-neon-cyan hover:underline"
              >
                <MapPin className="w-4 h-4" />
                View on Google Maps
              </motion.a>
            )}
          </div>

          {/* Right Column - Booking Widget */}
          <div>
            <BookingWidget room={room} />
          </div>
        </div>
      </div>
    </main>
  );
}
