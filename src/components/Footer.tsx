'use client';

import Link from 'next/link';
import {
  Camera,
  Globe,
  MessageCircle,
  Video,
  Mail,
  MapPin,
  Phone,
} from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-[#1e1e2e] bg-[#0a0a0f]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 creator-gradient rounded-lg flex items-center justify-center">
                <Camera className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gradient">SnapforestX</span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              India&apos;s first creator-focused studio booking platform. Book professional creator studios, podcast rooms, gaming setups, and more.
            </p>
            <div className="flex gap-3">
              <a href="#" className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-purple-400 hover:bg-purple-500/10 transition-all">
                <Globe className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 transition-all">
                <MessageCircle className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all">
                <Video className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {[
                { href: '/', label: 'Home' },
                { href: '/rooms', label: 'Browse Studios' },
                { href: '/bookings', label: 'My Bookings' },
                { href: '/login', label: 'Sign In' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-gray-400 hover:text-purple-400 text-sm transition-all">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-white font-semibold mb-4">Studio Categories</h3>
            <ul className="space-y-2">
              {[
                'YouTube Creator Studio',
                'Podcast Studio',
                'Gaming & Streaming',
                'Photography Studio',
                'Neon RGB Creator Room',
                'Green Screen Studio',
              ].map((cat) => (
                <li key={cat}>
                  <Link
                    href={`/rooms?category=${encodeURIComponent(cat)}`}
                    className="text-gray-400 hover:text-purple-400 text-sm transition-all"
                  >
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-gray-400 text-sm">
                <MapPin className="w-4 h-4 mt-0.5 text-purple-400 shrink-0" />
                <span>Patna, Bihar, India</span>
              </li>
              <li className="flex items-center gap-3 text-gray-400 text-sm">
                <Mail className="w-4 h-4 text-purple-400 shrink-0" />
                <span>snapforestx@gmail.com</span>
              </li>
              <li className="flex items-center gap-3 text-gray-400 text-sm">
                <Phone className="w-4 h-4 text-purple-400 shrink-0" />
                <span>+91 98765 43210</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-[#1e1e2e] mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} SnapforestX. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="/policy" className="text-gray-500 hover:text-purple-400 text-sm transition-all">
              Damage Policy
            </Link>
            <Link href="#" className="text-gray-500 hover:text-purple-400 text-sm transition-all">
              Terms
            </Link>
            <Link href="#" className="text-gray-500 hover:text-purple-400 text-sm transition-all">
              Privacy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
