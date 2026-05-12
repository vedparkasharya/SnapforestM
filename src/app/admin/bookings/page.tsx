'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  CalendarCheck,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  Clock3,
  ArrowLeft,
} from 'lucide-react';

export default function AdminBookings() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'authenticated') {
      if ((session?.user as any)?.role !== 'admin') {
        router.push('/');
        return;
      }
      fetchBookings();
    }
  }, [status]);

  const fetchBookings = async () => {
    try {
      const res = await fetch('/api/admin/bookings');
      const data = await res.json();
      if (data.success) setBookings(data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <span className="flex items-center gap-1 text-green-400 bg-green-500/10 px-2 py-1 rounded-full text-xs"><CheckCircle className="w-3 h-3" /> Confirmed</span>;
      case 'pending':
        return <span className="flex items-center gap-1 text-yellow-400 bg-yellow-500/10 px-2 py-1 rounded-full text-xs"><Clock3 className="w-3 h-3" /> Pending</span>;
      case 'cancelled':
        return <span className="flex items-center gap-1 text-red-400 bg-red-500/10 px-2 py-1 rounded-full text-xs"><XCircle className="w-3 h-3" /> Cancelled</span>;
      default:
        return <span className="text-gray-400 text-xs">{status}</span>;
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="pt-20 pb-16 min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="pt-20 pb-16 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/admin" className="p-2 bg-[#13131f] rounded-lg text-gray-400 hover:text-white border border-[#1e1e2e]">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">All Bookings</h1>
            <p className="text-gray-400 text-sm">Manage all creator studio bookings</p>
          </div>
        </div>

        <div className="bg-[#13131f] rounded-xl border border-[#1e1e2e] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#1e1e2e]">
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">Booking ID</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">User</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">Studio</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">Date & Time</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">Amount</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e1e2e]">
                {bookings.length > 0 ? (
                  bookings.map((booking) => (
                    <tr key={booking._id} className="hover:bg-white/5 transition-all">
                      <td className="px-4 py-3 text-sm text-purple-400 font-medium">{booking.bookingId}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {booking.user?.image ? (
                            <img src={booking.user.image} alt="" className="w-6 h-6 rounded-full" />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center">
                              <span className="text-xs text-purple-400">{booking.user?.name?.[0] || 'U'}</span>
                            </div>
                          )}
                          <span className="text-sm text-gray-300">{booking.user?.name || 'Unknown'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm text-white">{booking.room?.name}</p>
                          <p className="text-xs text-gray-500">{booking.room?.category}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-400">
                        <div className="flex items-center gap-1">
                          <CalendarCheck className="w-3 h-3" />
                          {new Date(booking.date).toLocaleDateString('en-IN')}
                        </div>
                        <div className="flex items-center gap-1 text-xs">
                          <Clock className="w-3 h-3" />
                          {booking.startTime} - {booking.endTime}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-white font-medium">Rs. {booking.totalAmount}</td>
                      <td className="px-4 py-3">{getStatusBadge(booking.status)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                      No bookings found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
