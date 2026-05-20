"use client";

import { motion } from "framer-motion";
import { Mic, Camera, Music, Headphones, Video, Sparkles, Monitor, Wifi } from "lucide-react";

const PARTNERS = [
  { name: "PodcastHub", icon: Mic },
  { name: "CreatorLens", icon: Camera },
  { name: "BeatStudio", icon: Music },
  { name: "AudioPro", icon: Headphones },
  { name: "FrameWorks", icon: Video },
  { name: "SparkMedia", icon: Sparkles },
  { name: "StreamDeck", icon: Monitor },
  { name: "ConnectPatna", icon: Wifi },
];

export default function PartnersMarquee() {
  const doubled = [...PARTNERS, ...PARTNERS];

  return (
    <section className="bg-[#111111] py-12 border-y border-white/[0.08]">
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="sf-label text-center mb-8"
      >
        Trusted by creators in Patna
      </motion.p>

      <div className="relative overflow-hidden">
        <div className="marquee-track">
          {doubled.map((partner, i) => (
            <div
              key={i}
              className="flex items-center gap-3 px-8 opacity-40 hover:opacity-70 transition-opacity"
            >
              <partner.icon className="w-5 h-5 text-white" />
              <span className="text-sm font-medium text-white whitespace-nowrap">
                {partner.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
