'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  CalendarCheck,
  Clock,
  MapPin,
  AlertCircle,
  CheckCircle,
  XCircle,
  ArrowRight,
  Camera,
} from 'lucide-react';

export default function Bookings() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
    if (status === 'authenticated') {
      fetchBookings();
    }
  }, [status]);

  const fetchBookings = async () => {
    try {
      const res = await fetch('/api/bookings');
      const data = await res.json();
      if (data.success) {
        setBookings(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string, paymentStatus: string) => {
    if (status === 'confirmed' && paymentStatus === 'paid') {
      return (
        <span className="flex items-center gap-1 text-green-400 bg-green-500/10 px-3 py-1 rounded-full text-xs font-medium">
          <CheckCircle className="w-3 h-3" /> Confirmed
        </span>
      );
    }
    if (status === 'pending') {
      return (
        <span className="flex items-center gap-1 text-yellow-400 bg-yellow-500/10 px-3 py-1 rounded-full text-xs font-medium">
          <Clock className="w-3 h-3" /> Pending
        </span>
      );
    }
    if (status === 'cancelled') {
      return (
        <span className="flex items-center gap-1 text-red-400 bg-red-500/10 px-3 py-1 rounded-full text-xs font-medium">
          <XCircle className="w-3 h-3" /> Cancelled
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1 text-gray-400 bg-gray-500/10 px-3 py-1 rounded-full text-xs font-medium">
        <AlertCircle className="w-3 h-3" /> {status}
      </span>
    );
  };

  if (status === 'loading' || loading) {
    return (
      <div className="pt-20 pb-16 min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="pt-20 pb-16 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            My <span className="text-gradient">Bookings</span>
          </h1>
          <p className="text-gray-400">
            View and manage your creator studio bookings
          </p>
        </div>

        {/* Bookings List */}
        {bookings.length > 0 ? (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div
                key={booking._id}
                className="bg-[#13131f] rounded-xl p-5 border border-[#1e1e2e] hover:border-purple-500/30 transition-all"
              >
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Room Image */}
                  <div className="w-full sm:w-32 h-24 rounded-lg overflow-hidden shrink-0">
                    <img
                      src={booking.room?.images?.[0] || '/placeholder.jpg'}
                      alt={booking.room?.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <h3 className="text-white font-semibold">{booking.room?.name}</h3>
                        <p className="text-sm text-gray-400 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {booking.room?.city}
                        </p>
                      </div>
                      {getStatusBadge(booking.status, booking.paymentStatus)}
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-gray-400 mb-3">
                      <span className="flex items-center gap-1">
                        <CalendarCheck className="w-3.5 h-3.5 text-purple-400" />
                        {new Date(booking.date).toLocaleDateString('en-IN', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-purple-400" />
                        {booking.startTime} - {booking.endTime}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="text-gray-500">Duration:</span> {booking.duration}h
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-white">
                        Booking ID: <span className="text-purple-400">{booking.bookingId}</span>
                      </span>
                      <span className="text-lg font-bold text-white">
                        Rs. {booking.totalAmount}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Camera className="w-10 h-10 text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No bookings yet</h3>
            <p className="text-gray-400 mb-6">Book your first creator studio today</p>
            <Link
              href="/rooms"
              className="btn-primary inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-medium"
            >
              Browse Studios <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
