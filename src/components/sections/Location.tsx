"use client";

import { motion } from "framer-motion";
import { MapPin, Navigation } from "lucide-react";
import Image from "next/image";

const PILLS = ["Boring Road", "Near Patna Junction", "AC Rooms", "24/7 Access"];

export default function LocationShowcase() {
  return (
    <section className="bg-[#111111] section-padding">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16 items-center">
          {/* Left: Image */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-3 relative aspect-[16/10] rounded-lg overflow-hidden"
          >
            <Image
              src="/rooms/exterior-main.jpg"
              alt="Snapforest Studio Exterior"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#111111]/40 to-transparent" />
          </motion.div>

          {/* Right: Content */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-2"
          >
            <p className="sf-label-forest mb-4">FIND US</p>
            <h2
              className="text-heading-md text-white mb-4"
              style={{ fontFamily: "var(--font-primary)" }}
            >
              Patna&apos;s Creative Hub
            </h2>
            <p className="text-[#888888] leading-relaxed mb-6">
              Located in the heart of Bihar&apos;s capital, our studios are
              designed for creators who demand professional-grade equipment and
              inspiring environments.
            </p>

            {/* Pills */}
            <div className="flex flex-wrap gap-2 mb-8">
              {PILLS.map((pill, i) => (
                <span
                  key={i}
                  className="px-4 py-1.5 rounded-pill bg-[#2a2a2a] text-white font-mono text-xs"
                >
                  {pill}
                </span>
              ))}
            </div>

            <a
              href="https://maps.google.com/?q=Patna+Bihar"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary inline-flex"
            >
              <Navigation className="w-4 h-4 mr-2" />
              Get Directions
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
