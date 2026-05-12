"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  MapPin,
  CreditCard,
  XCircle,
  CheckCircle,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { formatDate, formatPrice, formatTime, canCancel } from "@/lib/utils";

interface Booking {
  _id: string;
  room: {
    name: string;
    address: string;
    city: string;
    images: string[];
    slug: string;
  };
  date: string;
  startTime: string;
  endTime: string;
  totalAmount: number;
  bookingType: string;
  status: string;
  paymentStatus: string;
  createdAt: string;
}

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState<string | null>(null);

  const paymentSuccess = searchParams.get("payment") === "success";

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await fetch("/api/bookings");
      const data = await res.json();
      if (data.success) {
        setBookings(data.data);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (bookingId: string, bookingDate: string, startTime: string) => {
    const fullDate = new Date(`${bookingDate}T${startTime}`);
    if (!canCancel(fullDate)) {
      alert("Cancellation is only allowed up to 30 minutes before the booking starts.");
      return;
    }

    if (!confirm("Are you sure you want to cancel this booking?")) return;

    setCancelling(bookingId);
    try {
      const res = await fetch("/api/bookings/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId }),
      });
      const data = await res.json();
      if (data.success) {
        fetchBookings();
      } else {
        alert(data.message || "Cancellation failed");
      }
    } catch (error) {
      console.error("Cancel error:", error);
    } finally {
      setCancelling(null);
    }
  };

  const upcoming = bookings.filter((b) => b.status === "confirmed" || b.status === "pending");
  const past = bookings.filter((b) => b.status === "completed");
  const cancelled = bookings.filter((b) => b.status === "cancelled");

  if (loading) {
    return (
      <main className="min-h-screen pt-24 px-4">
        <div className="max-w-5xl mx-auto space-y-6">
          <Skeleton className="h-10 w-48" />
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      </main>
    );
  }

  const BookingCard = ({ booking }: { booking: Booking }) => {
    const fullDate = new Date(`${booking.date}T${booking.startTime}`);
    const showCancel = canCancel(fullDate) && (booking.status === "confirmed" || booking.status === "pending");

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-5"
      >
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <Link href={`/rooms/${booking.room.slug}`} className="font-semibold text-lg hover:text-neon-cyan transition-colors">
                  {booking.room.name}
                </Link>
                <div className="flex items-center gap-1 text-muted-foreground text-sm mt-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {booking.room.address}, {booking.room.city}
                </div>
              </div>
              <div className="flex gap-2">
                <Badge variant={booking.status === "confirmed" ? "success" : booking.status === "cancelled" ? "destructive" : "warning"}>
                  {booking.status}
                </Badge>
                <Badge variant={booking.paymentStatus === "paid" ? "success" : "secondary"}>
                  {booking.paymentStatus}
                </Badge>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 mt-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-neon-cyan" />
                {formatDate(booking.date)}
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-neon-cyan" />
                {formatTime(`${booking.date}T${booking.startTime}`)} - {formatTime(`${booking.date}T${booking.endTime}`)}
              </div>
              <div className="flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-neon-cyan" />
                {formatPrice(booking.totalAmount)}
              </div>
            </div>
          </div>

          {showCancel && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleCancel(booking._id, booking.date, booking.startTime)}
              disabled={cancelling === booking._id}
              className="text-destructive border-destructive/30 hover:bg-destructive/10"
            >
              <XCircle className="w-4 h-4 mr-1" />
              {cancelling === booking._id ? "Cancelling..." : "Cancel"}
            </Button>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <main className="min-h-screen pt-24 px-4 pb-12">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">My <span className="text-neon-cyan">Bookings</span></h1>
        <p className="text-muted-foreground mb-8">Manage your studio bookings</p>

        {paymentSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 p-4 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 mb-6"
          >
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <span>Payment successful! Your booking has been confirmed.</span>
          </motion.div>
        )}

        <Tabs defaultValue="upcoming" className="space-y-6">
          <TabsList className="bg-white/5">
            <TabsTrigger value="upcoming">
              Upcoming ({upcoming.length})
            </TabsTrigger>
            <TabsTrigger value="past">
              Past ({past.length})
            </TabsTrigger>
            <TabsTrigger value="cancelled">
              Cancelled ({cancelled.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-4">
            {upcoming.length === 0 ? (
              <div className="text-center py-16">
                <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No upcoming bookings</p>
                <Link href="/rooms">
                  <Button variant="neon" size="sm" className="mt-4">
                    Browse Rooms
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>
            ) : (
              upcoming.map((booking) => (
                <BookingCard key={booking._id} booking={booking} />
              ))
            )}
          </TabsContent>

          <TabsContent value="past" className="space-y-4">
            {past.length === 0 ? (
              <div className="text-center py-16">
                <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No past bookings</p>
              </div>
            ) : (
              past.map((booking) => (
                <BookingCard key={booking._id} booking={booking} />
              ))
            )}
          </TabsContent>

          <TabsContent value="cancelled" className="space-y-4">
            {cancelled.length === 0 ? (
              <div className="text-center py-16">
                <XCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No cancelled bookings</p>
              </div>
            ) : (
              cancelled.map((booking) => (
                <BookingCard key={booking._id} booking={booking} />
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
