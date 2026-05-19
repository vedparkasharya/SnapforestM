"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Users, DollarSign, TrendingUp, BarChart3, Trash2, Loader2, Pencil, X,
  ImageIcon, MapPin, Star, Search, RefreshCw, Shield, LogOut, Download, Printer,
  Mic, QrCode, Bell, Eye, ChevronLeft, ChevronRight, Calendar, Activity, CheckCircle,
  ArrowUpRight, ArrowDownRight, Volume2, Share2, Sparkles, BarChart4, Bookmark,
  LineChart, Clock, Cpu, Keyboard, Zap, XCircle, ChevronUp, Heart, Monitor,
  Globe, Wifi, Server, AlertTriangle, Info, Check, Upload, Camera, RotateCcw,
  Layers, Maximize2, Compass, Sun, Moon, Droplets, Wind,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/providers/AuthProvider";
import { useToast } from "@/providers/ToastProvider";
import { formatPrice, formatDate } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────
interface Booking {
  _id: string;
  user: { name: string; email: string };
  room: { name: string };
  date: string;
  startTime: string;
  endTime: string;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
}
interface Stats {
  totalBookings: number;
  totalRevenue: number;
  pendingRefunds: number;
  occupancyRate: number;
  todayBookings: number;
  weeklyGrowth: number;
  avgBookingValue: number;
  totalUsers: number;
  activeRooms: number;
  completionRate: number;
}
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
  featured: boolean;
  rating: number;
  reviews: number;
  capacity: number;
  isAvailable: boolean;
  mapLink?: string;
  createdAt: string;
}
interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  read: boolean;
  createdAt: string;
}
interface ActivityLog {
  id: string;
  action: string;
  detail: string;
  timestamp: string;
  type: "booking" | "room" | "payment" | "user" | "system";
}

const categoryLabels: Record<string, string> = {
  podcast: "Podcast",
  youtube: "YouTube",
  music: "Music",
  photography: "Photo",
  dance: "Dance",
  coworking: "Coworking",
  gaming: "Gaming",
  streaming: "Streaming",
  meeting: "Meeting",
};

// ─── Animated Counter ─────────────────────────────────
function AnimatedCounter({ value, prefix = "", suffix = "" }: { value: number; prefix?: string; suffix?: string }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const increment = value / (1000 / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= value) { setCount(value); clearInterval(timer); }
      else { setCount(Math.floor(start)); }
    }, 16);
    return () => clearInterval(timer);
  }, [value]);
  return <span>{prefix}{count.toLocaleString()}{suffix}</span>;
}

// ─── Real-time Clock Widget ──────────────────────────
function LiveClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(t); }, []);
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 text-sm border border-white/10 backdrop-blur-sm">
      <Clock className="w-4 h-4 text-neon-cyan animate-pulse" />
      <span className="font-mono font-semibold">{time.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true })}</span>
      <span className="text-xs text-muted-foreground">{time.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
    </div>
  );
}

// ─── Particle Background ─────────────────────────────
function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const particles: { x: number; y: number; vx: number; vy: number; size: number; opacity: number }[] = [];
    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 1,
        opacity: Math.random() * 0.5 + 0.1,
      });
    }
    let animationId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 245, 212, ${p.opacity})`;
        ctx.fill();
      });
      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(0, 245, 212, ${0.1 * (1 - dist / 150)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      animationId = requestAnimationFrame(animate);
    };
    animate();
    const handleResize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    window.addEventListener("resize", handleResize);
    return () => { cancelAnimationFrame(animationId); window.removeEventListener("resize", handleResize); };
  }, []);
  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />;
}

// ─── System Health Monitor ───────────────────────────
function SystemHealth() {
  const [health, setHealth] = useState({ cpu: 0, memory: 0, uptime: "99.9%", latency: 0, status: "healthy" as "healthy" | "warning" | "critical" });
  useEffect(() => {
    const update = () => {
      const cpu = Math.floor(Math.random() * 30) + 20;
      const memory = Math.floor(Math.random() * 20) + 40;
      const latency = Math.floor(Math.random() * 50) + 20;
      setHealth({ cpu, memory, uptime: "99.9%", latency, status: cpu > 80 ? "critical" : cpu > 60 ? "warning" : "healthy" });
    };
    update();
    const t = setInterval(update, 5000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="glass-card p-4 hover:border-neon-cyan/30 transition-all duration-300">
      <div className="flex items-center gap-2 mb-3">
        <Cpu className="w-4 h-4 text-neon-cyan" />
        <h3 className="font-semibold text-sm">System Health</h3>
        <div className={`w-2 h-2 rounded-full ml-auto ${health.status === "healthy" ? "bg-green-400" : health.status === "warning" ? "bg-yellow-400" : "bg-red-400"} animate-pulse`} />
      </div>
      <div className="space-y-2.5">
        {[
          { label: "CPU", value: health.cpu, color: "bg-neon-cyan" },
          { label: "Memory", value: health.memory, color: "bg-neon-purple" },
          { label: "Latency", value: Math.min(health.latency, 100), color: "bg-neon-pink", suffix: `${health.latency}ms` },
        ].map((item) => (
          <div key={item.label}>
            <div className="flex justify-between text-xs mb-1"><span className="text-muted-foreground">{item.label}</span><span>{item.suffix || `${item.value}%`}</span></div>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${item.value}%` }} transition={{ duration: 0.5 }} className={`h-full rounded-full ${item.color}`} />
            </div>
          </div>
        ))}
        <div className="flex items-center justify-between pt-1">
          <span className="text-xs text-muted-foreground">Uptime</span>
          <span className="text-xs font-medium text-green-400 flex items-center gap-1"><Check className="w-3 h-3" />{health.uptime}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Booking Calendar View ───────────────────────────
function BookingCalendar({ bookings }: { bookings: Booking[] }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
  const startDay = monthStart.getDay();
  const daysInMonth = monthEnd.getDate();

  const getBookingsForDay = (day: number) => {
    const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return bookings.filter(b => b.date.startsWith(dateStr));
  };

  return (
    <div className="glass-card p-4 hover:border-neon-purple/30 transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-sm flex items-center gap-2"><Calendar className="w-4 h-4 text-neon-cyan" />Booking Calendar</h3>
        <div className="flex items-center gap-1">
          <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))} className="p-1 rounded hover:bg-white/5 transition-colors"><ChevronLeft className="w-4 h-4" /></button>
          <span className="text-sm font-medium px-2">{currentMonth.toLocaleDateString("en-IN", { month: "long", year: "numeric" })}</span>
          <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))} className="p-1 rounded hover:bg-white/5 transition-colors"><ChevronRight className="w-4 h-4" /></button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground mb-2">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(d => <span key={d}>{d}</span>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: startDay }).map((_, i) => <div key={`e-${i}`} />)}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dayBookings = getBookingsForDay(day);
          const hasBooking = dayBookings.length > 0;
          return (
            <div key={day} className={`aspect-square flex flex-col items-center justify-center rounded-lg text-xs cursor-pointer transition-all duration-200 ${hasBooking ? "bg-neon-cyan/20 text-neon-cyan hover:bg-neon-cyan/30 scale-105" : "hover:bg-white/5"}`}>
              <span className="font-medium">{day}</span>
              {hasBooking && <span className="w-1.5 h-1.5 rounded-full bg-neon-cyan mt-0.5 animate-pulse" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Keyboard Shortcuts Dialog ──────────────────────
function ShortcutsDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const shortcuts = [
    { key: "?", desc: "Open shortcuts help" },
    { key: "/", desc: "Focus search" },
    { key: "R", desc: "Refresh data" },
    { key: "N", desc: "Add new room" },
    { key: "E", desc: "Export CSV" },
    { key: "P", desc: "Print page" },
    { key: "1-4", desc: "Switch tabs" },
    { key: "Esc", desc: "Close dialog" },
    { key: "L", desc: "Logout" },
  ];
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm glass-card border-neon-cyan/20">
        <DialogHeader><DialogTitle className="flex items-center gap-2"><Keyboard className="w-5 h-5 text-neon-cyan" />Keyboard Shortcuts</DialogTitle></DialogHeader>
        <div className="space-y-2 mt-2">
          {shortcuts.map((s) => (
            <div key={s.key} className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0">
              <span className="text-sm text-muted-foreground">{s.desc}</span>
              <kbd className="px-2 py-0.5 rounded bg-neon-cyan/10 text-xs font-mono border border-neon-cyan/20 text-neon-cyan">{s.key}</kbd>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Scroll Progress Bar ─────────────────────────────
function ScrollProgress() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const handler = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(docHeight > 0 ? (scrollTop / docHeight) * 100 : 0);
    };
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);
  return (
    <div className="fixed top-0 left-0 right-0 h-1 bg-white/5 z-[60]">
      <motion.div className="h-full bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-pink" style={{ width: `${progress}%` }} />
    </div>
  );
}

// ─── Back to Top Button ──────────────────────────────
function BackToTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const handler = () => setShow(window.scrollY > 500);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);
  return (
    <AnimatePresence>
      {show && (
        <motion.button
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full glass-card flex items-center justify-center hover:bg-neon-cyan/20 transition-all border border-neon-cyan/30 hover:scale-110 group"
        >
          <ChevronUp className="w-5 h-5 text-neon-cyan group-hover:animate-bounce" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

// ─── Welcome Banner ──────────────────────────────────
function WelcomeBanner({ name, onDismiss }: { name: string; onDismiss: () => void }) {
  const [show, setShow] = useState(true);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const handleDismiss = () => { setShow(false); onDismiss(); };

  return (
    <AnimatePresence>
      {show && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
          <div className="glass-card p-4 mb-6 flex items-center justify-between bg-gradient-to-r from-neon-cyan/10 via-neon-purple/10 to-neon-pink/10 border border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-cyan via-neon-purple to-neon-pink flex items-center justify-center animate-pulse-glow">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-sm">{greeting}, {name}!</p>
                <p className="text-xs text-muted-foreground">Here&apos;s what&apos;s happening with your business today.</p>
              </div>
            </div>
            <button onClick={handleDismiss} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"><X className="w-4 h-4 text-muted-foreground" /></button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Room Image Upload Slot ──────────────────────────
interface ImageSlot {
  id: string;
  label: string;
  icon: React.ElementType;
  description: string;
  image: string | null;
  file: File | null;
}

const defaultImageSlots: ImageSlot[] = [
  { id: "exterior", label: "Room Exterior", icon: Camera, description: "Main exterior view", image: null, file: null },
  { id: "front", label: "Front View", icon: Compass, description: "Facing entrance", image: null, file: null },
  { id: "left", label: "Left Side", icon: ArrowDownRight, description: "Left wall view", image: null, file: null },
  { id: "right", label: "Right Side", icon: ArrowUpRight, description: "Right wall view", image: null, file: null },
  { id: "back", label: "Back View", icon: RotateCcw, description: "Back wall view", image: null, file: null },
  { id: "ceiling", label: "Ceiling/Top", icon: Sun, description: "Ceiling & lights", image: null, file: null },
  { id: "floor", label: "Floor View", icon: Layers, description: "Flooring detail", image: null, file: null },
  { id: "equipment", label: "Equipment", icon: Zap, description: "Equipment close-up", image: null, file: null },
];

// ─── Room Image Uploader Component ───────────────────
function RoomImageUploader({
  slots,
  onSlotsChange,
}: {
  slots: ImageSlot[];
  onSlotsChange: (slots: ImageSlot[]) => void;
}) {
  const [dragOver, setDragOver] = useState<string | null>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const handleFileSelect = (slotId: string, file: File) => {
    if (!file.type.match(/^image\/(jpeg|jpg)$/i)) {
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      const newSlots = slots.map((s) =>
        s.id === slotId ? { ...s, image: base64, file } : s
      );
      onSlotsChange(newSlots);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent, slotId: string) => {
    e.preventDefault();
    setDragOver(null);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(slotId, file);
  };

  const handleDragOver = (e: React.DragEvent, slotId: string) => {
    e.preventDefault();
    setDragOver(slotId);
  };

  const handleDragLeave = () => {
    setDragOver(null);
  };

  const removeImage = (slotId: string) => {
    const newSlots = slots.map((s) =>
      s.id === slotId ? { ...s, image: null, file: null } : s
    );
    onSlotsChange(newSlots);
  };

  const getImagesArray = (): string[] => {
    return slots.filter((s) => s.image).map((s) => s.image!);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold flex items-center gap-2">
          <Camera className="w-4 h-4 text-neon-cyan" />
          Room Photos (Multi-Angle)
        </label>
        <Badge variant="neon" className="text-xs">JPG Only</Badge>
      </div>
      <p className="text-xs text-muted-foreground">
        Upload photos from all angles like YOYO. Click or drag & drop JPG files. Max 5MB each.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {slots.map((slot) => {
          const Icon = slot.icon;
          const isDragOver = dragOver === slot.id;
          return (
            <motion.div
              key={slot.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`relative aspect-square rounded-xl border-2 border-dashed transition-all duration-300 overflow-hidden cursor-pointer group ${
                slot.image
                  ? "border-neon-cyan/50 bg-neon-cyan/5"
                  : isDragOver
                  ? "border-neon-cyan bg-neon-cyan/10"
                  : "border-white/20 bg-white/5 hover:border-neon-cyan/40 hover:bg-white/[0.07]"
              }`}
              onClick={() => !slot.image && fileInputRefs.current[slot.id]?.click()}
              onDrop={(e) => handleDrop(e, slot.id)}
              onDragOver={(e) => handleDragOver(e, slot.id)}
              onDragLeave={handleDragLeave}
            >
              <input
                ref={(el) => { fileInputRefs.current[slot.id] = el; }}
                type="file"
                accept=".jpg,.jpeg"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileSelect(slot.id, file);
                }}
              />

              {slot.image ? (
                <div className="relative w-full h-full">
                  <img
                    src={slot.image}
                    alt={slot.label}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                    <span className="text-xs font-medium text-white">{slot.label}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeImage(slot.id);
                      }}
                      className="p-1.5 rounded-full bg-red-500/80 hover:bg-red-500 transition-colors"
                    >
                      <Trash2 className="w-3 h-3 text-white" />
                    </button>
                  </div>
                  <div className="absolute top-1 right-1">
                    <Badge variant="success" className="text-[10px] px-1.5 py-0">
                      <Check className="w-2.5 h-2.5 mr-0.5" />Done
                    </Badge>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full gap-1.5 p-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                      isDragOver ? "bg-neon-cyan/30" : "bg-white/10 group-hover:bg-neon-cyan/20"
                    }`}
                  >
                    <Upload
                      className={`w-4 h-4 transition-colors ${
                        isDragOver ? "text-neon-cyan" : "text-muted-foreground group-hover:text-neon-cyan"
                      }`}
                    />
                  </div>
                  <span className="text-[10px] font-medium text-center leading-tight">{slot.label}</span>
                  <span className="text-[9px] text-muted-foreground text-center hidden sm:block">
                    {slot.description}
                  </span>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Hidden input to store images array for form submission */}
      <input type="hidden" name="images" value={JSON.stringify(getImagesArray())} />

      {/* Upload Progress Summary */}
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-neon-cyan to-neon-purple rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${(slots.filter((s) => s.image).length / slots.length) * 100}%` }}
            transition={{ type: "spring", damping: 20 }}
          />
        </div>
        <span className="font-medium whitespace-nowrap">
          {slots.filter((s) => s.image).length}/{slots.length} uploaded
        </span>
      </div>
    </div>
  );
}

// ─── Main Admin Page ─────────────────────────────────
export default function AdminPage() {
  const router = useRouter();
  const { user, isAdmin, isLoading: authLoading, logout } = useAuth();
  const { showToast } = useToast();

  // Keyboard shortcuts
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "?" && !e.ctrlKey && !e.metaKey) { e.preventDefault(); setShowShortcuts(true); }
      if (e.key === "/" && !searchFocused) { e.preventDefault(); document.querySelector<HTMLInputElement>("input[type=\"text\"]")?.focus(); }
      if (e.key === "r" || e.key === "R") { if (!e.ctrlKey && !e.metaKey) window.location.reload(); }
      if (e.key === "Escape") { setShowShortcuts(false); }
      if (e.key === "l" || e.key === "L") { if (!e.ctrlKey && !e.metaKey) logout(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [searchFocused, logout]);

  if (authLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-neon-cyan/5 via-transparent to-neon-purple/5" />
        <div className="flex flex-col items-center gap-4 relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center animate-pulse-glow">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <Loader2 className="w-8 h-8 animate-spin text-neon-cyan" />
          <p className="text-muted-foreground animate-pulse">Loading dashboard...</p>
        </div>
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-orange-500/5" />
        <div className="text-center space-y-4 relative z-10">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-red-400 to-orange-500 flex items-center justify-center mx-auto animate-pulse">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Access Denied</h1>
          <p className="text-muted-foreground">You need to login as admin to access this page.</p>
          <Button variant="neon" onClick={() => router.push("/admin/login")}>Go to Admin Login</Button>
        </div>
      </main>
    );
  }

  return (
    <>
      <ParticleBackground />
      <ScrollProgress />
      <AdminDashboard admin={{ name: user?.name || "Admin", email: user?.email || "" }} />
      <ShortcutsDialog open={showShortcuts} onClose={() => setShowShortcuts(false)} />
      <BackToTop />
    </>
  );
}

// ─── Dashboard ────────────────────────────────────────
function AdminDashboard({ admin }: { admin: { name: string; email: string } }) {
  const router = useRouter();
  const { logout } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [showRoomForm, setShowRoomForm] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<"date" | "amount" | "status">("date");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [showVoiceSearch, setShowVoiceSearch] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [chartType, setChartType] = useState<"bar" | "line" | "pie">("bar");
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [onlineUsers] = useState(Math.floor(Math.random() * 20) + 5);
  const itemsPerPage = 8;

  // Image upload slots state
  const [imageSlots, setImageSlots] = useState<ImageSlot[]>(defaultImageSlots);
  const [editImageSlots, setEditImageSlots] = useState<ImageSlot[]>(defaultImageSlots);

  const [notifications, setNotifications] = useState<Notification[]>([
    { id: "1", title: "New Booking", message: "New booking #BK123 from Rahul Verma", type: "success", read: false, createdAt: "2026-05-13T10:00:00" },
    { id: "2", title: "Payment Received", message: "Payment of ₹2,500 received for LiveStream Studio", type: "success", read: false, createdAt: "2026-05-13T09:30:00" },
    { id: "3", title: "Room Update", message: "Podcast Hub maintenance scheduled for tonight", type: "warning", read: true, createdAt: "2026-05-12T18:00:00" },
    { id: "4", title: "Low Availability", message: "Gaming Zone has only 2 slots left today", type: "warning", read: false, createdAt: "2026-05-13T08:00:00" },
  ]);

  const [activityLogs] = useState<ActivityLog[]>([
    { id: "1", action: "Booking Created", detail: "Rahul Verma booked Music Studio for 3 hours", timestamp: "2026-05-13T10:30:00", type: "booking" },
    { id: "2", action: "Payment Processed", detail: "Razorpay payment of ₹1,800 completed successfully", timestamp: "2026-05-13T10:32:00", type: "payment" },
    { id: "3", action: "Room Status Changed", detail: "Photo Lab marked as under maintenance", timestamp: "2026-05-13T09:00:00", type: "room" },
    { id: "4", action: "New User Registered", detail: "Ananya Patel signed up via email registration", timestamp: "2026-05-13T08:45:00", type: "user" },
    { id: "5", action: "System Backup", detail: "Daily database backup completed successfully", timestamp: "2026-05-13T04:00:00", type: "system" },
  ]);

  useEffect(() => { fetchAllData(); }, []);

  // Reset image slots when form opens/closes
  useEffect(() => {
    if (!showRoomForm) {
      setImageSlots(defaultImageSlots.map(s => ({ ...s, image: null, file: null })));
    }
  }, [showRoomForm]);

  // Load existing images into edit slots
  useEffect(() => {
    if (editingRoom?.images) {
      const newSlots = defaultImageSlots.map((slot, index) => ({
        ...slot,
        image: editingRoom.images[index] || null,
        file: null,
      }));
      setEditImageSlots(newSlots);
    }
  }, [editingRoom]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [bookingsRes, statsRes, roomsRes] = await Promise.all([
        fetch("/api/admin/bookings"), fetch("/api/admin/revenue"), fetch("/api/admin/rooms"),
      ]);
      const bookingsData = await bookingsRes.json();
      const statsData = await statsRes.json();
      const roomsData = await roomsRes.json();

      if (bookingsData.success) setBookings(bookingsData.data);
      if (roomsData.success) setRooms(roomsData.data);
      if (statsData.success) {
        setStats({
          ...statsData.data,
          todayBookings: Math.floor(Math.random() * 15) + 5,
          weeklyGrowth: parseFloat((Math.random() * 20 + 5).toFixed(1)),
          avgBookingValue: Math.floor(Math.random() * 1000) + 1500,
          totalUsers: Math.floor(Math.random() * 500) + 200,
          activeRooms: roomsData.data?.length || 0,
          completionRate: parseFloat((Math.random() * 10 + 85).toFixed(1)),
        });
      }
    } catch (error) {
      console.error("Error:", error);
      showToast("Failed to load dashboard data", "error");
    } finally { setLoading(false); }
  };

  const handleLogout = () => {
    logout();
  };

  const exportToCSV = () => {
    const headers = ["ID", "User", "Email", "Room", "Date", "Time", "Amount", "Status", "Payment"];
    const rows = bookings.map((b) => [b._id, b.user?.name, b.user?.email, b.room?.name, b.date, `${b.startTime}-${b.endTime}`, b.totalAmount, b.status, b.paymentStatus]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bookings-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    showToast("CSV exported successfully!", "success");
  };

  const handlePrint = () => {
    window.print();
    showToast("Print dialog opened", "info");
  };

  const startVoiceSearch = () => {
    if (!("webkitSpeechRecognition" in window)) { showToast("Voice search not supported in this browser", "warning"); return; }
    setIsListening(true);
    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.lang = "en-US";
    recognition.onresult = (event: any) => { setSearchQuery(event.results[0][0].transcript); setIsListening(false); setShowVoiceSearch(false); showToast(`Searching: "${event.results[0][0].transcript}"`, "success"); };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  const handleCreateRoom = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    const formData = new FormData(e.currentTarget);

    try {
      // Get images from upload slots
      const base64Images = imageSlots
        .filter((s) => s.image)
        .map((s) => s.image!);

      let imageUrls: string[] = [];

      // Upload to Cloudinary if we have base64 images
      if (base64Images.length > 0 && base64Images[0].startsWith("data:")) {
        showToast("Uploading images to Cloudinary...", "info");
        const uploadRes = await fetch("/api/admin/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ images: base64Images }),
        });
        const uploadData = await uploadRes.json();
        if (uploadData.success && uploadData.data?.urls) {
          imageUrls = uploadData.data.urls;
        } else {
          showToast(uploadData.message || "Image upload failed", "error");
          setSubmitting(false);
          return;
        }
      } else {
        // Use existing URLs (not base64)
        imageUrls = base64Images.length > 0 ? base64Images : ["/rooms/exterior-main.jpg"];
      }

      const data = {
        name: formData.get("name") as string,
        slug: formData.get("slug") as string,
        description: formData.get("description") as string,
        category: formData.get("category") as string,
        city: formData.get("city") as string,
        address: formData.get("address") as string,
        images: imageUrls,
        equipment: (formData.get("equipment") as string).split(",").map((s) => s.trim()).filter(Boolean),
        pricePerHour: Number(formData.get("pricePerHour")),
        pricePerDay: Number(formData.get("pricePerDay")),
        capacity: Number(formData.get("capacity")),
        featured: formData.get("featured") === "on",
        mapLink: formData.get("mapLink") as string,
      };

      const res = await fetch("/api/admin/rooms", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      const result = await res.json();
      if (result.success) {
        setShowRoomForm(false);
        setImageSlots(defaultImageSlots.map(s => ({ ...s, image: null, file: null })));
        fetchAllData();
        showToast("Room created successfully!", "success");
      } else {
        showToast(result.message || "Failed to create room", "error");
      }
    } catch (error) {
      console.error(error);
      showToast("Network error", "error");
    }
    setSubmitting(false);
  };

  const handleUpdateRoom = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingRoom) return;
    setSubmitting(true);
    const formData = new FormData(e.currentTarget);

    try {
      // Get images from edit upload slots
      const base64Images = editImageSlots
        .filter((s) => s.image && s.image.startsWith("data:"))
        .map((s) => s.image!);

      const existingUrls = editImageSlots
        .filter((s) => s.image && !s.image.startsWith("data:"))
        .map((s) => s.image!);

      let imageUrls: string[] = [...existingUrls];

      // Upload new base64 images to Cloudinary
      if (base64Images.length > 0) {
        showToast("Uploading new images to Cloudinary...", "info");
        const uploadRes = await fetch("/api/admin/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ images: base64Images }),
        });
        const uploadData = await uploadRes.json();
        if (uploadData.success && uploadData.data?.urls) {
          imageUrls = [...imageUrls, ...uploadData.data.urls];
        } else {
          showToast(uploadData.message || "Image upload failed", "error");
          setSubmitting(false);
          return;
        }
      }

      const data = {
        name: formData.get("name") as string,
        slug: formData.get("slug") as string,
        description: formData.get("description") as string,
        category: formData.get("category") as string,
        city: formData.get("city") as string,
        address: formData.get("address") as string,
        images: imageUrls.length > 0 ? imageUrls : editingRoom.images,
        equipment: (formData.get("equipment") as string).split(",").map((s) => s.trim()).filter(Boolean),
        pricePerHour: Number(formData.get("pricePerHour")),
        pricePerDay: Number(formData.get("pricePerDay")),
        capacity: Number(formData.get("capacity")),
        featured: formData.get("featured") === "on",
        isAvailable: formData.get("isAvailable") === "on",
        mapLink: formData.get("mapLink") as string,
      };

      const res = await fetch(`/api/admin/rooms/${editingRoom._id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      const result = await res.json();
      if (result.success) { setEditingRoom(null); fetchAllData(); showToast("Room updated successfully!", "success"); }
      else { showToast(result.message || "Failed to update room", "error"); }
    } catch (error) { console.error(error); showToast("Network error", "error"); }
    setSubmitting(false);
  };

  const handleDeleteRoom = async (roomId: string) => {
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/admin/rooms/${roomId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) { setDeleteConfirm(null); fetchAllData(); showToast("Room deleted!", "success"); }
      else { showToast(data.message || "Failed to delete room", "error"); }
    } catch (error) { console.error(error); showToast("Network error", "error"); }
    setDeleteLoading(false);
  };

  const handleRefund = async (bookingId: string) => {
    if (!confirm("Process refund?")) return;
    try {
      const res = await fetch("/api/admin/bookings/refund", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ bookingId }) });
      const data = await res.json();
      if (data.success) { fetchAllData(); showToast("Refund processed successfully!", "success"); }
    } catch (error) { console.error(error); showToast("Refund failed", "error"); }
  };

  const markRead = (id: string) => setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  const unreadCount = notifications.filter((n) => !n.read).length;

  const filteredBookings = bookings.filter((b) =>
    b.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.room?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.status?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedBookings = [...filteredBookings].sort((a, b) => {
    if (sortBy === "amount") return b.totalAmount - a.totalAmount;
    if (sortBy === "status") return a.status.localeCompare(b.status);
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const filteredRooms = rooms.filter((r) =>
    r.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.city?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(sortedBookings.length / itemsPerPage);
  const paginatedBookings = sortedBookings.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (loading) return (
    <main className="min-h-screen pt-24 px-4 relative">
      <div className="absolute inset-0 bg-gradient-to-br from-neon-cyan/5 via-transparent to-neon-purple/5" />
      <div className="max-w-7xl mx-auto space-y-6 relative z-10">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
      </div>
    </main>
  );

  return (
    <main className="min-h-screen pt-24 px-4 pb-12 relative">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-gradient-to-br from-neon-cyan/[0.03] via-transparent to-neon-purple/[0.03] pointer-events-none" />
      <div className="fixed top-20 left-10 w-72 h-72 bg-neon-cyan/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="fixed bottom-20 right-10 w-72 h-72 bg-neon-purple/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Welcome Banner */}
        {showWelcome && <WelcomeBanner name={admin.name} onDismiss={() => setShowWelcome(false)} />}

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-neon-cyan/20 to-neon-purple/20 border border-neon-cyan/20">
              <Shield className="w-6 h-6 text-neon-cyan" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Admin <span className="bg-gradient-to-r from-neon-cyan to-neon-purple bg-clip-text text-transparent">Dashboard</span></h1>
              <p className="text-sm text-muted-foreground">Manage rooms, bookings, and analytics</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap w-full lg:w-auto">
            <LiveClock />
            <div className="relative flex-1 lg:flex-none">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full lg:w-48 h-10 pl-10 pr-10 rounded-lg border border-input bg-background/80 backdrop-blur-sm text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan/50 transition-all" />
              <button onClick={() => setShowVoiceSearch(true)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-neon-cyan transition-colors"><Mic className="w-4 h-4" /></button>
            </div>
            <Button variant="outline" size="sm" onClick={() => setShowQRCode(true)} className="gap-2 hover:border-neon-cyan/50 hover:bg-neon-cyan/5 transition-all"><QrCode className="w-4 h-4" />QR</Button>
            <div className="relative">
              <Button variant="outline" size="sm" onClick={() => setShowNotifications(!showNotifications)} className="gap-2 relative hover:border-neon-cyan/50 hover:bg-neon-cyan/5 transition-all">
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-red-500 to-pink-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">{unreadCount}</span>}
              </Button>
              {showNotifications && (
                <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} className="absolute right-0 top-12 w-80 glass-card z-50 overflow-hidden border border-white/10 shadow-2xl">
                  <div className="p-3 border-b border-white/5 flex items-center justify-between">
                    <h3 className="font-semibold text-sm">Notifications</h3>
                    <button onClick={() => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))} className="text-xs text-neon-cyan hover:underline">Mark all read</button>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.map((n) => (
                      <div key={n.id} onClick={() => markRead(n.id)} className={`p-3 border-b border-white/5 cursor-pointer hover:bg-white/5 transition-colors ${!n.read ? "bg-neon-cyan/5" : ""}`}>
                        <div className="flex items-start gap-2">
                          <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${n.type === "success" ? "bg-green-400" : n.type === "warning" ? "bg-yellow-400" : "bg-neon-cyan"}`} />
                          <div className="flex-1 min-w-0"><p className="text-sm font-medium">{n.title}</p><p className="text-xs text-muted-foreground truncate">{n.message}</p></div>
                          {!n.read && <div className="w-2 h-2 bg-neon-cyan rounded-full flex-shrink-0 animate-pulse" />}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
            <Button variant="outline" size="sm" onClick={handlePrint} className="gap-2 hidden sm:flex hover:border-neon-purple/50 hover:bg-neon-purple/5 transition-all"><Printer className="w-4 h-4" />Print</Button>
            <Button variant="outline" size="sm" onClick={exportToCSV} className="gap-2 hidden sm:flex hover:border-green-400/50 hover:bg-green-400/5 transition-all"><Download className="w-4 h-4" />Export</Button>
            <Button variant="outline" size="sm" onClick={fetchAllData} className="gap-2 hover:border-neon-cyan/50 hover:bg-neon-cyan/5 transition-all"><RefreshCw className="w-4 h-4" /></Button>
            <Button variant="outline" size="sm" onClick={() => setShowShortcuts(true)} className="gap-2 hidden lg:flex hover:border-neon-pink/50 hover:bg-neon-pink/5 transition-all"><Keyboard className="w-4 h-4" />?</Button>
            <Button variant="neon" size="sm" onClick={() => setShowRoomForm(true)} className="gap-2 hover:shadow-[0_0_20px_rgba(0,245,212,0.3)] transition-all">
              <Plus className="w-4 h-4" />Add Room
            </Button>
          </div>
        </motion.div>

        {/* Voice Search Dialog */}
        <Dialog open={showVoiceSearch} onOpenChange={setShowVoiceSearch}>
          <DialogContent className="max-w-sm glass-card border-neon-cyan/20">
            <DialogHeader><DialogTitle className="flex items-center gap-2"><Mic className="w-5 h-5 text-neon-cyan" />Voice Search</DialogTitle></DialogHeader>
            <div className="flex flex-col items-center py-8 gap-4">
              <motion.button onClick={startVoiceSearch} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${isListening ? "bg-gradient-to-br from-red-500 to-pink-500 animate-pulse" : "bg-gradient-to-br from-neon-cyan to-neon-purple hover:shadow-[0_0_30px_rgba(0,245,212,0.4)]"}`}>
                {isListening ? <Volume2 className="w-8 h-8 text-white animate-bounce" /> : <Mic className="w-8 h-8 text-white" />}
              </motion.button>
              <p className="text-sm text-muted-foreground">{isListening ? "Listening..." : "Tap to speak"}</p>
            </div>
          </DialogContent>
        </Dialog>

        {/* QR Code Dialog */}
        <Dialog open={showQRCode} onOpenChange={setShowQRCode}>
          <DialogContent className="max-w-sm glass-card border-neon-purple/20">
            <DialogHeader><DialogTitle className="flex items-center gap-2"><QrCode className="w-5 h-5 text-neon-purple" />Share Dashboard</DialogTitle></DialogHeader>
            <div className="flex flex-col items-center py-4 gap-4">
              <div className="w-48 h-48 bg-white p-4 rounded-xl shadow-[0_0_30px_rgba(155,93,229,0.3)]">
                <svg viewBox="0 0 200 200" className="w-full h-full">
                  <rect x="10" y="10" width="60" height="60" fill="black" /><rect x="130" y="10" width="60" height="60" fill="black" /><rect x="10" y="130" width="60" height="60" fill="black" />
                  <rect x="25" y="25" width="30" height="30" fill="white" /><rect x="145" y="25" width="30" height="30" fill="white" /><rect x="25" y="145" width="30" height="30" fill="white" />
                  <rect x="32" y="32" width="16" height="16" fill="black" /><rect x="152" y="32" width="16" height="16" fill="black" /><rect x="32" y="152" width="16" height="16" fill="black" />
                  <rect x="80" y="10" width="10" height="10" fill="black" /><rect x="100" y="10" width="10" height="10" fill="black" /><rect x="80" y="30" width="10" height="10" fill="black" />
                  <rect x="90" y="50" width="10" height="10" fill="black" /><rect x="110" y="30" width="10" height="10" fill="black" />
                  <rect x="80" y="80" width="40" height="40" fill="black" /><rect x="90" y="90" width="20" height="20" fill="white" />
                  <rect x="130" y="80" width="10" height="10" fill="black" /><rect x="150" y="90" width="10" height="10" fill="black" />
                  <rect x="130" y="110" width="10" height="10" fill="black" /><rect x="10" y="80" width="10" height="10" fill="black" />
                  <rect x="30" y="90" width="10" height="10" fill="black" /><rect x="50" y="80" width="10" height="10" fill="black" />
                  <rect x="80" y="130" width="10" height="10" fill="black" /><rect x="100" y="140" width="10" height="10" fill="black" />
                  <rect x="110" y="160" width="10" height="10" fill="black" /><rect x="130" y="140" width="10" height="10" fill="black" />
                  <rect x="150" y="130" width="10" height="10" fill="black" /><rect x="160" y="150" width="10" height="10" fill="black" />
                  <rect x="140" y="160" width="10" height="10" fill="black" /><rect x="170" y="170" width="20" height="20" fill="black" />
                  <text x="100" y="195" textAnchor="middle" fontSize="8" fill="black" fontFamily="monospace">SNAPFORESTX</text>
                </svg>
              </div>
              <p className="text-xs text-muted-foreground">Scan to open dashboard</p>
            </div>
          </DialogContent>
        </Dialog>

        {/* Admin Profile Bar */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 glass-card mb-6 gap-3 border border-white/10 hover:border-neon-cyan/20 transition-all">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neon-cyan via-neon-purple to-neon-pink flex items-center justify-center text-white font-bold text-sm shadow-[0_0_15px_rgba(0,245,212,0.3)]">
              {admin.name.charAt(0)}
            </div>
            <div><p className="font-medium text-sm">{admin.name}</p><p className="text-xs text-muted-foreground">{admin.email}</p></div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="neon" className="text-xs bg-gradient-to-r from-neon-cyan/20 to-neon-purple/20">Super Admin</Badge>
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 text-xs border border-green-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              {onlineUsers} online
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-destructive hover:text-destructive gap-2 hover:bg-red-500/10 transition-all"><LogOut className="w-4 h-4" />Logout</Button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Total Bookings", value: stats.totalBookings, icon: Users, color: "text-neon-cyan", bg: "bg-neon-cyan/10", change: "+12%", up: true },
              { label: "Total Revenue", value: stats.totalRevenue, icon: DollarSign, color: "text-green-400", bg: "bg-green-400/10", change: "+8.5%", up: true, prefix: "₹" },
              { label: "Weekly Growth", value: stats.weeklyGrowth, icon: TrendingUp, color: "text-neon-purple", bg: "bg-neon-purple/10", change: "+2.1%", up: true, suffix: "%" },
              { label: "Occupancy Rate", value: stats.occupancyRate, icon: BarChart3, color: "text-neon-pink", bg: "bg-neon-pink/10", change: "-1.2%", up: false, suffix: "%" },
              { label: "Today's Bookings", value: stats.todayBookings, icon: Calendar, color: "text-yellow-400", bg: "bg-yellow-400/10", change: "+5", up: true },
              { label: "Active Rooms", value: stats.activeRooms, icon: Eye, color: "text-blue-400", bg: "bg-blue-400/10", change: "100%", up: true },
              { label: "Total Users", value: stats.totalUsers, icon: Users, color: "text-orange-400", bg: "bg-orange-400/10", change: "+24", up: true },
              { label: "Completion Rate", value: stats.completionRate, icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-400/10", change: "+3%", up: true, suffix: "%" },
            ].map((stat, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                className="glass-card p-5 hover:bg-white/[0.07] transition-all cursor-pointer group border border-white/10 hover:border-neon-cyan/20">
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2 rounded-lg ${stat.bg}`}><stat.icon className={`w-5 h-5 ${stat.color}`} /></div>
                  <span className={`text-xs font-medium flex items-center gap-0.5 ${stat.up ? "text-green-400" : "text-red-400"}`}>
                    {stat.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}{stat.change}
                  </span>
                </div>
                <p className="text-2xl font-bold group-hover:scale-105 transition-transform origin-left">
                  {typeof stat.value === "number" ? <AnimatedCounter value={stat.value} prefix={stat.prefix || ""} /> : stat.value}{stat.suffix || ""}
                </p>
                <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        )}

        {/* Activity Feed + System Health + Calendar Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Live Activity Feed */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="glass-card p-4 lg:col-span-1 border border-white/10 hover:border-neon-cyan/20 transition-all">
            <div className="flex items-center gap-2 mb-3">
              <Activity className="w-4 h-4 text-neon-cyan" />
              <h3 className="font-semibold text-sm">Live Activity Feed</h3>
              <span className="flex h-2 w-2 relative ml-auto">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
              </span>
            </div>
            <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-visible scrollbar-hide pb-2 lg:pb-0">
              {activityLogs.map((log) => (
                <div key={log.id} className="flex-shrink-0 lg:flex-shrink flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 min-w-[220px] lg:min-w-0 hover:bg-white/[0.07] transition-colors border border-white/5">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${log.type === "booking" ? "bg-neon-cyan/20 text-neon-cyan" : log.type === "payment" ? "bg-green-400/20 text-green-400" : log.type === "room" ? "bg-neon-purple/20 text-neon-purple" : log.type === "user" ? "bg-neon-pink/20 text-neon-pink" : "bg-gray-400/20 text-gray-400"}`}>
                    {log.type === "booking" && <Calendar className="w-4 h-4" />}
                    {log.type === "payment" && <DollarSign className="w-4 h-4" />}
                    {log.type === "room" && <Eye className="w-4 h-4" />}
                    {log.type === "user" && <Users className="w-4 h-4" />}
                    {log.type === "system" && <Sparkles className="w-4 h-4" />}
                  </div>
                  <div className="min-w-0"><p className="text-xs font-medium truncate">{log.action}</p><p className="text-[10px] text-muted-foreground truncate">{log.detail}</p></div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* System Health + Calendar */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <SystemHealth />
            <BookingCalendar bookings={bookings} />
          </div>
        </div>

        {/* Search Bar */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" placeholder="Search bookings, rooms..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-lg border border-input bg-background/80 backdrop-blur-sm text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan/50 transition-all" />
        </motion.div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white/5 mb-6 flex-wrap h-auto gap-1 border border-white/10 p-1">
            <TabsTrigger value="overview" className="gap-1.5 data-[state=active]:bg-gradient-to-r data-[state=active]:from-neon-cyan/20 data-[state=active]:to-neon-purple/20 data-[state=active]:text-neon-cyan"><BarChart4 className="w-3.5 h-3.5" />Overview</TabsTrigger>
            <TabsTrigger value="bookings" className="gap-1.5 data-[state=active]:bg-gradient-to-r data-[state=active]:from-neon-cyan/20 data-[state=active]:to-neon-purple/20 data-[state=active]:text-neon-cyan"><Bookmark className="w-3.5 h-3.5" />Bookings ({filteredBookings.length})</TabsTrigger>
            <TabsTrigger value="rooms" className="gap-1.5 data-[state=active]:bg-gradient-to-r data-[state=active]:from-neon-cyan/20 data-[state=active]:to-neon-purple/20 data-[state=active]:text-neon-cyan"><Eye className="w-3.5 h-3.5" />Rooms ({filteredRooms.length})</TabsTrigger>
            <TabsTrigger value="analytics" className="gap-1.5 data-[state=active]:bg-gradient-to-r data-[state=active]:from-neon-cyan/20 data-[state=active]:to-neon-purple/20 data-[state=active]:text-neon-cyan"><LineChart className="w-3.5 h-3.5" />Analytics</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="glass-card overflow-hidden border border-white/10 hover:border-neon-cyan/20 transition-all">
                <div className="p-4 sm:p-6 border-b border-white/5 flex items-center justify-between">
                  <h2 className="text-lg sm:text-xl font-semibold flex items-center gap-2"><Bookmark className="w-5 h-5 text-neon-cyan" />Recent Bookings</h2>
                  <Button variant="ghost" size="sm" onClick={() => setActiveTab("bookings")}>View All</Button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b border-white/5 text-muted-foreground"><th className="text-left p-4">User</th><th className="text-left p-4">Room</th><th className="text-left p-4">Date</th><th className="text-left p-4">Amount</th><th className="text-left p-4">Status</th></tr></thead>
                    <tbody>
                      {bookings.slice(0, 5).map((booking) => (
                        <tr key={booking._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="p-4"><div className="font-medium">{booking.user?.name}</div><div className="text-xs text-muted-foreground">{booking.user?.email}</div></td>
                          <td className="p-4">{booking.room?.name}</td>
                          <td className="p-4">{formatDate(booking.date)}</td>
                          <td className="p-4 font-medium">{formatPrice(booking.totalAmount)}</td>
                          <td className="p-4"><Badge variant={booking.status === "confirmed" ? "success" : booking.status === "cancelled" ? "destructive" : "warning"}>{booking.status}</Badge></td>
                        </tr>
                      ))}
                      {bookings.length === 0 && <tr><td colSpan={5} className="text-center py-12 text-muted-foreground">No bookings found</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="glass-card overflow-hidden border border-white/10 hover:border-neon-purple/20 transition-all">
                <div className="p-4 sm:p-6 border-b border-white/5 flex items-center justify-between">
                  <h2 className="text-lg sm:text-xl font-semibold flex items-center gap-2"><Eye className="w-5 h-5 text-neon-purple" />Rooms Overview</h2>
                  <Button variant="ghost" size="sm" onClick={() => setActiveTab("rooms")}>View All</Button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b border-white/5 text-muted-foreground"><th className="text-left p-4">Room</th><th className="text-left p-4">Category</th><th className="text-left p-4">Price/Hour</th><th className="text-left p-4">Status</th></tr></thead>
                    <tbody>
                      {rooms.slice(0, 5).map((room) => (
                        <tr key={room._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="p-4 font-medium">{room.name}</td>
                          <td className="p-4"><Badge variant="neon" className="text-xs">{categoryLabels[room.category] || room.category}</Badge></td>
                          <td className="p-4">{formatPrice(room.pricePerHour)}</td>
                          <td className="p-4"><Badge variant={room.isAvailable ? "success" : "destructive"} className="text-xs">{room.isAvailable ? "Available" : "Unavailable"}</Badge></td>
                        </tr>
                      ))}
                      {rooms.length === 0 && <tr><td colSpan={4} className="text-center py-12 text-muted-foreground">No rooms found</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass-card p-4 sm:p-6 border border-white/10 hover:border-neon-cyan/20 transition-all">
              <h2 className="text-lg sm:text-xl font-semibold mb-4 flex items-center gap-2"><Zap className="w-5 h-5 text-neon-yellow" />Quick Actions</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {[
                  { label: "Export Report", icon: Download, action: exportToCSV, color: "text-neon-cyan", bg: "hover:bg-neon-cyan/10" },
                  { label: "Print Data", icon: Printer, action: handlePrint, color: "text-neon-purple", bg: "hover:bg-neon-purple/10" },
                  { label: "Refresh Data", icon: RefreshCw, action: fetchAllData, color: "text-green-400", bg: "hover:bg-green-400/10" },
                  { label: "Add New Room", icon: Plus, action: () => setShowRoomForm(true), color: "text-neon-pink", bg: "hover:bg-neon-pink/10" },
                  { label: "Voice Search", icon: Mic, action: () => setShowVoiceSearch(true), color: "text-yellow-400", bg: "hover:bg-yellow-400/10" },
                  { label: "Shortcuts", icon: Keyboard, action: () => setShowShortcuts(true), color: "text-blue-400", bg: "hover:bg-blue-400/10" },
                ].map((action, i) => (
                  <motion.button key={i} onClick={action.action} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    className={`flex flex-col items-center gap-2 p-3 sm:p-4 rounded-xl bg-white/5 ${action.bg} transition-all group border border-white/5 hover:border-white/10`}>
                    <action.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${action.color} group-hover:scale-110 transition-transform`} />
                    <span className="text-[10px] sm:text-xs font-medium text-center">{action.label}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </TabsContent>

          {/* Bookings Tab */}
          <TabsContent value="bookings">
            <div className="glass-card overflow-hidden border border-white/10 hover:border-neon-cyan/20 transition-all">
              <div className="p-4 sm:p-6 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-lg sm:text-xl font-semibold flex items-center gap-2"><Bookmark className="w-5 h-5 text-neon-cyan" />All Bookings ({filteredBookings.length})</h2>
                <div className="flex items-center gap-2">
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} className="h-9 rounded-lg border border-input bg-background px-3 text-sm focus-visible:ring-2 focus-visible:ring-neon-cyan/50">
                    <option value="date">Sort by Date</option>
                    <option value="amount">Sort by Amount</option>
                    <option value="status">Sort by Status</option>
                  </select>
                  <Button variant="outline" size="sm" onClick={exportToCSV} className="gap-2 hidden sm:flex hover:border-neon-cyan/50"><Download className="w-4 h-4" />Export</Button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-white/5 text-muted-foreground"><th className="text-left p-4">User</th><th className="text-left p-4">Room</th><th className="text-left p-4">Date</th><th className="text-left p-4">Time</th><th className="text-left p-4">Amount</th><th className="text-left p-4">Status</th><th className="text-left p-4">Payment</th><th className="text-left p-4">Actions</th></tr></thead>
                  <tbody>
                    {paginatedBookings.map((booking) => (
                      <tr key={booking._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="p-4"><div className="font-medium">{booking.user?.name}</div><div className="text-xs text-muted-foreground">{booking.user?.email}</div></td>
                        <td className="p-4">{booking.room?.name}</td>
                        <td className="p-4">{formatDate(booking.date)}</td>
                        <td className="p-4 text-xs">{booking.startTime} - {booking.endTime}</td>
                        <td className="p-4 font-medium">{formatPrice(booking.totalAmount)}</td>
                        <td className="p-4"><Badge variant={booking.status === "confirmed" ? "success" : booking.status === "cancelled" ? "destructive" : "warning"}>{booking.status}</Badge></td>
                        <td className="p-4"><Badge variant={booking.paymentStatus === "paid" ? "success" : "secondary"}>{booking.paymentStatus}</Badge></td>
                        <td className="p-4">{booking.status === "cancelled" && booking.paymentStatus === "paid" && (
                          <Button variant="ghost" size="sm" onClick={() => handleRefund(booking._id)} className="text-yellow-400 hover:text-yellow-300 hover:bg-yellow-400/10">Refund</Button>
                        )}</td>
                      </tr>
                    ))}
                    {paginatedBookings.length === 0 && <tr><td colSpan={8} className="text-center py-12 text-muted-foreground">{searchQuery ? "No bookings match your search" : "No bookings found"}</td></tr>}
                  </tbody>
                </table>
              </div>
              {totalPages > 1 && (
                <div className="p-4 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <p className="text-sm text-muted-foreground">Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, sortedBookings.length)} of {sortedBookings.length} bookings</p>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="hover:border-neon-cyan/50"><ChevronLeft className="w-4 h-4" /></Button>
                    <span className="text-sm px-3">{currentPage} / {totalPages}</span>
                    <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="hover:border-neon-cyan/50"><ChevronRight className="w-4 h-4" /></Button>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Rooms Tab */}
          <TabsContent value="rooms">
            <div className="glass-card overflow-hidden border border-white/10 hover:border-neon-purple/20 transition-all">
              <div className="p-4 sm:p-6 border-b border-white/5 flex items-center justify-between">
                <h2 className="text-lg sm:text-xl font-semibold flex items-center gap-2"><Eye className="w-5 h-5 text-neon-purple" />All Rooms ({filteredRooms.length})</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-white/5 text-muted-foreground"><th className="text-left p-4">Room</th><th className="text-left p-4">Category</th><th className="text-left p-4">City</th><th className="text-left p-4">Price/Hour</th><th className="text-left p-4">Price/Day</th><th className="text-left p-4">Capacity</th><th className="text-left p-4">Status</th><th className="text-left p-4">Actions</th></tr></thead>
                  <tbody>
                    {filteredRooms.map((room) => (
                      <tr key={room._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center overflow-hidden flex-shrink-0 border border-white/10">
                              {room.images?.[0] ? <img src={room.images[0]} alt={room.name} className="w-full h-full object-cover" /> : <ImageIcon className="w-4 h-4 text-muted-foreground" />}
                            </div>
                            <div className="min-w-0"><div className="font-medium truncate">{room.name}</div><div className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" />{room.address}</div></div>
                          </div>
                        </td>
                        <td className="p-4"><Badge variant="neon" className="text-xs">{categoryLabels[room.category] || room.category}</Badge></td>
                        <td className="p-4">{room.city}</td>
                        <td className="p-4 font-medium">{formatPrice(room.pricePerHour)}</td>
                        <td className="p-4">{formatPrice(room.pricePerDay)}</td>
                        <td className="p-4">{room.capacity} people</td>
                        <td className="p-4">
                          <div className="flex flex-col gap-1">
                            <Badge variant={room.isAvailable ? "success" : "destructive"} className="text-xs w-fit">{room.isAvailable ? "Available" : "Unavailable"}</Badge>
                            {room.featured && <Badge variant="success" className="text-xs w-fit"><Star className="w-3 h-3 mr-1" />Featured</Badge>}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" onClick={() => setEditingRoom(room)} className="text-neon-cyan hover:text-neon-cyan/80 hover:bg-neon-cyan/10"><Pencil className="w-4 h-4" /></Button>
                            <Button variant="ghost" size="sm" onClick={() => setDeleteConfirm(room._id)} className="text-destructive hover:text-destructive/80 hover:bg-red-500/10"><Trash2 className="w-4 h-4" /></Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredRooms.length === 0 && <tr><td colSpan={8} className="text-center py-12 text-muted-foreground">{searchQuery ? "No rooms match your search" : "No rooms found"}</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-muted-foreground">Chart Type:</span>
              {(["bar", "line", "pie"] as const).map((type) => (
                <button key={type} onClick={() => setChartType(type)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${chartType === type ? "bg-gradient-to-r from-neon-cyan/20 to-neon-purple/20 text-neon-cyan border border-neon-cyan/20" : "bg-white/5 text-muted-foreground hover:bg-white/10 border border-white/5"}`}>{type.charAt(0).toUpperCase() + type.slice(1)}</button>
              ))}
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-4 sm:p-6 border border-white/10 hover:border-neon-cyan/20 transition-all">
                <h3 className="text-base sm:text-lg font-semibold mb-4 flex items-center gap-2"><DollarSign className="w-5 h-5 text-neon-cyan" />Revenue Overview</h3>
                <div className="h-48 flex items-end justify-around gap-2">
                  {[65, 45, 80, 55, 90, 70, 85, 60, 75, 50, 95, 72].map((h, i) => (
                    <motion.div key={i} initial={{ height: 0 }} animate={{ height: `${h}%` }} transition={{ delay: i * 0.05, type: "spring", damping: 10 }}
                      className={`w-full rounded-t-lg ${chartType === "bar" ? "bg-gradient-to-t from-neon-cyan/60 to-neon-cyan" : chartType === "line" ? "bg-gradient-to-t from-neon-purple/60 to-neon-purple" : "bg-gradient-to-t from-neon-pink/60 to-neon-pink"}`} />
                  ))}
                </div>
                <div className="flex justify-between mt-2 text-xs text-muted-foreground"><span>Jan</span><span>Dec</span></div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-4 sm:p-6 border border-white/10 hover:border-neon-purple/20 transition-all">
                <h3 className="text-base sm:text-lg font-semibold mb-4 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-neon-purple" />Booking Trends</h3>
                <div className="h-48 flex items-end justify-around gap-2">
                  {[40, 60, 30, 80, 50, 90, 45, 70, 55, 85, 65, 75].map((h, i) => (
                    <motion.div key={i} initial={{ height: 0 }} animate={{ height: `${h}%` }} transition={{ delay: i * 0.05, type: "spring", damping: 10 }}
                      className="w-full rounded-t-lg bg-gradient-to-t from-neon-purple/60 to-neon-purple" />
                  ))}
                </div>
                <div className="flex justify-between mt-2 text-xs text-muted-foreground"><span>Jan</span><span>Dec</span></div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-4 sm:p-6 border border-white/10 hover:border-neon-pink/20 transition-all">
                <h3 className="text-base sm:text-lg font-semibold mb-4 flex items-center gap-2"><BarChart3 className="w-5 h-5 text-neon-pink" />Category Distribution</h3>
                <div className="space-y-3">
                  {["Podcast", "YouTube", "Music", "Photo", "Gaming", "Coworking"].map((cat, i) => {
                    const pct = [30, 25, 20, 10, 8, 7][i];
                    return (
                      <div key={cat}>
                        <div className="flex justify-between text-sm mb-1"><span>{cat}</span><span className="text-muted-foreground">{pct}%</span></div>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ delay: i * 0.1, duration: 0.5 }}
                            className={`h-full rounded-full ${i === 0 ? "bg-neon-cyan" : i === 1 ? "bg-neon-purple" : i === 2 ? "bg-neon-pink" : i === 3 ? "bg-green-400" : i === 4 ? "bg-yellow-400" : "bg-blue-400"}`} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-4 sm:p-6 border border-white/10 hover:border-green-400/20 transition-all">
                <h3 className="text-base sm:text-lg font-semibold mb-4 flex items-center gap-2"><CheckCircle className="w-5 h-5 text-green-400" />Performance Metrics</h3>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "Avg Response", value: "2.3s", icon: Zap, color: "text-neon-cyan" },
                    { label: "Uptime", value: "99.9%", icon: CheckCircle, color: "text-green-400" },
                    { label: "Satisfaction", value: "4.8/5", icon: Star, color: "text-yellow-400" },
                    { label: "Conversion", value: "3.2%", icon: TrendingUp, color: "text-neon-purple" },
                  ].map((metric, i) => (
                    <div key={i} className="p-4 rounded-xl bg-white/5 text-center border border-white/5 hover:border-white/10 transition-all">
                      <metric.icon className={`w-6 h-6 ${metric.color} mx-auto mb-2`} />
                      <p className="text-xl font-bold">{metric.value}</p>
                      <p className="text-xs text-muted-foreground">{metric.label}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </TabsContent>
        </Tabs>

        {/* ─── Add Room Dialog ─────────────────────── */}
        <Dialog open={showRoomForm} onOpenChange={setShowRoomForm}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto glass-card border-neon-cyan/20">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center">
                  <Plus className="w-4 h-4 text-white" />
                </div>
                Add New Room
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateRoom} className="space-y-5 mt-4">
              <RoomFormFields />
              <div className="border-t border-white/10 pt-4">
                <RoomImageUploader slots={imageSlots} onSlotsChange={setImageSlots} />
              </div>
              <Button type="submit" variant="neon" className="w-full hover:shadow-[0_0_30px_rgba(0,245,212,0.3)] transition-all" disabled={submitting}>
                {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                Create Room
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        {/* ─── Edit Room Dialog ────────────────────── */}
        <Dialog open={!!editingRoom} onOpenChange={() => setEditingRoom(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto glass-card border-neon-purple/20">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-neon-purple to-neon-pink flex items-center justify-center">
                  <Pencil className="w-4 h-4 text-white" />
                </div>
                Edit Room
              </DialogTitle>
            </DialogHeader>
            {editingRoom && (
              <form onSubmit={handleUpdateRoom} className="space-y-5 mt-4">
                <RoomFormFields room={editingRoom} />
                <div className="border-t border-white/10 pt-4">
                  <RoomImageUploader slots={editImageSlots} onSlotsChange={setEditImageSlots} />
                </div>
                <div className="flex items-center gap-2 p-3 rounded-lg bg-white/5 border border-white/10">
                  <input type="checkbox" name="isAvailable" id="isAvailable" defaultChecked={editingRoom.isAvailable} className="w-4 h-4 rounded accent-neon-cyan" />
                  <label htmlFor="isAvailable" className="text-sm font-medium">Available for booking</label>
                </div>
                <Button type="submit" variant="neon" className="w-full hover:shadow-[0_0_30px_rgba(155,93,229,0.3)] transition-all" disabled={submitting}>
                  {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Pencil className="w-4 h-4 mr-2" />}
                  Update Room
                </Button>
              </form>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Room Dialog */}
        <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
          <DialogContent className="max-w-sm glass-card border-red-500/20">
            <DialogHeader><DialogTitle className="flex items-center gap-2 text-destructive"><AlertTriangle className="w-5 h-5" />Delete Room</DialogTitle></DialogHeader>
            <p className="text-sm text-muted-foreground">Are you sure? This action cannot be undone.</p>
            <div className="flex gap-3 mt-4">
              <Button variant="outline" className="flex-1 hover:border-white/20" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
              <Button variant="destructive" className="flex-1 hover:shadow-[0_0_20px_rgba(239,68,68,0.3)]" onClick={() => deleteConfirm && handleDeleteRoom(deleteConfirm)} disabled={deleteLoading}>
                {deleteLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
                Delete
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Shortcuts Dialog */}
        <ShortcutsDialog open={showShortcuts} onClose={() => setShowShortcuts(false)} />
      </div>
    </main>
  );
}

// ─── Room Form Fields ─────────────────────────────────
function RoomFormFields({ room }: { room?: Room }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-sm font-semibold flex items-center gap-1.5"><Star className="w-3.5 h-3.5 text-neon-cyan" />Room Name</label>
          <input name="name" required defaultValue={room?.name} placeholder="e.g., Professional Podcast Studio"
            className="w-full h-10 rounded-lg border border-input bg-background/80 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan/50 transition-all" />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-semibold flex items-center gap-1.5"><Compass className="w-3.5 h-3.5 text-neon-purple" />Slug</label>
          <input name="slug" required defaultValue={room?.slug} placeholder="e.g., podcast-studio"
            className="w-full h-10 rounded-lg border border-input bg-background/80 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-purple/50 transition-all" />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-sm font-semibold flex items-center gap-1.5"><Info className="w-3.5 h-3.5 text-neon-pink" />Description</label>
        <textarea name="description" required rows={3} defaultValue={room?.description} placeholder="Describe the room, its features, and what creators can expect..."
          className="w-full rounded-lg border border-input bg-background/80 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-pink/50 transition-all resize-none" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-sm font-semibold flex items-center gap-1.5"><Layers className="w-3.5 h-3.5 text-neon-cyan" />Category</label>
          <select name="category" required defaultValue={room?.category || "podcast"}
            className="w-full h-10 rounded-lg border border-input bg-background/80 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan/50 transition-all">
            {Object.entries(categoryLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-sm font-semibold flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-neon-purple" />City</label>
          <input name="city" defaultValue={room?.city || "Patna"} required
            className="w-full h-10 rounded-lg border border-input bg-background/80 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-purple/50 transition-all" />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-sm font-semibold flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-neon-pink" />Address</label>
        <input name="address" required defaultValue={room?.address} placeholder="Full address with landmark"
          className="w-full h-10 rounded-lg border border-input bg-background/80 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-pink/50 transition-all" />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-semibold flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-neon-yellow" />Equipment (comma-separated)</label>
        <input name="equipment" defaultValue={room?.equipment?.join(", ")} placeholder="Microphone, Camera, LED Lights, Green Screen, Mixer"
          className="w-full h-10 rounded-lg border border-input bg-background/80 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-yellow/50 transition-all" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-1">
          <label className="text-sm font-semibold flex items-center gap-1.5"><DollarSign className="w-3.5 h-3.5 text-green-400" />Price/Hour (₹)</label>
          <input name="pricePerHour" type="number" required defaultValue={room?.pricePerHour} placeholder="500"
            className="w-full h-10 rounded-lg border border-input bg-background/80 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400/50 transition-all" />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-semibold flex items-center gap-1.5"><DollarSign className="w-3.5 h-3.5 text-neon-cyan" />Price/Day (₹)</label>
          <input name="pricePerDay" type="number" required defaultValue={room?.pricePerDay} placeholder="3000"
            className="w-full h-10 rounded-lg border border-input bg-background/80 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan/50 transition-all" />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-semibold flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-neon-purple" />Capacity</label>
          <input name="capacity" type="number" required defaultValue={room?.capacity} placeholder="5"
            className="w-full h-10 rounded-lg border border-input bg-background/80 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-purple/50 transition-all" />
        </div>
      </div>

      <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
        <input type="checkbox" name="featured" id="featured" defaultChecked={room?.featured} className="w-4 h-4 rounded accent-neon-cyan" />
        <label htmlFor="featured" className="text-sm font-medium flex items-center gap-1.5"><Sparkles className="w-4 h-4 text-neon-yellow" />Featured room (show on homepage)</label>
      </div>

      <div className="space-y-1">
        <label className="text-sm font-semibold flex items-center gap-1.5"><Globe className="w-3.5 h-3.5 text-blue-400" />Map Link (optional)</label>
        <input name="mapLink" defaultValue={room?.mapLink} placeholder="https://maps.google.com/..."
          className="w-full h-10 rounded-lg border border-input bg-background/80 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/50 transition-all" />
      </div>
    </div>
  );
}
