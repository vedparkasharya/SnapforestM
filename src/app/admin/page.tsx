"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Users,
  DollarSign,
  TrendingUp,
  BarChart3,
  Trash2,
  Loader2,
  Pencil,
  X,
  ImageIcon,
  MapPin,
  Star,
  Search,
  RefreshCw,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

export default function AdminPage() {
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

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [bookingsRes, statsRes, roomsRes] = await Promise.all([
        fetch("/api/admin/bookings"),
        fetch("/api/admin/revenue"),
        fetch("/api/admin/rooms"),
      ]);
      const bookingsData = await bookingsRes.json();
      const statsData = await statsRes.json();
      const roomsData = await roomsRes.json();

      if (bookingsData.success) setBookings(bookingsData.data);
      if (statsData.success) setStats(statsData.data);
      if (roomsData.success) setRooms(roomsData.data);
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
    const images = (formData.get("images") as string)
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const data = {
      name: formData.get("name") as string,
      slug: formData.get("slug") as string,
      description: formData.get("description") as string,
      category: formData.get("category") as string,
      city: formData.get("city") as string,
      address: formData.get("address") as string,
      images: images.length > 0 ? images : ["/rooms/exterior-main.jpg"],
      equipment: (formData.get("equipment") as string)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      pricePerHour: Number(formData.get("pricePerHour")),
      pricePerDay: Number(formData.get("pricePerDay")),
      capacity: Number(formData.get("capacity")),
      featured: formData.get("featured") === "on",
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
        fetchAllData();
      } else {
        alert(result.message || "Failed to create room");
      }
    } catch (error) {
      console.error("Error creating room:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateRoom = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingRoom) return;
    setSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const images = (formData.get("images") as string)
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const data = {
      name: formData.get("name") as string,
      slug: formData.get("slug") as string,
      description: formData.get("description") as string,
      category: formData.get("category") as string,
      city: formData.get("city") as string,
      address: formData.get("address") as string,
      images: images.length > 0 ? images : editingRoom.images,
      equipment: (formData.get("equipment") as string)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      pricePerHour: Number(formData.get("pricePerHour")),
      pricePerDay: Number(formData.get("pricePerDay")),
      capacity: Number(formData.get("capacity")),
      featured: formData.get("featured") === "on",
      isAvailable: formData.get("isAvailable") === "on",
      mapLink: formData.get("mapLink") as string,
    };

    try {
      const res = await fetch(`/api/admin/rooms/${editingRoom._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (result.success) {
        setEditingRoom(null);
        fetchAllData();
      } else {
        alert(result.message || "Failed to update room");
      }
    } catch (error) {
      console.error("Error updating room:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteRoom = async (roomId: string) => {
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/admin/rooms/${roomId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setDeleteConfirm(null);
        fetchAllData();
      } else {
        alert(data.message || "Failed to delete room");
      }
    } catch (error) {
      console.error("Delete error:", error);
    } finally {
      setDeleteLoading(false);
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
        fetchAllData();
      }
    } catch (error) {
      console.error("Refund error:", error);
    }
  };

  const filteredBookings = bookings.filter(
    (b) =>
      b.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.room?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.status?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredRooms = rooms.filter(
    (r) =>
      r.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.city?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
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

  return (
    <main className="min-h-screen pt-24 px-4 pb-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-neon-cyan/10">
              <Shield className="w-6 h-6 text-neon-cyan" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">
                Admin <span className="text-neon-cyan">Dashboard</span>
              </h1>
              <p className="text-sm text-muted-foreground">
                Manage rooms, bookings, and analytics
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchAllData}
              className="gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
            <Button variant="neon" size="sm" onClick={() => setShowRoomForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Room
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              {
                label: "Total Bookings",
                value: stats.totalBookings,
                icon: Users,
                color: "text-neon-cyan",
              },
              {
                label: "Total Revenue",
                value: formatPrice(stats.totalRevenue),
                icon: DollarSign,
                color: "text-green-400",
              },
              {
                label: "Pending Refunds",
                value: stats.pendingRefunds,
                icon: TrendingUp,
                color: "text-yellow-400",
              },
              {
                label: "Occupancy Rate",
                value: `${stats.occupancyRate}%`,
                icon: BarChart3,
                color: "text-neon-purple",
              },
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
                <p className="text-sm text-muted-foreground mt-2">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>
        )}

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search bookings, rooms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-lg border border-input bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white/5 mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="bookings">
              Bookings ({filteredBookings.length})
            </TabsTrigger>
            <TabsTrigger value="rooms">
              Rooms ({filteredRooms.length})
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Recent Bookings */}
            <div className="glass-card overflow-hidden">
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <h2 className="text-xl font-semibold">Recent Bookings</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveTab("bookings")}
                >
                  View All
                </Button>
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
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.slice(0, 5).map((booking) => (
                      <tr
                        key={booking._id}
                        className="border-b border-white/5 hover:bg-white/5"
                      >
                        <td className="p-4">
                          <div className="font-medium">
                            {booking.user?.name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {booking.user?.email}
                          </div>
                        </td>
                        <td className="p-4">{booking.room?.name}</td>
                        <td className="p-4">{formatDate(booking.date)}</td>
                        <td className="p-4 font-medium">
                          {formatPrice(booking.totalAmount)}
                        </td>
                        <td className="p-4">
                          <Badge
                            variant={
                              booking.status === "confirmed"
                                ? "success"
                                : booking.status === "cancelled"
                                ? "destructive"
                                : "warning"
                            }
                          >
                            {booking.status}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <Badge
                            variant={
                              booking.paymentStatus === "paid"
                                ? "success"
                                : "secondary"
                            }
                          >
                            {booking.paymentStatus}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                    {bookings.length === 0 && (
                      <tr>
                        <td
                          colSpan={6}
                          className="text-center py-12 text-muted-foreground"
                        >
                          No bookings found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Room Quick View */}
            <div className="glass-card overflow-hidden">
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <h2 className="text-xl font-semibold">Rooms</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveTab("rooms")}
                >
                  View All
                </Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/5 text-muted-foreground">
                      <th className="text-left p-4">Room</th>
                      <th className="text-left p-4">Category</th>
                      <th className="text-left p-4">Price/Hour</th>
                      <th className="text-left p-4">Status</th>
                      <th className="text-left p-4">Featured</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rooms.slice(0, 5).map((room) => (
                      <tr
                        key={room._id}
                        className="border-b border-white/5 hover:bg-white/5"
                      >
                        <td className="p-4 font-medium">{room.name}</td>
                        <td className="p-4">
                          <Badge variant="neon" className="text-xs">
                            {categoryLabels[room.category] || room.category}
                          </Badge>
                        </td>
                        <td className="p-4">
                          {formatPrice(room.pricePerHour)}
                        </td>
                        <td className="p-4">
                          <Badge
                            variant={
                              room.isAvailable ? "success" : "destructive"
                            }
                            className="text-xs"
                          >
                            {room.isAvailable ? "Available" : "Unavailable"}
                          </Badge>
                        </td>
                        <td className="p-4">
                          {room.featured ? (
                            <Badge
                              variant="success"
                              className="text-xs"
                            >
                              Yes
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-xs">
                              No
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {rooms.length === 0 && (
                      <tr>
                        <td
                          colSpan={5}
                          className="text-center py-12 text-muted-foreground"
                        >
                          No rooms found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* Bookings Tab */}
          <TabsContent value="bookings">
            <div className="glass-card overflow-hidden">
              <div className="p-6 border-b border-white/5">
                <h2 className="text-xl font-semibold">
                  All Bookings ({filteredBookings.length})
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/5 text-muted-foreground">
                      <th className="text-left p-4">User</th>
                      <th className="text-left p-4">Room</th>
                      <th className="text-left p-4">Date</th>
                      <th className="text-left p-4">Time</th>
                      <th className="text-left p-4">Amount</th>
                      <th className="text-left p-4">Status</th>
                      <th className="text-left p-4">Payment</th>
                      <th className="text-left p-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBookings.map((booking) => (
                      <tr
                        key={booking._id}
                        className="border-b border-white/5 hover:bg-white/5"
                      >
                        <td className="p-4">
                          <div className="font-medium">
                            {booking.user?.name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {booking.user?.email}
                          </div>
                        </td>
                        <td className="p-4">{booking.room?.name}</td>
                        <td className="p-4">{formatDate(booking.date)}</td>
                        <td className="p-4 text-xs">
                          {booking.startTime} - {booking.endTime}
                        </td>
                        <td className="p-4 font-medium">
                          {formatPrice(booking.totalAmount)}
                        </td>
                        <td className="p-4">
                          <Badge
                            variant={
                              booking.status === "confirmed"
                                ? "success"
                                : booking.status === "cancelled"
                                ? "destructive"
                                : "warning"
                            }
                          >
                            {booking.status}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <Badge
                            variant={
                              booking.paymentStatus === "paid"
                                ? "success"
                                : "secondary"
                            }
                          >
                            {booking.paymentStatus}
                          </Badge>
                        </td>
                        <td className="p-4">
                          {booking.status === "cancelled" &&
                            booking.paymentStatus === "paid" && (
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
                    {filteredBookings.length === 0 && (
                      <tr>
                        <td
                          colSpan={8}
                          className="text-center py-12 text-muted-foreground"
                        >
                          {searchQuery
                            ? "No bookings match your search"
                            : "No bookings found"}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* Rooms Tab */}
          <TabsContent value="rooms">
            <div className="glass-card overflow-hidden">
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <h2 className="text-xl font-semibold">
                  All Rooms ({filteredRooms.length})
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/5 text-muted-foreground">
                      <th className="text-left p-4">Room</th>
                      <th className="text-left p-4">Category</th>
                      <th className="text-left p-4">City</th>
                      <th className="text-left p-4">Price/Hour</th>
                      <th className="text-left p-4">Price/Day</th>
                      <th className="text-left p-4">Capacity</th>
                      <th className="text-left p-4">Status</th>
                      <th className="text-left p-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRooms.map((room) => (
                      <tr
                        key={room._id}
                        className="border-b border-white/5 hover:bg-white/5"
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center overflow-hidden">
                              {room.images?.[0] ? (
                                <img
                                  src={room.images[0]}
                                  alt={room.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <ImageIcon className="w-4 h-4 text-muted-foreground" />
                              )}
                            </div>
                            <div>
                              <div className="font-medium">{room.name}</div>
                              <div className="text-xs text-muted-foreground flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {room.address}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge variant="neon" className="text-xs">
                            {categoryLabels[room.category] || room.category}
                          </Badge>
                        </td>
                        <td className="p-4">{room.city}</td>
                        <td className="p-4 font-medium">
                          {formatPrice(room.pricePerHour)}
                        </td>
                        <td className="p-4">
                          {formatPrice(room.pricePerDay)}
                        </td>
                        <td className="p-4">{room.capacity} people</td>
                        <td className="p-4">
                          <div className="flex flex-col gap-1">
                            <Badge
                              variant={
                                room.isAvailable ? "success" : "destructive"
                              }
                              className="text-xs w-fit"
                            >
                              {room.isAvailable ? "Available" : "Unavailable"}
                            </Badge>
                            {room.featured && (
                              <Badge
                                variant="success"
                                className="text-xs w-fit"
                              >
                                <Star className="w-3 h-3 mr-1" />
                                Featured
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingRoom(room)}
                              className="text-neon-cyan hover:text-neon-cyan/80"
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeleteConfirm(room._id)}
                              className="text-destructive hover:text-destructive/80"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredRooms.length === 0 && (
                      <tr>
                        <td
                          colSpan={8}
                          className="text-center py-12 text-muted-foreground"
                        >
                          {searchQuery
                            ? "No rooms match your search"
                            : "No rooms found"}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Add Room Dialog */}
        <Dialog open={showRoomForm} onOpenChange={setShowRoomForm}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Room</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateRoom} className="space-y-4 mt-4">
              <RoomFormFields />
              <Button
                type="submit"
                variant="neon"
                className="w-full"
                disabled={submitting}
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4 mr-2" />
                )}
                Create Room
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Room Dialog */}
        <Dialog
          open={!!editingRoom}
          onOpenChange={() => setEditingRoom(null)}
        >
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Room</DialogTitle>
            </DialogHeader>
            {editingRoom && (
              <form
                onSubmit={handleUpdateRoom}
                className="space-y-4 mt-4"
              >
                <RoomFormFields room={editingRoom} />
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="isAvailable"
                    id="isAvailable"
                    defaultChecked={editingRoom.isAvailable}
                    className="w-4 h-4 rounded"
                  />
                  <label htmlFor="isAvailable" className="text-sm">
                    Available for booking
                  </label>
                </div>
                <Button
                  type="submit"
                  variant="neon"
                  className="w-full"
                  disabled={submitting}
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Pencil className="w-4 h-4 mr-2" />
                  )}
                  Update Room
                </Button>
              </form>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Delete Room</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete this room? This action cannot be
              undone.
            </p>
            <div className="flex gap-3 mt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setDeleteConfirm(null)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={() => deleteConfirm && handleDeleteRoom(deleteConfirm)}
                disabled={deleteLoading}
              >
                {deleteLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4 mr-2" />
                )}
                Delete
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </main>
  );
}

// Room Form Fields Component
function RoomFormFields({ room }: { room?: Room }) {
  return (
    <>
      <div>
        <label className="text-sm font-medium">Room Name</label>
        <input
          name="name"
          required
          defaultValue={room?.name}
          className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm mt-1"
        />
      </div>
      <div>
        <label className="text-sm font-medium">Slug (URL-friendly)</label>
        <input
          name="slug"
          required
          defaultValue={room?.slug}
          placeholder="e.g., podcast-studio-boring-road"
          className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm mt-1"
        />
      </div>
      <div>
        <label className="text-sm font-medium">Description</label>
        <textarea
          name="description"
          required
          rows={3}
          defaultValue={room?.description}
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm mt-1"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium">Category</label>
          <select
            name="category"
            required
            defaultValue={room?.category || "podcast"}
            className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm mt-1"
          >
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
          <input
            name="city"
            defaultValue={room?.city || "Patna"}
            required
            className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm mt-1"
          />
        </div>
      </div>
      <div>
        <label className="text-sm font-medium">Address</label>
        <input
          name="address"
          required
          defaultValue={room?.address}
          className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm mt-1"
        />
      </div>
      <div>
        <label className="text-sm font-medium">
          Image URLs (comma-separated)
        </label>
        <textarea
          name="images"
          rows={2}
          defaultValue={room?.images?.join(", ")}
          placeholder="/rooms/image1.jpg, /rooms/image2.jpg"
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm mt-1"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Leave empty to use default images. Separate multiple URLs with commas.
        </p>
      </div>
      <div>
        <label className="text-sm font-medium">
          Equipment (comma-separated)
        </label>
        <input
          name="equipment"
          defaultValue={room?.equipment?.join(", ")}
          placeholder="Microphone, Camera, Lights"
          className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm mt-1"
        />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="text-sm font-medium">Price/Hour</label>
          <input
            name="pricePerHour"
            type="number"
            required
            defaultValue={room?.pricePerHour}
            className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm mt-1"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Price/Day</label>
          <input
            name="pricePerDay"
            type="number"
            required
            defaultValue={room?.pricePerDay}
            className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm mt-1"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Capacity</label>
          <input
            name="capacity"
            type="number"
            required
            defaultValue={room?.capacity}
            className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm mt-1"
          />
        </div>
      </div>
      <div>
        <label className="text-sm font-medium">Map Link (optional)</label>
        <input
          name="mapLink"
          type="url"
          defaultValue={room?.mapLink}
          placeholder="https://maps.google.com/..."
          className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm mt-1"
        />
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          name="featured"
          id="featured"
          defaultChecked={room?.featured}
          className="w-4 h-4 rounded"
        />
        <label htmlFor="featured" className="text-sm">
          Featured room
        </label>
      </div>
    </>
  );
}
