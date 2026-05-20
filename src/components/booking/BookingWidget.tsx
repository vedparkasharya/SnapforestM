"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Clock,
  AlertTriangle,
  Check,
  Loader2,
  Info,
  User,
  Mail,
  Phone,
  FileText,
  MessageSquare,
  ChevronRight,
  ChevronLeft,
  Users,
  IndianRupee,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice, getTimeSlots, isPastTimeSlot } from "@/lib/utils";

interface BookingWidgetProps {
  room: {
    _id: string;
    name: string;
    pricePerHour: number;
    pricePerDay: number;
    capacity?: number;
  };
}

type BookingStep = "datetime" | "details" | "confirm";

/**
 * Booking Widget Component - Enhanced Version
 *
 * Multi-step booking flow with improved validation and user experience:
 * 1. Select date and time
 * 2. Enter guest details (name, email, phone, purpose, guests count)
 * 3. Review and confirm booking
 *
 * Features:
 * - Real-time validation with clear error messages
 * - Indian phone number format validation
 * - Guest count selection
 * - Purpose selection with common options
 * - Special requests/notes field
 * - Demo mode support for testing
 */
export default function BookingWidget({ room }: BookingWidgetProps) {
  const router = useRouter();

  // Step management
  const [currentStep, setCurrentStep] = useState<BookingStep>("datetime");

  // Date & Time state
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [bookingType, setBookingType] = useState<"hourly" | "daily">("hourly");

  // Guest details state
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [purpose, setPurpose] = useState("");
  const [notes, setNotes] = useState("");
  const [numberOfGuests, setNumberOfGuests] = useState(1);

  // Policy & loading state
  const [agreedToPolicy, setAgreedToPolicy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [emailNotice, setEmailNotice] = useState("");

  const timeSlots = getTimeSlots();
  const maxCapacity = room.capacity || 10;

  const calculateTotal = () => {
    if (bookingType === "daily") return room.pricePerDay;
    if (!startTime || !endTime) return 0;
    const [sh, sm] = startTime.split(":").map(Number);
    const [eh, em] = endTime.split(":").map(Number);
    const hours = (eh * 60 + em - (sh * 60 + sm)) / 60;
    return Math.max(0, Math.ceil(hours) * room.pricePerHour);
  };

  // Validate date/time step
  const validateDateTimeStep = () => {
    const newErrors: Record<string, string> = {};
    if (!date) newErrors.date = "Please select a date";
    if (bookingType === "hourly") {
      if (!startTime) newErrors.startTime = "Please select start time";
      if (!endTime) newErrors.endTime = "Please select end time";
      if (startTime && endTime && endTime <= startTime) {
        newErrors.endTime = "End time must be after start time";
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validate guest details step with enhanced validation
  const validateDetailsStep = () => {
    const newErrors: Record<string, string> = {};

    // Name validation
    if (!guestName.trim()) {
      newErrors.guestName = "Please enter your full name";
    } else if (guestName.trim().length < 2) {
      newErrors.guestName = "Name must be at least 2 characters";
    }

    // Email validation
    if (!guestEmail.trim()) {
      newErrors.guestEmail = "Please enter your email address";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail)) {
      newErrors.guestEmail = "Please enter a valid email address";
    }

    // Phone validation (Indian format)
    if (!guestPhone.trim()) {
      newErrors.guestPhone = "Please enter your phone number";
    } else if (!/^[6-9]\d{9}$/.test(guestPhone.replace(/\D/g, ""))) {
      newErrors.guestPhone = "Please enter a valid 10-digit Indian mobile number";
    }

    // Number of guests validation
    if (numberOfGuests < 1) {
      newErrors.numberOfGuests = "At least 1 guest is required";
    } else if (numberOfGuests > maxCapacity) {
      newErrors.numberOfGuests = `Maximum ${maxCapacity} guests allowed for this room`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (currentStep === "datetime" && validateDateTimeStep()) {
      setCurrentStep("details");
    } else if (currentStep === "details" && validateDetailsStep()) {
      setCurrentStep("confirm");
    }
  };

  const handlePrevStep = () => {
    if (currentStep === "details") setCurrentStep("datetime");
    else if (currentStep === "confirm") setCurrentStep("details");
  };

  const handleBooking = async () => {
    if (!agreedToPolicy) return;

    setLoading(true);
    setDemoMode(false);
    setEmailNotice("");

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
          guestName: guestName.trim(),
          guestEmail: guestEmail.trim().toLowerCase(),
          guestPhone: guestPhone.replace(/\D/g, ""),
          purpose,
          notes: notes.trim(),
        }),
      });

      const data = await res.json();

      if (data.success) {
        const razorpayOrder = data.data?.razorpayOrder;
        const isDemo = data.data?.demoMode === true;
        const razorpayKeyId = data.data?.razorpayKeyId;

        if (isDemo) {
          // Demo mode: skip Razorpay, directly verify
          setDemoMode(true);
          const verifyRes = await fetch("/api/bookings/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              bookingId: data.data.booking._id,
              razorpayPaymentId: `demo_payment_${Date.now()}`,
              razorpayOrderId: razorpayOrder?.id,
              razorpaySignature: "demo_signature",
            }),
          });
          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            if (verifyData.data?.emailSent) {
              setEmailNotice("Confirmation email sent!");
            }
            router.push("/dashboard?payment=success&demo=true");
          } else {
            alert(verifyData.message || "Demo booking verification failed");
            setLoading(false);
          }
          return;
        }

        // Real Razorpay payment flow
        if (razorpayOrder && typeof window !== "undefined" && (window as any).Razorpay) {
          if (!razorpayKeyId) {
            alert("Payment gateway key not configured. Please contact support.");
            setLoading(false);
            return;
          }

          const rzp = new (window as any).Razorpay({
            key: razorpayKeyId,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            name: "Snapforest",
            description: `Booking: ${room.name}`,
            order_id: razorpayOrder.id,
            prefill: {
              name: guestName,
              email: guestEmail,
              contact: guestPhone,
            },
            handler: async (response: any) => {
              try {
                const verifyRes = await fetch("/api/bookings/verify", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    bookingId: data.data.booking._id,
                    razorpayPaymentId: response.razorpay_payment_id,
                    razorpayOrderId: response.razorpay_order_id,
                    razorpaySignature: response.razorpay_signature,
                  }),
                });
                const verifyData = await verifyRes.json();
                if (verifyData.data?.emailSent) {
                  setEmailNotice("Confirmation email sent!");
                }
              } catch (e) {
                console.error("Verification error:", e);
              }
              router.push("/dashboard?payment=success");
            },
            modal: {
              ondismiss: () => setLoading(false),
            },
          });
          rzp.open();
        } else {
          alert("Payment gateway not loaded. Please refresh the page.");
          setLoading(false);
        }
      } else {
        // Show detailed error from API
        const errorMsg = data.message || "Booking failed. Please try again.";
        alert(errorMsg);
        setLoading(false);
      }
    } catch (error) {
      console.error("Booking error:", error);
      alert("Something went wrong. Please check your connection and try again.");
      setLoading(false);
    }
  };

  const total = calculateTotal();

  // Purpose options
  const purposeOptions = [
    "Podcast Recording",
    "YouTube Video Shoot",
    "Music Recording",
    "Photography Session",
    "Dance Practice",
    "Team Meeting",
    "Live Streaming",
    "Gaming Session",
    "Work/Study",
    "Other",
  ];

  return (
    <div className="glass-card p-6 sticky top-24">
      <h3 className="text-xl font-semibold mb-1">Book This Studio</h3>
      <p className="text-xs text-muted-foreground mb-4">
        Fill in your details to reserve this space
      </p>

      {/* Step Indicator */}
      <div className="flex items-center gap-2 mb-6">
        {(["datetime", "details", "confirm"] as BookingStep[]).map((step, i) => (
          <div key={step} className="flex items-center gap-2 flex-1">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                currentStep === step
                  ? "bg-neon-cyan text-black"
                  : (["datetime", "details", "confirm"] as BookingStep[]).indexOf(currentStep) > i
                  ? "bg-green-500 text-white"
                  : "bg-white/10 text-muted-foreground"
              }`}
            >
              {(["datetime", "details", "confirm"] as BookingStep[]).indexOf(currentStep) > i ? (
                <Check className="w-4 h-4" />
              ) : (
                i + 1
              )}
            </div>
            <span
              className={`text-xs hidden sm:block ${
                currentStep === step ? "text-white" : "text-muted-foreground"
              }`}
            >
              {step === "datetime" ? "Date & Time" : step === "details" ? "Your Details" : "Confirm"}
            </span>
            {i < 2 && (
              <div
                className={`flex-1 h-[2px] mx-1 ${
                  (["datetime", "details", "confirm"] as BookingStep[]).indexOf(currentStep) > i
                    ? "bg-green-500"
                    : "bg-white/10"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Date & Time */}
      <AnimatePresence mode="wait">
        {currentStep === "datetime" && (
          <motion.div
            key="datetime"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
          >
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
                <div className="flex items-center justify-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  Hourly
                </div>
                <span className="text-[10px] opacity-70 block mt-0.5">
                  {formatPrice(room.pricePerHour)}/hr
                </span>
              </button>
              <button
                onClick={() => setBookingType("daily")}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                  bookingType === "daily"
                    ? "bg-neon-cyan text-black"
                    : "bg-white/5 text-muted-foreground hover:bg-white/10"
                }`}
              >
                <div className="flex items-center justify-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  Full Day
                </div>
                <span className="text-[10px] opacity-70 block mt-0.5">
                  {formatPrice(room.pricePerDay)}/day
                </span>
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
                onChange={(e) => { setDate(e.target.value); setErrors(prev => ({ ...prev, date: "" })); }}
                min={new Date().toISOString().split("T")[0]}
                className={`w-full h-10 rounded-lg border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors ${
                  errors.date ? "border-red-500 focus-visible:ring-red-500/50" : "border-input"
                }`}
              />
              {errors.date && <p className="text-red-400 text-xs mt-1 flex items-center gap-1"><AlertTriangle className="w-3 h-3" />{errors.date}</p>}
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
                    onChange={(e) => { setStartTime(e.target.value); setErrors(prev => ({ ...prev, startTime: "" })); }}
                    className={`w-full h-10 rounded-lg border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors ${
                      errors.startTime ? "border-red-500 focus-visible:ring-red-500/50" : "border-input"
                    }`}
                  >
                    <option value="">Select time</option>
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
                  {errors.startTime && <p className="text-red-400 text-xs mt-1 flex items-center gap-1"><AlertTriangle className="w-3 h-3" />{errors.startTime}</p>}
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium mb-2">
                    <Clock className="w-4 h-4 text-neon-cyan" />
                    End Time
                  </label>
                  <select
                    value={endTime}
                    onChange={(e) => { setEndTime(e.target.value); setErrors(prev => ({ ...prev, endTime: "" })); }}
                    className={`w-full h-10 rounded-lg border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors ${
                      errors.endTime ? "border-red-500 focus-visible:ring-red-500/50" : "border-input"
                    }`}
                  >
                    <option value="">Select time</option>
                    {timeSlots
                      .filter((slot) => slot > startTime)
                      .map((slot) => (
                        <option key={slot} value={slot}>
                          {slot}
                        </option>
                      ))}
                  </select>
                  {errors.endTime && <p className="text-red-400 text-xs mt-1 flex items-center gap-1"><AlertTriangle className="w-3 h-3" />{errors.endTime}</p>}
                </div>
              </div>
            )}

            {/* Quick price preview */}
            {total > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between p-3 rounded-lg bg-neon-cyan/5 border border-neon-cyan/20 mb-4"
              >
                <span className="text-sm text-muted-foreground">Estimated Price</span>
                <span className="text-lg font-bold text-neon-cyan">{formatPrice(total)}</span>
              </motion.div>
            )}

            <Button
              className="w-full mt-2"
              variant="neon"
              onClick={handleNextStep}
            >
              Continue
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </motion.div>
        )}

        {/* Step 2: Guest Details - Enhanced */}
        {currentStep === "details" && (
          <motion.div
            key="details"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
          >
            {/* Guest Name */}
            <div className="mb-3">
              <label className="flex items-center gap-2 text-sm font-medium mb-1.5">
                <User className="w-4 h-4 text-neon-cyan" />
                Your Full Name *
              </label>
              <input
                type="text"
                value={guestName}
                onChange={(e) => { setGuestName(e.target.value); setErrors(prev => ({ ...prev, guestName: "" })); }}
                placeholder="Enter your full name"
                className={`w-full h-10 rounded-lg border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors ${
                  errors.guestName ? "border-red-500 focus-visible:ring-red-500/50" : "border-input"
                }`}
              />
              {errors.guestName && <p className="text-red-400 text-xs mt-1 flex items-center gap-1"><AlertTriangle className="w-3 h-3" />{errors.guestName}</p>}
            </div>

            {/* Guest Email */}
            <div className="mb-3">
              <label className="flex items-center gap-2 text-sm font-medium mb-1.5">
                <Mail className="w-4 h-4 text-neon-cyan" />
                Email Address *
              </label>
              <input
                type="email"
                value={guestEmail}
                onChange={(e) => { setGuestEmail(e.target.value); setErrors(prev => ({ ...prev, guestEmail: "" })); }}
                placeholder="your@email.com"
                className={`w-full h-10 rounded-lg border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors ${
                  errors.guestEmail ? "border-red-500 focus-visible:ring-red-500/50" : "border-input"
                }`}
              />
              {errors.guestEmail && <p className="text-red-400 text-xs mt-1 flex items-center gap-1"><AlertTriangle className="w-3 h-3" />{errors.guestEmail}</p>}
              <p className="text-[11px] text-muted-foreground mt-1">Booking confirmation will be sent to this email</p>
            </div>

            {/* Guest Phone - Indian format */}
            <div className="mb-3">
              <label className="flex items-center gap-2 text-sm font-medium mb-1.5">
                <Phone className="w-4 h-4 text-neon-cyan" />
                Phone Number *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">+91</span>
                <input
                  type="tel"
                  value={guestPhone}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                    setGuestPhone(val);
                    setErrors(prev => ({ ...prev, guestPhone: "" }));
                  }}
                  placeholder="10-digit mobile number"
                  className={`w-full h-10 rounded-lg border bg-background pl-12 pr-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors ${
                    errors.guestPhone ? "border-red-500 focus-visible:ring-red-500/50" : "border-input"
                  }`}
                />
              </div>
              {errors.guestPhone && <p className="text-red-400 text-xs mt-1 flex items-center gap-1"><AlertTriangle className="w-3 h-3" />{errors.guestPhone}</p>}
            </div>

            {/* Number of Guests */}
            <div className="mb-3">
              <label className="flex items-center gap-2 text-sm font-medium mb-1.5">
                <Users className="w-4 h-4 text-neon-cyan" />
                Number of Guests *
              </label>
              <select
                value={numberOfGuests}
                onChange={(e) => {
                  setNumberOfGuests(Number(e.target.value));
                  setErrors(prev => ({ ...prev, numberOfGuests: "" }));
                }}
                className={`w-full h-10 rounded-lg border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors ${
                  errors.numberOfGuests ? "border-red-500 focus-visible:ring-red-500/50" : "border-input"
                }`}
              >
                {Array.from({ length: maxCapacity }, (_, i) => i + 1).map((num) => (
                  <option key={num} value={num}>
                    {num} {num === 1 ? "person" : "people"}
                  </option>
                ))}
              </select>
              {errors.numberOfGuests && <p className="text-red-400 text-xs mt-1 flex items-center gap-1"><AlertTriangle className="w-3 h-3" />{errors.numberOfGuests}</p>}
            </div>

            {/* Purpose */}
            <div className="mb-3">
              <label className="flex items-center gap-2 text-sm font-medium mb-1.5">
                <FileText className="w-4 h-4 text-neon-cyan" />
                Purpose (Optional)
              </label>
              <select
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">Select purpose</option>
                {purposeOptions.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            {/* Notes */}
            <div className="mb-4">
              <label className="flex items-center gap-2 text-sm font-medium mb-1.5">
                <MessageSquare className="w-4 h-4 text-neon-cyan" />
                Special Requests (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any special requirements, equipment needs, etc."
                rows={2}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handlePrevStep}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
              <Button
                className="flex-[2]"
                variant="neon"
                onClick={handleNextStep}
              >
                Continue
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Confirm & Pay - Enhanced */}
        {currentStep === "confirm" && (
          <motion.div
            key="confirm"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
          >
            {/* Booking Summary */}
            <div className="bg-white/5 rounded-lg p-4 mb-4 space-y-2.5">
              <h4 className="text-sm font-semibold mb-3 text-neon-cyan">Booking Summary</h4>

              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Room</span>
                <span className="font-medium">{room.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Date</span>
                <span className="font-medium">{date ? new Date(date).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" }) : "-"}</span>
              </div>
              {bookingType === "hourly" ? (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Time</span>
                  <span className="font-medium">{startTime} - {endTime}</span>
                </div>
              ) : (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Type</span>
                  <span className="font-medium">Full Day (9 AM - 9 PM)</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Guests</span>
                <span className="font-medium">{numberOfGuests} {numberOfGuests === 1 ? "person" : "people"}</span>
              </div>
              <div className="h-px bg-white/10 my-2" />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1"><User className="w-3 h-3" /> Name</span>
                <span className="font-medium">{guestName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1"><Mail className="w-3 h-3" /> Email</span>
                <span className="font-medium text-xs">{guestEmail}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1"><Phone className="w-3 h-3" /> Phone</span>
                <span className="font-medium">+91 {guestPhone}</span>
              </div>
              {purpose && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Purpose</span>
                  <span className="font-medium">{purpose}</span>
                </div>
              )}
              <div className="h-px bg-white/10 my-2" />
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground flex items-center gap-1">
                  <IndianRupee className="w-3.5 h-3.5" /> Total Amount
                </span>
                <motion.span
                  key={total}
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                  className="text-xl font-bold text-neon-cyan"
                >
                  {formatPrice(total)}
                </motion.span>
              </div>
            </div>

            {/* Damage Policy */}
            <label className="flex items-start gap-3 mb-4 cursor-pointer group">
              <div
                className={`w-5 h-5 rounded border flex items-center justify-center mt-0.5 transition-colors flex-shrink-0 ${
                  agreedToPolicy
                    ? "bg-neon-cyan border-neon-cyan"
                    : "border-muted-foreground group-hover:border-neon-cyan/50"
                }`}
                onClick={() => setAgreedToPolicy(!agreedToPolicy)}
              >
                {agreedToPolicy && <Check className="w-3.5 h-3.5 text-black" />}
              </div>
              <span className="text-xs text-muted-foreground leading-relaxed">
                I agree to the damage policy. I will be responsible for any damage
                caused to equipment during my booking. Cancellation is allowed up to
                30 minutes before the scheduled time.
              </span>
            </label>

            {/* Email notice */}
            {emailNotice && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-3 p-2.5 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center gap-2"
              >
                <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                <span className="text-xs text-green-300">{emailNotice}</span>
              </motion.div>
            )}

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handlePrevStep}
                disabled={loading}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
              <Button
                className="flex-[2]"
                variant="neon"
                size="lg"
                disabled={!agreedToPolicy || loading}
                onClick={handleBooking}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>Pay {formatPrice(total)}</>
                )}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Info Footer */}
      <div className="mt-4 space-y-2">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Info className="w-3.5 h-3.5 text-neon-cyan flex-shrink-0" />
          <span>Cancellation allowed up to 30 min before booking</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Check className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
          <span>Instant confirmation after payment</span>
        </div>
      </div>

      {/* Demo Mode Banner */}
      {demoMode && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-start gap-2"
        >
          <Info className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-yellow-200/80">
            Running in demo mode. Add Razorpay keys to enable real payments.
          </p>
        </motion.div>
      )}

      {/* Razorpay Script */}
      <script src="https://checkout.razorpay.com/v1/checkout.js" async />
    </div>
  );
}
