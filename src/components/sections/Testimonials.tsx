"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";

const TESTIMONIALS = [
  {
    quote:
      "The podcast studio is absolutely world-class. Sound quality is insane and the equipment is top-notch. Best investment for my show.",
    name: "Rahul Kumar",
    role: "Podcaster",
    avatar: "R",
    rating: 5,
  },
  {
    quote:
      "I film all my YouTube videos here now. The lighting setup saves me hours of post-production. Highly recommend the YouTube studio!",
    name: "Priya Singh",
    role: "YouTuber",
    avatar: "P",
    rating: 5,
  },
  {
    quote:
      "Booked the music room for a weekend recording session. The acoustics are perfect and the staff is super helpful. Coming back for sure.",
    name: "Amit Sharma",
    role: "Musician",
    avatar: "A",
    rating: 5,
  },
];

export default function Testimonials() {
  return (
    <section className="bg-[#e8f5e9] section-padding">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-16"
        >
          <h2
            className="text-heading-lg text-[#111111]"
            style={{ fontFamily: "var(--font-primary)" }}
          >
            What Creators Say
          </h2>
        </motion.div>

        {/* Testimonial Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.6,
                delay: i * 0.15,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="bg-white rounded-lg p-8"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star
                    key={j}
                    className="w-4 h-4 text-[#f9a825] fill-[#f9a825]"
                  />
                ))}
              </div>

              {/* Quote */}
              <p
                className="text-[#111111] text-lg leading-relaxed mb-6 italic"
                style={{ fontFamily: "var(--font-primary)" }}
              >
                &ldquo;{t.quote}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#1a472a] flex items-center justify-center text-white text-sm font-medium">
                  {t.avatar}
                </div>
                <div>
                  <p className="text-sm font-medium text-[#111111]">{t.name}</p>
                  <p className="font-mono text-xs text-[#888888]">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
