"use client";

import { motion } from "framer-motion";
import { User, Linkedin, Twitter, Mail } from "lucide-react";

/**
 * FounderSection - Ved Prakash Arya
 * SEO-optimized founder info component for Snapforest
 * This component is available for use but NOT auto-inserted into any page
 * to preserve existing website structure as requested.
 *
 * To use: Import and add <FounderSection /> to src/app/page.tsx
 */
export default function FounderSection() {
  return (
    <section
      id="founder"
      className="bg-[#111111] section-padding"
      aria-label="About the Founder"
    >
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-16"
        >
          <p className="sf-label-forest mb-4">MEET THE FOUNDER</p>
          <h2
            className="text-heading-lg text-white"
            style={{ fontFamily: "var(--font-primary)" }}
          >
            The Vision Behind Snapforest
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Founder Image/Avatar */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="flex justify-center"
          >
            <div className="relative w-64 h-64 sm:w-80 sm:h-80">
              {/* Animated ring */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#c8e6c9]/20 via-[#c8e6c9]/10 to-transparent animate-pulse" />
              <div className="absolute inset-2 rounded-full bg-gradient-to-br from-[#1a472a]/30 to-[#0f0f0f] flex items-center justify-center border border-[#c8e6c9]/20">
                <User className="w-24 h-24 sm:w-32 sm:h-32 text-[#c8e6c9]/60" />
              </div>
              {/* Floating badges */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-2 -right-2 px-3 py-1.5 rounded-full bg-[#1a472a]/80 border border-[#c8e6c9]/20 text-[#c8e6c9] text-xs font-medium"
              >
                Founder & CEO
              </motion.div>
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="absolute -bottom-2 -left-2 px-3 py-1.5 rounded-full bg-[#1a472a]/80 border border-[#c8e6c9]/20 text-[#c8e6c9] text-xs font-medium"
              >
                Bihar, India
              </motion.div>
            </div>
          </motion.div>

          {/* Founder Info */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          >
            <h3
              className="text-3xl sm:text-4xl font-bold text-white mb-2"
              style={{ fontFamily: "var(--font-primary)" }}
            >
              Ved Prakash Arya
            </h3>
            <p className="text-lg text-[#c8e6c9] mb-6">
              Founder of Snapforest - Creator Studio Booking Platform
            </p>

            <div className="space-y-4 text-[#888888] leading-relaxed mb-8">
              <p>
                Ved Prakash Arya founded Snapforest with a mission to provide
                professional creator studios across Bihar. Starting from Patna,
                Snapforest now offers premium spaces for podcasters, YouTubers,
                musicians, photographers, gamers, and content creators.
              </p>
              <p>
                Under Ved&apos;s leadership, Snapforest has become the go-to
                destination for creator studio rentals in Bihar, with plans to
                expand to Gaya and other cities across the state. The platform
                offers podcast rooms, YouTube studios, gaming rooms, interview
                rooms, reel studios, music rooms, and photo studios.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              {[
                { value: "8+", label: "Studio Types" },
                { value: "2+", label: "Cities" },
                { value: "1000+", label: "Creators Served" },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="text-center p-4 rounded-lg bg-[#2a2a2a] border border-white/[0.08]"
                >
                  <p className="text-2xl font-bold text-[#c8e6c9]">{stat.value}</p>
                  <p className="text-xs text-[#888888] mt-1">{stat.label}</p>
                </motion.div>
              ))}
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-3">
              {[
                { icon: Linkedin, label: "LinkedIn", href: "#" },
                { icon: Twitter, label: "Twitter", href: "#" },
                { icon: Mail, label: "Email", href: "mailto:ved@snapforestx.com" },
              ].map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="w-10 h-10 rounded-lg bg-[#2a2a2a] flex items-center justify-center text-[#888888] hover:text-[#c8e6c9] hover:bg-[#1a472a]/30 transition-all border border-white/[0.08]"
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
