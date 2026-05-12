'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  MapPin,
  Star,
  Users,
  Wifi,
  Wind,
  Clock,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Info,
  Shield,
  Mic,
  Camera,
  Monitor,
  Lightbulb,
  Headphones,
  Speaker,
  Zap,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';

const equipmentIcons: Record<string, any> = {
  'RGB LED Panels': Lightbulb,
  'Neon Wall': Zap,
  'Ring Light': Lightbulb,
  'Softbox Lights': Lightbulb,
  'Sony Camera': Camera,
  'DSLR Camera': Camera,
  'Shure SM7B Mic': Mic,
  'Condenser Mic': Mic,
  'Podcast Mic': Mic,
  'Lapel Mic': Mic,
  'Gaming PC': Monitor,
  'Dual 4K Monitors': Monitor,
  'Stream Deck': Monitor,
  'Headphones': Headphones,
  'Headset': Headphones,
  'Speaker': Speaker,
  'Bluetooth Speaker': Speaker,
  'Mixer': Mic,
  'Webcam': Camera,
  'Green Screen': Monitor,
  default: CheckCircle,
};

function getEquipmentIcon(name: string) {
  return equipmentIcons[name] || equipmentIcons.default;
}

const generateTimeSlots = (open: string, close: string) => {
  const slots: string[] = [];
  let [h, m] = open.split(':').map(Number);
  const [endH] = close.split(':').map(Number);
  while (h < endH) {
    slots.push(`${String(h).padStart(2, '0')}:00`);
    slots.push(`${String(h).padStart(2, '0')}:30`);
    h++;
  }
  return slots;
};

export default function RoomDetail() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();

  const [room, setRoom] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentImage, setCurrentImage] = useState(0);
  const [selectedDate, setSelectedDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [damagePolicyAccepted, setDamagePolicyAccepted] = useState(false);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState('');

  const roomId = params.id as string;

  useEffect(() => {
    fetchRoom();
  }, [roomId]);

  useEffect(() => {
    if (selectedDate) {
      fetchAvailability();
    }
  }, [selectedDate]);

  const fetchRoom = async () => {
    try {
      const res = await fetch(`/api/rooms/${roomId}`);
      const data = await res.json();
      if (data.success) {
        setRoom(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch room:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailability = async () => {
    try {
      const res = await fetch(`/api/rooms/${roomId}/availability?date=${selectedDate}`);
      const data = await res.json();
      if (data.success) {
        const slots: string[] = [];
        data.data.bookedSlots.forEach((slot: any) => {
          const allSlots = generateTimeSlots(slot.startTime, slot.endTime);
          slots.push(...allSlots);
        });
        setBookedSlots(slots);
      }
    } catch (error) {
      console.error('Failed to fetch availability:', error);
    }
  };

  const timeSlots = room ? generateTimeSlots('09:00', '21:00') : [];

  const getDuration = () => {
    if (!startTime || !endTime) return 0;
    const [sh, sm] = startTime.split(':').map(Number);
    const [eh, em] = endTime.split(':').map(Number);
    return (eh + em / 60) - (sh + sm / 60);
  };

  const duration = getDuration();
  const totalAmount = duration > 0 ? Math.ceil(duration * room?.pricePerHour) : 0;

  const isSlotBooked = (slot: string) => {
    if (!startTime) return false;
    return bookedSlots.includes(slot);
  };

  const handleBooking = async () => {
    if (!session) {
      router.push('/login');
      return;
    }
    if (!selectedDate || !startTime || !endTime) {
      setBookingError('Please select date, start time and end time');
      return;
    }
    if (!damagePolicyAccepted) {
      setBookingError('Please accept the damage policy');
      return;
    }
    if (duration <= 0) {
      setBookingError('End time must be after start time');
      return;
    }

    setBookingLoading(true);
    setBookingError('');

    try {
      // Create Razorpay order
      const orderRes = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId, duration }),
      });
      const orderData = await orderRes.json();

      if (!orderData.success) {
        setBookingError(orderData.message || 'Payment initialization failed');
        setBookingLoading(false);
        return;
      }

      // Load Razorpay
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        const options = {
          key: orderData.data.keyId,
          amount: orderData.data.amount,
          currency: orderData.data.currency,
          name: 'SnapforestX',
          description: `Booking: ${room.name}`,
          order_id: orderData.data.orderId,
          handler: async (response: any) => {
            // Verify payment
            const verifyRes = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                orderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
              }),
            });
            const verifyData = await verifyRes.json();

            if (verifyData.success) {
              // Create booking
              const bookingRes = await fetch('/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  roomId,
                  date: selectedDate,
                  startTime,
                  endTime,
                  damagePolicyAccepted,
                  paymentId: response.razorpay_payment_id,
                  orderId: response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature: response.razorpay_signature,
                }),
              });
              const bookingData = await bookingRes.json();

              if (bookingData.success) {
                setBookingSuccess(`Booking confirmed! ID: ${bookingData.bookingId}`);
              } else {
                setBookingError(bookingData.message || 'Booking failed');
              }
            } else {
              setBookingError('Payment verification failed');
            }
            setBookingLoading(false);
          },
          prefill: {
            name: session?.user?.name || '',
            email: session?.user?.email || '',
          },
          theme: {
            color: '#8b5cf6',
          },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.on('payment.failed', (response: any) => {
          setBookingError('Payment failed: ' + response.error.description);
          setBookingLoading(false);
        });
        rzp.open();
      };
      document.body.appendChild(script);
    } catch (error: any) {
      setBookingError(error.message || 'Booking failed');
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="pt-20 pb-16 flex items-center justify-center min-h-screen">
        <div className="animate-spin w-10 h-10 border-2 border-purple-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!room) {
    return (
      <div className="pt-20 pb-16 text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Studio not found</h2>
        <Link href="/rooms" className="text-purple-400 hover:text-purple-300">
          Browse all studios
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
          <Link href="/" className="hover:text-purple-400 transition-all">Home</Link>
          <ChevronLeft className="w-3 h-3 rotate-180" />
          <Link href="/rooms" className="hover:text-purple-400 transition-all">Studios</Link>
          <ChevronLeft className="w-3 h-3 rotate-180" />
          <span className="text-gray-500 truncate">{room.name}</span>
        </div>

        {/* Gallery */}
        <div className="relative rounded-2xl overflow-hidden mb-8">
          <div className="relative h-64 sm:h-96">
            <img
              src={room.images?.[currentImage] || '/placeholder.jpg'}
              alt={room.name}
              className="w-full h-full object-cover"
            />
            {room.images?.length > 1 && (
              <>
                <button
                  onClick={() => setCurrentImage((prev) => (prev === 0 ? room.images.length - 1 : prev - 1))}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-all"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setCurrentImage((prev) => (prev === room.images.length - 1 ? 0 : prev + 1))}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-all"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {room.images?.map((_: any, i: number) => (
                <button
                  key={i}
                  onClick={() => setCurrentImage(i)}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    i === currentImage ? 'bg-white w-6' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Title */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="category-badge text-xs font-medium px-3 py-1 rounded-full">
                  {room.category}
                </span>
                <div className="flex items-center gap-1 bg-yellow-500/10 px-2 py-1 rounded-full">
                  <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                  <span className="text-xs text-yellow-400 font-medium">{room.rating}</span>
                  <span className="text-xs text-gray-500">({room.reviewCount} reviews)</span>
                </div>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">{room.name}</h1>
              <div className="flex items-center gap-2 text-gray-400">
                <MapPin className="w-4 h-4 text-purple-400" />
                <span className="text-sm">{room.address}</span>
              </div>
            </div>

            {/* Quick Info */}
            <div className="flex flex-wrap gap-4">
              {[
                { icon: Users, label: `${room.maxPeople} People` },
                { icon: Clock, label: 'Hourly Booking' },
                { icon: Wifi, label: 'Free WiFi' },
                { icon: Wind, label: 'AC' },
              ].map((info) => (
                <div key={info.label} className="flex items-center gap-2 bg-[#13131f] px-4 py-2 rounded-lg border border-[#1e1e2e]">
                  <info.icon className="w-4 h-4 text-purple-400" />
                  <span className="text-sm text-gray-300">{info.label}</span>
                </div>
              ))}
            </div>

            {/* Description */}
            <div className="bg-[#13131f] rounded-xl p-6 border border-[#1e1e2e]">
              <h2 className="text-lg font-semibold text-white mb-3">About this Studio</h2>
              <p className="text-gray-400 leading-relaxed">{room.description}</p>
            </div>

            {/* Equipment */}
            <div className="bg-[#13131f] rounded-xl p-6 border border-[#1e1e2e]">
              <h2 className="text-lg font-semibold text-white mb-4">Equipment Included</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {room.equipment?.map((eq: string) => {
                  const Icon = getEquipmentIcon(eq);
                  return (
                    <div key={eq} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                      <Icon className="w-4 h-4 text-purple-400 shrink-0" />
                      <span className="text-sm text-gray-300">{eq}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Features */}
            <div className="bg-[#13131f] rounded-xl p-6 border border-[#1e1e2e]">
              <h2 className="text-lg font-semibold text-white mb-4">Studio Features</h2>
              <div className="flex flex-wrap gap-2">
                {room.features?.map((feature: string) => (
                  <span
                    key={feature}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-500/10 text-purple-300 rounded-lg text-sm border border-purple-500/20"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    {feature}
                  </span>
                ))}
              </div>
            </div>

            {/* Availability Schedule */}
            <div className="bg-[#13131f] rounded-xl p-6 border border-[#1e1e2e]">
              <h2 className="text-lg font-semibold text-white mb-4">Availability Schedule</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {Object.entries(room.availability || {}).map(([day, slots]: [string, any]) => (
                  <div key={day} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <span className="text-sm text-gray-300 capitalize">{day}</span>
                    <span className={`text-sm ${slots.available ? 'text-green-400' : 'text-red-400'}`}>
                      {slots.available ? `${slots.open} - ${slots.close}` : 'Closed'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right - Booking Widget */}
          <div className="lg:col-span-1">
            <div className="sticky top-20">
              <div className="bg-[#13131f] rounded-2xl p-6 border border-[#1e1e2e]">
                {/* Price */}
                <div className="flex items-baseline gap-2 mb-6 pb-6 border-b border-[#1e1e2e]">
                  <span className="text-3xl font-bold text-white">Rs. {room.pricePerHour}</span>
                  <span className="text-gray-400">/hour</span>
                </div>

                {/* Date Selection */}
                <div className="mb-4">
                  <label className="text-sm text-gray-400 mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4" /> Select Date
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => {
                      setSelectedDate(e.target.value);
                      setStartTime('');
                      setEndTime('');
                    }}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 bg-white/5 border border-[#1e1e2e] rounded-xl text-white focus:border-purple-500 transition-all"
                  />
                </div>

                {/* Time Selection */}
                {selectedDate && (
                  <>
                    <div className="mb-4">
                      <label className="text-sm text-gray-400 mb-2 flex items-center gap-2">
                        <Clock className="w-4 h-4" /> Start Time
                      </label>
                      <div className="grid grid-cols-4 gap-2 max-h-40 overflow-y-auto">
                        {timeSlots.map((slot) => {
                          const booked = isSlotBooked(slot);
                          return (
                            <button
                              key={slot}
                              onClick={() => {
                                setStartTime(slot);
                                setEndTime('');
                              }}
                              disabled={booked}
                              className={`px-2 py-2 rounded-lg text-xs font-medium transition-all ${
                                startTime === slot
                                  ? 'creator-gradient text-white'
                                  : booked
                                  ? 'bg-red-500/10 text-red-400 cursor-not-allowed'
                                  : 'bg-white/5 text-gray-300 hover:bg-purple-500/20 hover:text-white'
                              }`}
                            >
                              {slot}
                              {booked && <span className="block text-[10px] text-red-400">Booked</span>}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {startTime && (
                      <div className="mb-4">
                        <label className="text-sm text-gray-400 mb-2 flex items-center gap-2">
                          <Clock className="w-4 h-4" /> End Time
                        </label>
                        <select
                          value={endTime}
                          onChange={(e) => setEndTime(e.target.value)}
                          className="w-full px-4 py-3 bg-white/5 border border-[#1e1e2e] rounded-xl text-white focus:border-purple-500"
                        >
                          <option value="">Select end time</option>
                          {timeSlots
                            .filter((s) => s > startTime)
                            .map((slot) => (
                              <option key={slot} value={slot}>
                                {slot}
                              </option>
                            ))}
                        </select>
                      </div>
                    )}
                  </>
                )}

                {/* Damage Policy */}
                {startTime && endTime && (
                  <div className="mb-4 p-4 bg-yellow-500/5 border border-yellow-500/20 rounded-xl">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={damagePolicyAccepted}
                        onChange={(e) => setDamagePolicyAccepted(e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-gray-500 accent-purple-500"
                      />
                      <div>
                        <span className="text-sm text-gray-300">
                          I agree to the{' '}
                          <Link href="/policy" target="_blank" className="text-purple-400 hover:text-purple-300 underline">
                            Damage Policy
                          </Link>
                        </span>
                        <p className="text-xs text-gray-500 mt-1">
                          I understand that any damage to equipment caused by misuse will be charged.
                        </p>
                      </div>
                    </label>
                  </div>
                )}

                {/* Price Summary */}
                {duration > 0 && (
                  <div className="mb-4 p-4 bg-white/5 rounded-xl space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Rs. {room.pricePerHour} x {duration} hr</span>
                      <span className="text-white">Rs. {totalAmount}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Platform fee</span>
                      <span className="text-white">Rs. 0</span>
                    </div>
                    <div className="border-t border-[#1e1e2e] pt-2 flex justify-between">
                      <span className="text-white font-semibold">Total</span>
                      <span className="text-white font-bold text-lg">Rs. {totalAmount}</span>
                    </div>
                  </div>
                )}

                {/* Book Button */}
                <button
                  onClick={handleBooking}
                  disabled={bookingLoading || !selectedDate || !startTime || !endTime || !damagePolicyAccepted}
                  className="w-full py-4 btn-primary rounded-xl text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {bookingLoading ? (
                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                  ) : (
                    <>
                      <Zap className="w-5 h-5" />
                      {session ? 'Book Now & Pay' : 'Sign In to Book'}
                    </>
                  )}
                </button>

                {/* Messages */}
                {bookingError && (
                  <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <p className="text-sm text-red-400">{bookingError}</p>
                  </div>
                )}
                {bookingSuccess && (
                  <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-green-400 font-medium">{bookingSuccess}</p>
                      <Link href="/bookings" className="text-sm text-purple-400 hover:text-purple-300 mt-1 inline-block">
                        View my bookings →
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
