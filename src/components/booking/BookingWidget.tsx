"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Calendar, Clock, AlertTriangle, Check } from "lucide-react";
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

export default function BookingWidget({ room }: BookingWidgetProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [bookingType, setBookingType] = useState<"hourly" | "daily">("hourly");
  const [agreedToPolicy, setAgreedToPolicy] = useState(false);
  const [loading, setLoading] = useState(false);

  const timeSlots = getTimeSlots();

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

  return (
    <div className="glass-card p-6 sticky top-24">
      <h3 className="text-xl font-semibold mb-4">Book This Studio</h3>

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
          I agree to the damage policy. I will be responsible for any damage caused to equipment during my booking.
        </span>
      </label>

      {/* Book Button */}
      <Button
        className="w-full"
        variant="neon"
        size="lg"
        disabled={!agreedToPolicy || !date || (bookingType === "hourly" && (!startTime || !endTime)) || loading}
        onClick={handleBooking}
      >
        {loading ? "Processing..." : "Book Now"}
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
