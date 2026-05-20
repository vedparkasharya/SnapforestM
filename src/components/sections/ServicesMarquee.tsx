"use client";

import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";

const SERVICES = [
  "Podcast Studio",
  "YouTube Setup",
  "Music Room",
  "Photo Studio",
  "Gaming Room",
  "Dance Space",
  "Streaming Hub",
  "Co-working",
];

export default function ServicesMarquee() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section className="bg-[#e8f5e9] py-24 lg:py-[120px] overflow-hidden">
      <div className="px-4 sm:px-6 lg:px-8 mb-12">
        <p className="sf-label text-[#888888]">WHAT WE OFFER</p>
      </div>

      <div
        ref={trackRef}
        className="flex items-center gap-8 whitespace-nowrap"
        style={{
          transform: `translateX(${-scrollY * 0.15}px)`,
          willChange: "transform",
        }}
      >
        {SERVICES.map((service, i) => (
          <span key={i} className="flex items-center gap-8">
            <span
              className="text-heading-xl text-[#111111]/[0.15] hover:text-[#111111]/40 transition-colors duration-300 cursor-default select-none"
              style={{ fontFamily: "var(--font-primary)" }}
            >
              {service}
            </span>
            <span className="text-[#1a472a] text-2xl">•</span>
          </span>
        ))}
        {SERVICES.map((service, i) => (
          <span key={`dup-${i}`} className="flex items-center gap-8">
            <span
              className="text-heading-xl text-[#111111]/[0.15] hover:text-[#111111]/40 transition-colors duration-300 cursor-default select-none"
              style={{ fontFamily: "var(--font-primary)" }}
            >
              {service}
            </span>
            <span className="text-[#1a472a] text-2xl">•</span>
          </span>
        ))}
      </div>
    </section>
  );
}
