"use client";

import Script from "next/script";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, CheckCircle2, Clock, CreditCard, Loader2, ShieldCheck } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface BookingWidgetProps {
  room: {
    _id: string;
    name: string;
    pricePerHour: number;
    pricePerDay: number;
    capacity?: number;
  };
}

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

const TIME_SLOTS = Array.from({ length: 48 }, (_, index) => {
  const minutes = index * 30;
  return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
});

function getStoredToken() {
  if (typeof window === "undefined") return null;
  for (const key of ["snapforest_user", "snapforest_admin"]) {
    try {
      const parsed = JSON.parse(localStorage.getItem(key) || "null");
      if (parsed?.token) return String(parsed.token);
    } catch {
      // Ignore malformed local storage and continue as a guest.
    }
  }
  return null;
}

export default function BookingWidget({ room }: BookingWidgetProps) {
  const router = useRouter();
  const [bookingType, setBookingType] = useState<"hourly" | "daily">("hourly");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("10:00");
  const [endTime, setEndTime] = useState("11:00");
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [purpose, setPurpose] = useState("");
  const [notes, setNotes] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const total = useMemo(() => {
    if (bookingType === "daily") return room.pricePerDay;
    const [sh, sm] = startTime.split(":").map(Number);
    const [eh, em] = endTime.split(":").map(Number);
    const duration = (eh * 60 + em - sh * 60 - sm) / 60;
    return duration > 0 ? Math.round(duration * room.pricePerHour) : 0;
  }, [bookingType, endTime, room.pricePerDay, room.pricePerHour, startTime]);

  const minDate = new Date().toISOString().slice(0, 10);
  const validEndTimes = TIME_SLOTS.filter((time) => time > startTime);

  const handleBooking = async () => {
    setError("");
    const normalizedPhone = guestPhone.replace(/\D/g, "");

    if (!date) return setError("Please choose a booking date.");
    if (bookingType === "hourly" && (!startTime || !endTime || endTime <= startTime)) {
      return setError("Please choose a valid time range.");
    }
    if (!guestName.trim() || guestName.trim().length < 2) return setError("Please enter your full name.");
    if (!/^\S+@\S+\.\S+$/.test(guestEmail.trim())) return setError("Please enter a valid email address.");
    if (!/^[6-9]\d{9}$/.test(normalizedPhone)) return setError("Please enter a valid 10-digit Indian mobile number.");
    if (!agreed) return setError("Please accept the cancellation and booking policy.");
    if (total <= 0) return setError("This room does not have a valid price for the selected booking type.");

    setLoading(true);
    try {
      const token = getStoredToken();
      const headers: Record<string, string> = { "Content-Type": "application/json", Accept: "application/json" };
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await fetch("/api/bookings", {
        method: "POST",
        headers,
        body: JSON.stringify({
          roomId: room._id,
          date,
          startTime: bookingType === "daily" ? "00:00" : startTime,
          endTime: bookingType === "daily" ? "23:30" : endTime,
          bookingType,
          totalAmount: total,
          guestName: guestName.trim(),
          guestEmail: guestEmail.trim().toLowerCase(),
          guestPhone: normalizedPhone,
          purpose: purpose.trim(),
          notes: notes.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Booking could not be created.");

      const { booking, razorpayOrder, razorpayKeyId, demoMode } = data.data || {};
      if (!booking?._id || !razorpayOrder?.id) throw new Error("Booking response was incomplete. Please try again.");

      const verify = async (payment: { id: string; orderId: string; signature: string }) => {
        const verifyRes = await fetch("/api/bookings/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({
            bookingId: booking._id,
            razorpayPaymentId: payment.id,
            razorpayOrderId: payment.orderId,
            razorpaySignature: payment.signature,
          }),
        });
        const verifyData = await verifyRes.json();
        if (!verifyRes.ok || !verifyData.success) throw new Error(verifyData.message || "Payment verification failed.");
        router.push(demoMode ? "/dashboard?payment=success&demo=true" : "/dashboard?payment=success");
      };

      if (demoMode) {
        await verify({
          id: `demo_payment_${Date.now()}`,
          orderId: razorpayOrder.id,
          signature: "demo_signature",
        });
        return;
      }

      if (!razorpayKeyId || !window.Razorpay) {
        throw new Error("Payment gateway is not ready. Please refresh the page and try again.");
      }

      const razorpay = new window.Razorpay({
        key: razorpayKeyId,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: "Snapforest",
        description: `Studio booking: ${room.name}`,
        order_id: razorpayOrder.id,
        prefill: { name: guestName.trim(), email: guestEmail.trim(), contact: normalizedPhone },
        handler: async (response: Record<string, string>) => {
          try {
            await verify({
              id: response.razorpay_payment_id,
              orderId: response.razorpay_order_id,
              signature: response.razorpay_signature,
            });
          } catch (verificationError) {
            setError(verificationError instanceof Error ? verificationError.message : "Payment verification failed.");
            setLoading(false);
          }
        },
        modal: { ondismiss: () => setLoading(false) },
      });
      razorpay.open();
    } catch (bookingError) {
      setError(bookingError instanceof Error ? bookingError.message : "Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="sticky top-24 rounded-2xl border border-white/[0.08] bg-[#171717] p-5 sm:p-6 shadow-2xl shadow-black/20">
      <div className="mb-5">
        <p className="text-[11px] font-mono uppercase tracking-[0.16em] text-[#c8e6c9]">Reserve this space</p>
        <h2 className="mt-1 text-xl font-semibold text-white">Book {room.name}</h2>
        <p className="mt-1 text-sm text-white/50">Choose a time, add your details and pay securely.</p>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-2 rounded-xl bg-white/[0.04] p-1">
        {(["hourly", "daily"] as const).map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => setBookingType(type)}
            className={`rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${bookingType === type ? "bg-[#c8e6c9] text-[#111]" : "text-white/60 hover:bg-white/[0.05] hover:text-white"}`}
          >
            {type === "hourly" ? `${formatPrice(room.pricePerHour)}/hour` : `${formatPrice(room.pricePerDay)}/day`}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        <label className="block text-sm text-white/75">
          <span className="mb-1.5 flex items-center gap-2"><Calendar className="h-4 w-4 text-[#c8e6c9]" /> Date</span>
          <input type="date" min={minDate} value={date} onChange={(event) => setDate(event.target.value)} className="h-11 w-full rounded-xl border border-white/10 bg-[#101010] px-3 text-sm text-white outline-none focus:border-[#c8e6c9]/50" />
        </label>

        {bookingType === "hourly" && (
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-sm text-white/75">
              <span className="mb-1.5 flex items-center gap-2"><Clock className="h-4 w-4 text-[#c8e6c9]" /> Start</span>
              <select value={startTime} onChange={(event) => setStartTime(event.target.value)} className="h-11 w-full rounded-xl border border-white/10 bg-[#101010] px-3 text-sm text-white outline-none focus:border-[#c8e6c9]/50">
                {TIME_SLOTS.slice(0, -1).map((time) => <option key={time} value={time}>{time}</option>)}
              </select>
            </label>
            <label className="block text-sm text-white/75">
              <span className="mb-1.5 block">End</span>
              <select value={endTime} onChange={(event) => setEndTime(event.target.value)} className="h-11 w-full rounded-xl border border-white/10 bg-[#101010] px-3 text-sm text-white outline-none focus:border-[#c8e6c9]/50">
                {validEndTimes.map((time) => <option key={time} value={time}>{time}</option>)}
              </select>
            </label>
          </div>
        )}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <input value={guestName} onChange={(event) => setGuestName(event.target.value)} placeholder="Full name" autoComplete="name" className="h-11 rounded-xl border border-white/10 bg-[#101010] px-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#c8e6c9]/50" />
          <input value={guestEmail} onChange={(event) => setGuestEmail(event.target.value)} placeholder="Email address" type="email" autoComplete="email" className="h-11 rounded-xl border border-white/10 bg-[#101010] px-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#c8e6c9]/50" />
          <input value={guestPhone} onChange={(event) => setGuestPhone(event.target.value.replace(/\D/g, "").slice(0, 10))} placeholder="10-digit mobile" inputMode="numeric" autoComplete="tel" className="h-11 rounded-xl border border-white/10 bg-[#101010] px-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#c8e6c9]/50 sm:col-span-2" />
        </div>

        <select value={purpose} onChange={(event) => setPurpose(event.target.value)} className="h-11 w-full rounded-xl border border-white/10 bg-[#101010] px-3 text-sm text-white/70 outline-none focus:border-[#c8e6c9]/50">
          <option value="">What are you creating? (optional)</option>
          <option>Podcast</option><option>YouTube video</option><option>Music</option><option>Photography</option><option>Dance</option><option>Meeting</option><option>Streaming</option><option>Other</option>
        </select>

        <textarea value={notes} onChange={(event) => setNotes(event.target.value.slice(0, 1000))} placeholder="Special requests (optional)" rows={3} className="w-full resize-none rounded-xl border border-white/10 bg-[#101010] px-3 py-2.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#c8e6c9]/50" />

        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/[0.08] bg-white/[0.025] p-3 text-xs leading-5 text-white/55">
          <input type="checkbox" checked={agreed} onChange={(event) => setAgreed(event.target.checked)} className="mt-1 h-4 w-4 accent-[#c8e6c9]" />
          <span>I agree to the booking policy and understand that eligible cancellations are allowed up to 30 minutes before the session. Paid refunds are processed separately.</span>
        </label>

        {error && <p role="alert" className="rounded-xl border border-red-400/20 bg-red-400/10 px-3 py-2.5 text-sm text-red-200">{error}</p>}

        <div className="flex items-center justify-between border-t border-white/[0.08] pt-4">
          <div><p className="text-xs text-white/40">Estimated total</p><p className="text-2xl font-semibold text-white">{formatPrice(total)}</p></div>
          <button type="button" disabled={loading} onClick={handleBooking} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#c8e6c9] px-5 text-sm font-semibold text-[#111] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
            {loading ? "Processing…" : "Continue to payment"}
          </button>
        </div>
        <p className="flex items-center justify-center gap-1.5 text-[11px] text-white/35"><ShieldCheck className="h-3.5 w-3.5" /> Payment is handled by Razorpay.</p>
      </div>

      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />
    </div>
  );
}
