"use client";

import Link from "next/link";
import { MapPin, Mail, Phone } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-background/50 backdrop-blur-xl mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-pink bg-clip-text text-transparent">
              SnapforestX
            </Link>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              Premium creator studio booking platform in Patna. Book podcast studios, YouTube setups, music rooms, photo studios & more.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/" className="hover:text-neon-cyan transition-colors">Home</Link></li>
              <li><Link href="/rooms" className="hover:text-neon-cyan transition-colors">Browse Rooms</Link></li>
              <li><Link href="/dashboard" className="hover:text-neon-cyan transition-colors">My Bookings</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Contact</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-neon-cyan" />
                Patna, Bihar, India
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-neon-cyan" />
                contact@snapforestx.com
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-neon-cyan" />
                +91 98765 43210
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-white/5 text-center text-xs text-muted-foreground">
          SnapforestX - Creator Studio Booking Platform | Made with for Patna Creators
        </div>
      </div>
    </footer>
  );
}
