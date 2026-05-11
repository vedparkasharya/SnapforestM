"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Plus,
  Users,
  DollarSign,
  TrendingUp,
  BarChart3,
  Trash2,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatPrice, formatDate } from "@/lib/utils";

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
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRoomForm, setShowRoomForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    } else if (status === "authenticated" && (session?.user as any)?.role !== "admin") {
      router.push("/");
    }
  }, [status, session, router]);

  useEffect(() => {
    if (session?.user && (session?.user as any)?.role === "admin") {
      fetchData();
    }
  }, [session]);

  const fetchData = async () => {
    try {
      const [bookingsRes, statsRes] = await Promise.all([
        fetch("/api/admin/bookings"),
        fetch("/api/admin/revenue"),
      ]);
      const bookingsData = await bookingsRes.json();
      const statsData = await statsRes.json();
      if (bookingsData.success) setBookings(bookingsData.data);
      if (statsData.success) setStats(statsData.data);
    } catch (error) {
      console.error("Error fetching admin data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRoom = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      slug: formData.get("slug") as string,
      description: formData.get("description") as string,
      category: formData.get("category") as string,
      city: formData.get("city") as string,
      address: formData.get("address") as string,
      images: [formData.get("image") as string],
      equipment: (formData.get("equipment") as string).split(",").map(s => s.trim()).filter(Boolean),
      pricePerHour: Number(formData.get("pricePerHour")),
      pricePerDay: Number(formData.get("pricePerDay")),
      capacity: Number(formData.get("capacity")),
      mapLink: formData.get("mapLink") as string,
    };

    try {
      const res = await fetch("/api/admin/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (result.success) {
        setShowRoomForm(false);
        alert("Room created successfully!");
      } else {
        alert(result.message || "Failed to create room");
      }
    } catch (error) {
      console.error("Error creating room:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRefund = async (bookingId: string) => {
    if (!confirm("Process refund for this booking?")) return;
    try {
      const res = await fetch("/api/admin/bookings/refund", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId }),
      });
      const data = await res.json();
      if (data.success) {
        fetchData();
      }
    } catch (error) {
      console.error("Refund error:", error);
    }
  };

  if (status === "loading" || loading) {
    return (
      <main className="min-h-screen pt-24 px-4">
        <div className="max-w-7xl mx-auto space-y-6">
          <Skeleton className="h-10 w-48" />
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))}
          </div>
        </div>
      </main>
    );
  }

  if ((session?.user as any)?.role !== "admin") return null;

  return (
    <main className="min-h-screen pt-24 px-4 pb-12">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">
            Admin <span className="text-neon-cyan">Dashboard</span>
          </h1>
          <Button variant="neon" onClick={() => setShowRoomForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Room
          </Button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Total Bookings", value: stats.totalBookings, icon: Users, color: "text-neon-cyan" },
              { label: "Total Revenue", value: formatPrice(stats.totalRevenue), icon: DollarSign, color: "text-green-400" },
              { label: "Pending Refunds", value: stats.pendingRefunds, icon: TrendingUp, color: "text-yellow-400" },
              { label: "Occupancy Rate", value: `${stats.occupancyRate}%`, icon: BarChart3, color: "text-neon-purple" },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-5"
              >
                <div className="flex items-center justify-between">
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  <span className="text-2xl font-bold">{stat.value}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        )}

        {/* Bookings Table */}
        <div className="glass-card overflow-hidden">
          <div className="p-6 border-b border-white/5">
            <h2 className="text-xl font-semibold">All Bookings</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 text-muted-foreground">
                  <th className="text-left p-4">User</th>
                  <th className="text-left p-4">Room</th>
                  <th className="text-left p-4">Date</th>
                  <th className="text-left p-4">Amount</th>
                  <th className="text-left p-4">Status</th>
                  <th className="text-left p-4">Payment</th>
                  <th className="text-left p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking._id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="p-4">
                      <div className="font-medium">{booking.user?.name}</div>
                      <div className="text-xs text-muted-foreground">{booking.user?.email}</div>
                    </td>
                    <td className="p-4">{booking.room?.name}</td>
                    <td className="p-4">{formatDate(booking.date)}</td>
                    <td className="p-4 font-medium">{formatPrice(booking.totalAmount)}</td>
                    <td className="p-4">
                      <Badge variant={booking.status === "confirmed" ? "success" : booking.status === "cancelled" ? "destructive" : "warning"}>
                        {booking.status}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <Badge variant={booking.paymentStatus === "paid" ? "success" : "secondary"}>
                        {booking.paymentStatus}
                      </Badge>
                    </td>
                    <td className="p-4">
                      {booking.status === "cancelled" && booking.paymentStatus === "paid" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRefund(booking._id)}
                          className="text-yellow-400 hover:text-yellow-300"
                        >
                          Refund
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
                {bookings.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-muted-foreground">
                      No bookings found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Room Form Dialog */}
        <Dialog open={showRoomForm} onOpenChange={setShowRoomForm}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Room</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateRoom} className="space-y-4 mt-4">
              <div>
                <label className="text-sm font-medium">Room Name</label>
                <input name="name" required className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">Slug (URL-friendly)</label>
                <input name="slug" required placeholder="e.g., podcast-studio-boring-road" className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <textarea name="description" required rows={3} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm mt-1" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">Category</label>
                  <select name="category" required className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm mt-1">
                    <option value="podcast">Podcast</option>
                    <option value="youtube">YouTube</option>
                    <option value="music">Music</option>
                    <option value="photography">Photography</option>
                    <option value="dance">Dance</option>
                    <option value="coworking">Coworking</option>
                    <option value="gaming">Gaming</option>
                    <option value="streaming">Streaming</option>
                    <option value="meeting">Meeting</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">City</label>
                  <input name="city" defaultValue="Patna" required className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm mt-1" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Address</label>
                <input name="address" required className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">Image URL</label>
                <input name="image" required placeholder="https://..." className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">Equipment (comma-separated)</label>
                <input name="equipment" placeholder="WiFi, Microphone, Camera, LED Lights" className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm mt-1" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-sm font-medium">Price/Hour</label>
                  <input name="pricePerHour" type="number" required min="0" className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium">Price/Day</label>
                  <input name="pricePerDay" type="number" required min="0" className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium">Capacity</label>
                  <input name="capacity" type="number" required min="1" className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm mt-1" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Google Maps Link</label>
                <input name="mapLink" placeholder="https://maps.google.com/..." className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm mt-1" />
              </div>
              <Button type="submit" variant="neon" className="w-full" disabled={submitting}>
                {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Create Room
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </main>
  );
}
