"use client";

import Link from "next/link";
import { MapPin, Mail, Phone, ArrowRight } from "lucide-react";

const NAV_LINKS = [
  { label: "Studios", href: "/rooms" },
  { label: "Pricing", href: "/#pricing" },
  { label: "Dashboard", href: "/dashboard" },
  { label: "Admin", href: "/admin/login" },
];

const SOCIAL_ICONS = [
  {
    label: "Instagram",
    href: "https://instagram.com",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
      </svg>
    ),
  },
  {
    label: "Twitter",
    href: "https://twitter.com",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    label: "YouTube",
    href: "https://youtube.com",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
];

export default function Footer() {
  return (
    <footer className="bg-[#111111] border-t border-white/[0.08]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand */}
          <div>
            <Link href="/" className="text-lg font-medium text-white tracking-[-0.02em]">
              Snapforest
            </Link>
            <p className="mt-3 text-sm text-[#888888] leading-relaxed">
              Creator Studio Rentals in Patna and Gaya, Bihar. Premium spaces
              for podcasters, YouTubers, musicians, photographers, gamers, and
              all types of creators. Founded by Ved Prakash Arya.
            </p>
            {/* SEO-rich founder mention */}
            <div className="mt-4 pt-4 border-t border-white/[0.06]">
              <p className="text-xs text-[#666666]">
                Founded by{" "}
                <span className="text-[#888888]">Ved Prakash Arya</span>
                <span className="mx-2 text-[#444444]">|</span>
                <span>Patna &middot; Gaya &middot; Bihar</span>
              </p>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <p className="sf-label mb-4">NAVIGATION</p>
            <ul className="space-y-3">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/70 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & CTA */}
          <div>
            <p className="sf-label mb-4">CONTACT</p>
            <ul className="space-y-3 text-sm text-[#888888] mb-6">
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#1a472a]" />
                Patna, Bihar, India
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#1a472a]" />
                hello@snapforestx.com
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#1a472a]" />
                +91 98765 43210
              </li>
            </ul>

            <Link href="/rooms">
              <span className="btn-primary text-xs py-2.5 px-5 cursor-pointer">
                Book a Studio
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-mono text-xs text-[#888888]">
            &copy; 2026 Snapforest. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            {SOCIAL_ICONS.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                className="text-[#888888] hover:text-white transition-colors"
              >
                {social.icon}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
