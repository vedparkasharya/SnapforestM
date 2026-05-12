"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  AlertTriangle,
  Check,
  LogIn,
  User,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice, getTimeSlots, isPastDate, isPastTimeSlot } from "@/lib/utils";

interface BookingWidgetProps {
  room: {
    _id: string;
    name: string;
    pricePerHour: number;
    pricePerDay: number;
  };
}

// Fixed callback URL for Google OAuth - NEVER use window.location.href
const CALLBACK_URL = "https://snapforest-m.vercel.app";

export default function BookingWidget({ room }: BookingWidgetProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [bookingType, setBookingType] = useState<"hourly" | "daily">("hourly");
  const [agreedToPolicy, setAgreedToPolicy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [signingIn, setSigningIn] = useState(false);

  const timeSlots = getTimeSlots();

  // Sign in handler - uses redirect:true for proper session establishment
  const handleSignIn = async () => {
    console.log("[BookingWidget] Starting Google sign-in...");
    setSigningIn(true);
    try {
      // CRITICAL: Use FIXED production URL, NOT window.location.href
      // This prevents preview deployment URI mismatch errors
      await signIn("google", {
        callbackUrl: CALLBACK_URL,
      });
    } catch (error) {
      console.error("[BookingWidget] Sign-in error:", error);
      setSigningIn(false);
    }
  };

  // Debug session in booking widget
  useEffect(() => {
    console.log("[BookingWidget] Session status:", status);
    console.log("[BookingWidget] Session user:", session?.user);
  }, [session, status]);

  const calculateTotal = () => {
    if (bookingType === "daily") return room.pricePerDay;
    if (!startTime || !endTime) return 0;
    const [sh, sm] = startTime.split(":").map(Number);
    const [eh, em] = endTime.split(":").map(Number);
    const hours = (eh * 60 + em - (sh * 60 + sm)) / 60;
    return Math.max(0, Math.ceil(hours) * room.pricePerHour);
  };

  const handleBooking = async () => {
    if (!session?.user) {
      alert("Please sign in to book");
      return;
    }
    if (!date || !startTime || !endTime) {
      alert("Please select date and time");
      return;
    }
    if (!agreedToPolicy) return;

    setLoading(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId: room._id,
          date,
          startTime,
          endTime,
          bookingType,
          totalAmount: calculateTotal(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        if (data.data?.razorpayOrder) {
          const rzp = new (window as any).Razorpay({
            key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
            amount: data.data.razorpayOrder.amount,
            currency: data.data.razorpayOrder.currency,
            name: "SnapforestX",
            description: `Booking: ${room.name}`,
            order_id: data.data.razorpayOrder.id,
            handler: async (response: any) => {
              await fetch("/api/bookings/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  bookingId: data.data.booking._id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpayOrderId: response.razorpay_order_id,
                  razorpaySignature: response.razorpay_signature,
                }),
              });
              router.push("/dashboard?payment=success");
            },
            modal: {
              ondismiss: () => setLoading(false),
            },
          });
          rzp.open();
        }
      } else {
        alert(data.message || "Booking failed");
        setLoading(false);
      }
    } catch (error) {
      console.error("Booking error:", error);
      alert("Something went wrong");
      setLoading(false);
    }
  };

  const total = calculateTotal();
  const isAuthenticated = status === "authenticated" && !!session?.user;
  const isLoading = status === "loading";

  return (
    <div className="glass-card p-6 sticky top-24">
      <h3 className="text-xl font-semibold mb-4">Book This Studio</h3>

      {/* Session Status Banner */}
      {isLoading ? (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 mb-4">
          <Loader2 className="w-5 h-5 animate-spin text-neon-cyan" />
          <span className="text-sm text-muted-foreground">Checking session...</span>
        </div>
      ) : !isAuthenticated ? (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl bg-gradient-to-r from-neon-cyan/10 to-neon-purple/10 border border-neon-cyan/20 mb-4"
        >
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-neon-cyan/10">
              <LogIn className="w-5 h-5 text-neon-cyan" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium mb-1">Sign in to book</p>
              <p className="text-xs text-muted-foreground mb-3">
                Login with your Google account to make a booking
              </p>
              <Button
                variant="neon"
                size="sm"
                className="w-full"
                onClick={handleSignIn}
                disabled={signingIn}
              >
                {signingIn ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <User className="w-4 h-4 mr-2" />
                )}
                {signingIn ? "Signing in..." : "Sign In with Google"}
              </Button>
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20 mb-4"
        >
          {session.user.image ? (
            <img
              src={session.user.image}
              alt=""
              className="w-8 h-8 rounded-full"
              referrerPolicy="no-referrer"
            />
          ) : (
            <User className="w-5 h-5 text-green-400" />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {session.user.name || "Signed in"}
            </p>
            <p className="text-xs text-muted-foreground">Ready to book</p>
          </div>
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
        </motion.div>
      )}

      {/* Booking Type */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setBookingType("hourly")}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
            bookingType === "hourly"
              ? "bg-neon-cyan text-black"
              : "bg-white/5 text-muted-foreground hover:bg-white/10"
          }`}
        >
          Hourly
        </button>
        <button
          onClick={() => setBookingType("daily")}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
            bookingType === "daily"
              ? "bg-neon-cyan text-black"
              : "bg-white/5 text-muted-foreground hover:bg-white/10"
          }`}
        >
          Full Day
        </button>
      </div>

      {/* Date */}
      <div className="mb-4">
        <label className="flex items-center gap-2 text-sm font-medium mb-2">
          <Calendar className="w-4 h-4 text-neon-cyan" />
          Select Date
        </label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          min={new Date().toISOString().split("T")[0]}
          className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      {/* Time Slots */}
      {bookingType === "hourly" && (
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium mb-2">
              <Clock className="w-4 h-4 text-neon-cyan" />
              Start Time
            </label>
            <select
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">Select</option>
              {timeSlots.map((slot) => (
                <option
                  key={slot}
                  value={slot}
                  disabled={date ? isPastTimeSlot(date, slot) : false}
                >
                  {slot}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm font-medium mb-2">
              <Clock className="w-4 h-4 text-neon-cyan" />
              End Time
            </label>
            <select
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">Select</option>
              {timeSlots
                .filter((slot) => slot > startTime)
                .map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
            </select>
          </div>
        </div>
      )}

      {/* Price */}
      <div className="flex items-center justify-between py-4 border-t border-white/5 mb-4">
        <span className="text-muted-foreground">Total Amount</span>
        <motion.span
          key={total}
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          className="text-2xl font-bold text-neon-cyan"
        >
          {formatPrice(total)}
        </motion.span>
      </div>

      {/* Damage Policy */}
      <label className="flex items-start gap-3 mb-4 cursor-pointer">
        <div
          className={`w-5 h-5 rounded border flex items-center justify-center mt-0.5 transition-colors ${
            agreedToPolicy
              ? "bg-neon-cyan border-neon-cyan"
              : "border-muted-foreground"
          }`}
          onClick={() => setAgreedToPolicy(!agreedToPolicy)}
        >
          {agreedToPolicy && <Check className="w-3.5 h-3.5 text-black" />}
        </div>
        <span className="text-xs text-muted-foreground leading-relaxed">
          I agree to the damage policy. I will be responsible for any damage
          caused to equipment during my booking.
        </span>
      </label>

      {/* Book Button */}
      <Button
        className="w-full"
        variant="neon"
        size="lg"
        disabled={
          !isAuthenticated ||
          !agreedToPolicy ||
          !date ||
          (bookingType === "hourly" && (!startTime || !endTime)) ||
          loading
        }
        onClick={handleBooking}
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Processing...
          </>
        ) : !isAuthenticated ? (
          "Sign in to Book"
        ) : (
          "Book Now"
        )}
      </Button>

      <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
        <AlertTriangle className="w-3.5 h-3.5 text-yellow-400" />
        <span>Cancellation allowed up to 30 min before</span>
      </div>

      {/* Razorpay Script */}
      <script src="https://checkout.razorpay.com/v1/checkout.js" async />
    </div>
  );
}
