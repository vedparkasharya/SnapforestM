"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  MapPin,
  Star,
  Users,
  ArrowLeft,
  Wifi,
  Camera,
  Mic,
  Music,
  Monitor,
  Lightbulb,
  Speaker,
  Gamepad2,
  Clapperboard,
  Video,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Headphones,
  Keyboard,
} from "lucide-react";
import Link from "next/link";
import BookingWidget from "@/components/booking/BookingWidget";
import RoomGallery from "@/components/rooms/RoomGallery";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

const equipmentIcons: Record<string, React.ReactNode> = {
  WiFi: <Wifi className="w-4 h-4" />,
  Camera: <Camera className="w-4 h-4" />,
  Microphone: <Mic className="w-4 h-4" />,
  "Audio Interface": <Music className="w-4 h-4" />,
  Monitor: <Monitor className="w-4 h-4" />,
  "LED Lights": <Lightbulb className="w-4 h-4" />,
  Speakers: <Speaker className="w-4 h-4" />,
  "Gaming Chair": <Gamepad2 className="w-4 h-4" />,
  Teleprompter: <Clapperboard className="w-4 h-4" />,
  "Multi-Cam Setup": <Video className="w-4 h-4" />,
  Whiteboard: <Building2 className="w-4 h-4" />,
  "Monitoring Headphones": <Headphones className="w-4 h-4" />,
  "RGB Setup": <Gamepad2 className="w-4 h-4" />,
  "MIDI Keyboard": <Keyboard className="w-4 h-4" />,
  "Studio Monitors": <Speaker className="w-4 h-4" />,
  "Vocal Booth": <Mic className="w-4 h-4" />,
  "Pop Filter": <Mic className="w-4 h-4" />,
  "Green Screen": <Clapperboard className="w-4 h-4" />,
  "Ring Light": <Lightbulb className="w-4 h-4" />,
  Backdrop: <Camera className="w-4 h-4" />,
  Reflectors: <Lightbulb className="w-4 h-4" />,
  "Strobe Lights": <Lightbulb className="w-4 h-4" />,
  Softbox: <Lightbulb className="w-4 h-4" />,
  "Ballet Barres": <Building2 className="w-4 h-4" />,
  "Sprung Floor": <Building2 className="w-4 h-4" />,
  Mirrors: <Building2 className="w-4 h-4" />,
  Projector: <Video className="w-4 h-4" />,
};

const categoryColors: Record<string, string> = {
  podcast: "from-[#1a472a] to-[#2d6a43]",
  youtube: "from-[#1a472a] to-[#3b7a57]",
  music: "from-[#1a472a] to-[#356b48]",
  photography: "from-[#8b6b23] to-[#b18a2b]",
  dance: "from-[#1a472a] to-[#4b7d5b]",
  coworking: "from-[#1a472a] to-[#3f7955]",
  gaming: "from-[#1a472a] to-[#2b7a45]",
  streaming: "from-[#1a472a] to-[#4f7e5e]",
  meeting: "from-[#1a472a] to-[#477957]",
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

  useEffect(() => {
    const controller = new AbortController();

    async function fetchRoom() {
      try {
        const slug = String(params.slug || "");
        const res = await fetch(`/api/rooms?slug=${encodeURIComponent(slug)}`, {
          signal: controller.signal,
          cache: "no-store",
        });
        const data = await res.json();
        if (res.ok && data.success && Array.isArray(data.data) && data.data.length > 0) {
          setRoom(data.data[0]);
        }
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          console.error("Error fetching room:", error);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void fetchRoom();
    return () => controller.abort();
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
                {Array.from({ length: 5 }).map((_, i) => (
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
      <main className="min-h-screen pt-20 flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-2">Studio not found</h1>
          <p className="text-sm text-muted-foreground mb-5">This listing may have been removed or is currently unavailable.</p>
          <Link href="/rooms" className="btn-primary">
            Browse studios
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/rooms"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          Back to studios
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <RoomGallery images={room.images} roomName={room.name} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card p-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Badge
                      variant="neon"
                      className={`bg-gradient-to-r ${
                        categoryColors[room.category] || "from-[#1a472a] to-[#2d6a43]"
                      } text-white border-0`}
                    >
                      {room.category.charAt(0).toUpperCase() + room.category.slice(1)}
                    </Badge>
                    {room.reviews > 0 && room.rating >= 4.7 && (
                      <Badge variant="success" className="text-xs">
                        <Star className="w-3 h-3 mr-1 fill-current" aria-hidden="true" />
                        Highly rated
                      </Badge>
                    )}
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-semibold">{room.name}</h1>
                  <div className="flex items-center gap-2 text-muted-foreground mt-2">
                    <MapPin className="w-4 h-4 text-[#c8e6c9]" aria-hidden="true" />
                    <span>{room.address}, {room.city}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl">
                  <Star className="w-5 h-5 text-[#f9a825] fill-[#f9a825]" aria-hidden="true" />
                  <span className="font-semibold text-lg">{room.rating}</span>
                  {room.reviews > 0 && <span className="text-muted-foreground">({room.reviews})</span>}
                </div>
              </div>

              <p className="text-muted-foreground leading-relaxed">{room.description}</p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6">
                {[
                  { icon: Users, label: "Capacity", value: `${room.capacity} people` },
                  { icon: Clock, label: "Booking", value: "Hourly or full day" },
                  { icon: Calendar, label: "Availability", value: "Choose a live slot" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                    <div className="p-2 rounded-lg bg-[#1a472a]/20">
                      <item.icon className="w-4 h-4 text-[#c8e6c9]" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{item.label}</p>
                      <p className="text-sm font-medium">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {room.equipment && room.equipment.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-card p-6"
              >
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[#c8e6c9]" aria-hidden="true" />
                  What&apos;s in the room
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {room.equipment.map((item) => (
                    <motion.span
                      key={item}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-white/5 text-sm hover:bg-white/10 transition-colors"
                    >
                      <span className="p-1.5 rounded-lg bg-[#1a472a]/20 text-[#c8e6c9]">
                        {equipmentIcons[item] || <Monitor className="w-4 h-4" />}
                      </span>
                      {item}
                    </motion.span>
                  ))}
                </div>
              </motion.div>
            )}

            {room.mapLink && (
              <motion.a
                href={room.mapLink}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex items-center gap-3 p-4 rounded-xl bg-[#1a472a]/10 border border-[#c8e6c9]/10 hover:border-[#c8e6c9]/20 transition-colors"
              >
                <div className="p-2 rounded-lg bg-[#1a472a]/20">
                  <MapPin className="w-5 h-5 text-[#c8e6c9]" aria-hidden="true" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Open location</p>
                  <p className="text-xs text-muted-foreground">{room.address}, {room.city}</p>
                </div>
              </motion.a>
            )}
          </div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <BookingWidget room={room} />
          </motion.div>
        </div>
      </div>
    </main>
  );
}
