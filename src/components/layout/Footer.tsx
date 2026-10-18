"use client";

import Link from "next/link";
import { ArrowUpRight, MapPin, MoveUpRight } from "lucide-react";

const NAV_LINKS = [
  { label: "Studios", href: "/rooms" },
  { label: "Pricing", href: "/#pricing" },
  { label: "Dashboard", href: "/dashboard" },
  { label: "Admin", href: "/admin/login" },
];

export default function Footer() {
  return (
    <footer className="sf-site-footer">
      <div className="sf-footer-main">
        <div className="sf-footer-brand">
          <Link href="/" className="sf-footer-wordmark" aria-label="Snapforest home">
            <span className="sf-footer-mark">S<span>.</span></span>
            <span>SNAPFOREST<small>CREATOR SPACES</small></span>
          </Link>
          <p>Space to make something worth sharing.</p>
          <p className="sf-footer-description">Discover creator-ready studios for podcasts, photography, music, filming and focused work.</p>
          <span className="sf-footer-location"><MapPin size={14} /> Patna &amp; Gaya, Bihar, India</span>
        </div>
        <div className="sf-footer-nav">
          <p className="sf-footer-eyebrow">EXPLORE</p>
          <div className="sf-footer-links">
            {NAV_LINKS.map((link) => <Link key={link.href} href={link.href}>{link.label}<ArrowUpRight size={13} /></Link>)}
          </div>
        </div>
        <div className="sf-footer-cta">
          <span className="sf-footer-eyebrow">YOUR NEXT TAKE STARTS HERE</span>
          <h2>Bring the idea.<br /><em>Find the space.</em></h2>
          <Link href="/rooms" className="sf-footer-button">Explore studios <MoveUpRight size={16} /></Link>
        </div>
      </div>
      <div className="sf-footer-bottom">
        <span>© {new Date().getFullYear()} Snapforest. All rights reserved.</span>
        <span className="sf-footer-bottom-note"><i /> BUILT FOR CREATORS</span>
      </div>
    </footer>
  );
}
