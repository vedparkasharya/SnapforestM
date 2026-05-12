'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Camera,
  Plus,
  MapPin,
  IndianRupee,
  Star,
  Edit,
  Trash2,
  X,
  Save,
} from 'lucide-react';

const CATEGORIES = [
  'Content Creation Room', 'Podcast Studio', 'Interview Studio',
  'Gaming & Streaming Room', 'Selfie Point Room', 'Instagram Reel Room',
  'YouTube Creator Studio', 'Luxury Aesthetic Room', 'Editing Setup Room',
  'Photography Studio', 'Cinematic Video Studio', 'Couple Creator Room',
  'Product Shoot Room', 'Green Screen Studio', 'Tech Review Setup',
  'Fashion Shoot Room', 'Neon RGB Creator Room', 'Music Recording Room',
  'Live Streaming Studio', 'Unboxing Creator Room', 'Startup Pitch Room',
  'Brand Collaboration Room', 'AI Creator Workspace', 'Virtual Production Room',
];

export default function AdminRooms() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    name: '', description: '', category: CATEGORIES[0], pricePerHour: '',
    city: 'Patna', area: '', address: '', maxPeople: '2',
    images: '', equipment: '', features: '',
  });

  useEffect(() => {
    if (status === 'authenticated') {
      if ((session?.user as any)?.role !== 'admin') {
        router.push('/');
        return;
      }
      fetchRooms();
    }
  }, [status]);

  const fetchRooms = async () => {
    try {
      const res = await fetch('/api/admin/rooms');
      const data = await res.json();
      if (data.success) setRooms(data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const res = await fetch('/api/admin/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          pricePerHour: Number(form.pricePerHour),
          maxPeople: Number(form.maxPeople),
          images: form.images.split(',').map((s) => s.trim()).filter(Boolean),
          equipment: form.equipment.split(',').map((s) => s.trim()).filter(Boolean),
          features: form.features.split(',').map((s) => s.trim()).filter(Boolean),
          rating: 4.5,
          reviewCount: 0,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowAdd(false);
        setForm({ name: '', description: '', category: CATEGORIES[0], pricePerHour: '', city: 'Patna', area: '', address: '', maxPeople: '2', images: '', equipment: '', features: '' });
        fetchRooms();
      }
    } catch (error) {
      console.error(error);
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Manage Studios</h1>
            <p className="text-gray-400 text-sm">Add, edit and manage creator studios</p>
          </div>
          <button
            onClick={() => setShowAdd(!showAdd)}
            className="flex items-center gap-2 px-4 py-2 btn-primary rounded-lg text-white text-sm font-medium"
          >
            {showAdd ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showAdd ? 'Cancel' : 'Add Studio'}
          </button>
        </div>

        {showAdd && (
          <div className="bg-[#13131f] rounded-xl p-6 border border-[#1e1e2e] mb-8">
            <h2 className="text-lg font-semibold text-white mb-4">Add New Studio</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input placeholder="Studio Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="px-4 py-2 bg-white/5 border border-[#1e1e2e] rounded-lg text-white placeholder-gray-500 focus:border-purple-500" />
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="px-4 py-2 bg-white/5 border border-[#1e1e2e] rounded-lg text-white focus:border-purple-500">
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <input placeholder="Price per hour (Rs.)" type="number" value={form.pricePerHour} onChange={(e) => setForm({ ...form, pricePerHour: e.target.value })} className="px-4 py-2 bg-white/5 border border-[#1e1e2e] rounded-lg text-white placeholder-gray-500 focus:border-purple-500" />
              <input placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="px-4 py-2 bg-white/5 border border-[#1e1e2e] rounded-lg text-white placeholder-gray-500 focus:border-purple-500" />
              <input placeholder="Area" value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} className="px-4 py-2 bg-white/5 border border-[#1e1e2e] rounded-lg text-white placeholder-gray-500 focus:border-purple-500" />
              <input placeholder="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="px-4 py-2 bg-white/5 border border-[#1e1e2e] rounded-lg text-white placeholder-gray-500 focus:border-purple-500" />
              <input placeholder="Max People" type="number" value={form.maxPeople} onChange={(e) => setForm({ ...form, maxPeople: e.target.value })} className="px-4 py-2 bg-white/5 border border-[#1e1e2e] rounded-lg text-white placeholder-gray-500 focus:border-purple-500" />
              <input placeholder="Image URLs (comma separated)" value={form.images} onChange={(e) => setForm({ ...form, images: e.target.value })} className="px-4 py-2 bg-white/5 border border-[#1e1e2e] rounded-lg text-white placeholder-gray-500 focus:border-purple-500" />
              <input placeholder="Equipment (comma separated)" value={form.equipment} onChange={(e) => setForm({ ...form, equipment: e.target.value })} className="px-4 py-2 bg-white/5 border border-[#1e1e2e] rounded-lg text-white placeholder-gray-500 focus:border-purple-500" />
              <input placeholder="Features (comma separated)" value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })} className="px-4 py-2 bg-white/5 border border-[#1e1e2e] rounded-lg text-white placeholder-gray-500 focus:border-purple-500" />
              <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="sm:col-span-2 px-4 py-2 bg-white/5 border border-[#1e1e2e] rounded-lg text-white placeholder-gray-500 focus:border-purple-500 h-24 resize-none" />
            </div>
            <button onClick={handleSubmit} className="mt-4 flex items-center gap-2 px-6 py-2 btn-primary rounded-lg text-white font-medium">
              <Save className="w-4 h-4" /> Save Studio
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rooms.map((room) => (
            <div key={room._id} className="bg-[#13131f] rounded-xl border border-[#1e1e2e] overflow-hidden">
              <div className="h-32 overflow-hidden">
                <img src={room.images?.[0] || '/placeholder.jpg'} alt={room.name} className="w-full h-full object-cover" />
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-white font-medium text-sm">{room.name}</h3>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                    <span className="text-xs text-gray-400">{room.rating}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-gray-500 text-xs mb-2">
                  <MapPin className="w-3 h-3" /> {room.area}, {room.city}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-white">Rs. {room.pricePerHour}/hr</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${room.isActive ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                    {room.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
