"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, Clock, Loader2, MapPin, RefreshCw, XCircle } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { formatPrice } from "@/lib/utils";

interface Booking {
  _id: string;
  bookingId: string;
  date: string;
  startTime: string;
  endTime: string;
  totalAmount: number;
  bookingType: "hourly" | "daily";
  status: "pending" | "confirmed" | "cancelled" | "completed";
  paymentStatus: string;
  room?: { name?: string; address?: string; city?: string; slug?: string };
}

function getToken() {
  if (typeof window === "undefined") return null;
  try {
    const stored = JSON.parse(localStorage.getItem("snapforest_user") || "null");
    return stored?.token ? String(stored.token) : null;
  } catch {
    return null;
  }
}

export default function DashboardClient() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelling, setCancelling] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    const token = getToken();
    if (!token) return;

    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/bookings", {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
        cache: "no-store",
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Could not load bookings.");
      setBookings(Array.isArray(data.data) ? data.data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load bookings.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace("/");
      return;
    }
    void fetchBookings();
  }, [authLoading, fetchBookings, router, user]);

  const cancelBooking = async (bookingId: string) => {
    const token = getToken();
    if (!token || !window.confirm("Cancel this booking? Paid bookings may require separate refund processing.")) return;

    setCancelling(bookingId);
    setError("");
    try {
      const res = await fetch("/api/bookings/cancel", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Could not cancel booking.");
      setBookings((current) => current.map((booking) => booking._id === bookingId ? { ...booking, status: "cancelled", paymentStatus: data.data?.paymentStatus || booking.paymentStatus } : booking));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not cancel booking.");
    } finally {
      setCancelling(null);
    }
  };

  if (authLoading || (!user && loading)) {
    return <div className="flex min-h-[60vh] items-center justify-center"><Loader2 className="h-7 w-7 animate-spin text-[#c8e6c9]" /></div>;
  }

  if (!user) return null;

  return (
    <section className="min-h-screen bg-[#0f0f0f] px-4 pb-20 pt-28 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#c8e6c9]">Your account</p>
            <h1 className="mt-2 text-3xl font-semibold text-white">Your bookings</h1>
            <p className="mt-2 text-sm text-white/50">Manage upcoming sessions and keep your booking details in one place.</p>
          </div>
          <button type="button" onClick={() => void fetchBookings()} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-white/10 px-4 text-sm text-white/70 hover:bg-white/[0.05] hover:text-white"><RefreshCw className="h-4 w-4" /> Refresh</button>
        </div>

        {error && <div role="alert" className="mb-5 rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">{error}</div>}

        {loading ? (
          <div className="flex min-h-48 items-center justify-center rounded-2xl border border-white/[0.08] bg-[#171717]"><Loader2 className="h-6 w-6 animate-spin text-[#c8e6c9]" /></div>
        ) : bookings.length === 0 ? (
          <div className="rounded-2xl border border-white/[0.08] bg-[#171717] px-6 py-16 text-center">
            <CalendarDays className="mx-auto h-8 w-8 text-white/30" />
            <h2 className="mt-4 text-lg font-medium text-white">No bookings yet</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-white/45">Explore the available studios and choose a time that works for your next session.</p>
            <button type="button" onClick={() => router.push("/rooms")} className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full bg-[#c8e6c9] px-5 text-sm font-semibold text-[#111] hover:bg-white">Explore studios</button>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => {
              const cancellable = booking.status === "pending" || booking.status === "confirmed";
              return (
                <article key={booking._id} className="rounded-2xl border border-white/[0.08] bg-[#171717] p-5 sm:p-6">
                  <div className="flex flex-col justify-between gap-4 sm:flex-row">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-lg font-semibold text-white">{booking.room?.name || "Studio"}</h2>
                        <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium capitalize ${booking.status === "confirmed" ? "bg-emerald-400/10 text-emerald-300" : booking.status === "cancelled" ? "bg-red-400/10 text-red-300" : "bg-white/[0.06] text-white/60"}`}>{booking.status}</span>
                      </div>
                      <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.12em] text-white/30">{booking.bookingId}</p>
                    </div>
                    <p className="text-xl font-semibold text-white">{formatPrice(booking.totalAmount)}</p>
                  </div>

                  <div className="mt-5 grid gap-3 border-t border-white/[0.07] pt-5 text-sm text-white/60 sm:grid-cols-3">
                    <div className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-[#c8e6c9]" />{new Date(booking.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</div>
                    <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-[#c8e6c9]" />{booking.bookingType === "daily" ? "Full day" : `${booking.startTime} – ${booking.endTime}`}</div>
                    <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-[#c8e6c9]" />{booking.room?.city || "Patna"}</div>
                  </div>

                  {cancellable && (
                    <div className="mt-5 flex justify-end">
                      <button type="button" disabled={cancelling === booking._id} onClick={() => void cancelBooking(booking._id)} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-red-400/20 px-4 text-sm text-red-300 hover:bg-red-400/10 disabled:opacity-50">
                        {cancelling === booking._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />} Cancel booking
                      </button>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
