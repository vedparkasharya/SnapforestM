"use client";

import Link from "next/link";
import { MapPin, ArrowRight } from "lucide-react";

const NAV_LINKS = [
  { label: "Studios", href: "/rooms" },
  { label: "Pricing", href: "/#pricing" },
  { label: "Dashboard", href: "/dashboard" },
  { label: "Admin", href: "/admin/login" },
];

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.08] bg-[#111111]">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
          <div>
            <Link href="/" className="text-lg font-medium tracking-[-0.02em] text-white">Snapforest</Link>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-[#888888]">
              Creator spaces in Patna for recording, filming, photography, music, meetings and more. Browse the current listings and book the room that fits your session.
            </p>
            <p className="mt-4 text-xs text-[#666666]">Patna, Bihar</p>
          </div>

          <div>
            <p className="sf-label mb-4">NAVIGATION</p>
            <ul className="space-y-3">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-white/70 transition-colors hover:text-white">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="sf-label mb-4">EXPLORE</p>
            <div className="space-y-4 text-sm text-[#888888]">
              <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-[#c8e6c9]" /> Current listings in Patna</p>
              <p className="leading-6">Room pages show the exact address, equipment, capacity and current rates before booking.</p>
              <Link href="/rooms" className="btn-primary inline-flex text-xs">Browse studios <ArrowRight className="ml-1.5 h-3.5 w-3.5" aria-hidden="true" /></Link>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/[0.08]">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-6 sm:flex-row sm:px-6 lg:px-8">
          <p className="font-mono text-xs text-[#888888]">© {new Date().getFullYear()} Snapforest. All rights reserved.</p>
          <p className="text-xs text-white/35">Built for creators.</p>
        </div>
      </div>
    </footer>
  );
}
