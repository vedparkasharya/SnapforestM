'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  Users,
  Camera,
  CalendarCheck,
  IndianRupee,
  TrendingUp,
  ArrowRight,
  Clock,
  CheckCircle,
  XCircle,
  Clock3,
} from 'lucide-react';

interface DashboardData {
  totalBookings: number;
  totalRooms: number;
  totalUsers: number;
  totalRevenue: number;
  recentBookings: any[];
  statusCounts: Record<string, number>;
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
    if (status === 'authenticated') {
      if ((session?.user as any)?.role !== 'admin') {
        router.push('/');
        return;
      }
      fetchDashboard();
    }
  }, [status]);

  const fetchDashboard = async () => {
    try {
      const res = await fetch('/api/admin/dashboard');
      const result = await res.json();
      if (result.success) {
        setData(result.data);
      } else {
        setError(result.message);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="pt-20 pb-16 min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-20 pb-16 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <Link href="/" className="text-purple-400 hover:text-purple-300">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const stats = [
    {
      title: 'Total Bookings',
      value: data.totalBookings,
      icon: CalendarCheck,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
      link: '/admin/bookings',
    },
    {
      title: 'Total Studios',
      value: data.totalRooms,
      icon: Camera,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
      link: '/admin/rooms',
    },
    {
      title: 'Total Users',
      value: data.totalUsers,
      icon: Users,
      color: 'text-green-400',
      bg: 'bg-green-500/10',
      link: '#',
    },
    {
      title: 'Total Revenue',
      value: `Rs. ${data.totalRevenue.toLocaleString()}`,
      icon: IndianRupee,
      color: 'text-yellow-400',
      bg: 'bg-yellow-500/10',
      link: '#',
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'pending': return <Clock3 className="w-4 h-4 text-yellow-400" />;
      case 'cancelled': return <XCircle className="w-4 h-4 text-red-400" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="pt-20 pb-16 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 creator-gradient rounded-lg flex items-center justify-center">
            <LayoutDashboard className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-gray-400 text-sm">Manage studios, bookings, and users</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => (
            <Link
              key={stat.title}
              href={stat.link}
              className="bg-[#13131f] rounded-xl p-5 border border-[#1e1e2e] hover:border-purple-500/30 transition-all group"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 ${stat.bg} rounded-lg flex items-center justify-center`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-purple-400 transition-all" />
              </div>
              <p className="text-2xl font-bold text-white mb-1">{stat.value}</p>
              <p className="text-sm text-gray-400">{stat.title}</p>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Bookings */}
          <div className="lg:col-span-2">
            <div className="bg-[#13131f] rounded-xl border border-[#1e1e2e]">
              <div className="p-5 border-b border-[#1e1e2e] flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">Recent Bookings</h2>
                <Link href="/admin/bookings" className="text-sm text-purple-400 hover:text-purple-300">
                  View All
                </Link>
              </div>
              <div className="divide-y divide-[#1e1e2e]">
                {data.recentBookings.length > 0 ? (
                  data.recentBookings.map((booking) => (
                    <div key={booking._id} className="p-4 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center shrink-0">
                        {getStatusIcon(booking.status)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium text-sm truncate">
                          {booking.room?.name || 'Unknown Room'}
                        </p>
                        <p className="text-gray-500 text-xs">
                          {booking.user?.name || 'Unknown'} · {booking.bookingId}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-white font-medium text-sm">Rs. {booking.totalAmount}</p>
                        <p className="text-gray-500 text-xs">
                          {new Date(booking.createdAt).toLocaleDateString('en-IN')}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-gray-500">
                    No bookings yet
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Status Distribution */}
          <div>
            <div className="bg-[#13131f] rounded-xl border border-[#1e1e2e]">
              <div className="p-5 border-b border-[#1e1e2e]">
                <h2 className="text-lg font-semibold text-white">Booking Status</h2>
              </div>
              <div className="p-5 space-y-4">
                {Object.entries(data.statusCounts).map(([status, count]) => (
                  <div key={status}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-300 capitalize">{status}</span>
                      <span className="text-sm text-white font-medium">{count as number}</span>
                    </div>
                    <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          status === 'confirmed' ? 'bg-green-500' :
                          status === 'pending' ? 'bg-yellow-500' :
                          status === 'cancelled' ? 'bg-red-500' : 'bg-purple-500'
                        }`}
                        style={{
                          width: `${data.totalBookings > 0 ? ((count as number) / data.totalBookings) * 100 : 0}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-[#13131f] rounded-xl border border-[#1e1e2e] mt-6">
              <div className="p-5 border-b border-[#1e1e2e]">
                <h2 className="text-lg font-semibold text-white">Quick Actions</h2>
              </div>
              <div className="p-5 space-y-3">
                <Link
                  href="/admin/rooms"
                  className="flex items-center gap-3 p-3 bg-purple-500/10 rounded-lg text-purple-300 hover:bg-purple-500/20 transition-all"
                >
                  <Camera className="w-5 h-5" />
                  <span className="text-sm font-medium">Manage Studios</span>
                </Link>
                <Link
                  href="/admin/bookings"
                  className="flex items-center gap-3 p-3 bg-blue-500/10 rounded-lg text-blue-300 hover:bg-blue-500/20 transition-all"
                >
                  <CalendarCheck className="w-5 h-5" />
                  <span className="text-sm font-medium">Manage Bookings</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
