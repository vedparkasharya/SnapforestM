"use client";

import { motion } from "framer-motion";
import { ArrowRight, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const PILLS = ["Patna, Bihar", "Creator-focused spaces", "Hourly booking", "Live room details"];

export default function LocationShowcase() {
  return (
    <section className="bg-[#111111] section-padding">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-5 lg:gap-16">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} className="relative aspect-[4/3] overflow-hidden rounded-xl lg:col-span-3">
            <Image src="/rooms/exterior-main.jpg" alt="Snapforest studio exterior" fill sizes="(max-width: 1024px) 100vw, 60vw" className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#111111]/40 to-transparent" />
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }} className="lg:col-span-2">
            <p className="sf-label-forest mb-4">FIND YOUR SPACE</p>
            <h2 className="text-heading-md mb-4 text-white" style={{ fontFamily: "var(--font-primary)" }}>Start in Patna.</h2>
            <p className="mb-6 leading-relaxed text-[#888888]">Browse the studios currently listed on Snapforest, compare their details and choose the space that fits your session.</p>
            <div className="mb-8 flex flex-wrap gap-2">{PILLS.map((pill) => <span key={pill} className="rounded-pill bg-[#2a2a2a] px-4 py-1.5 font-mono text-xs text-white">{pill}</span>)}</div>
            <Link href="/rooms" className="btn-primary inline-flex items-center"><MapPin className="mr-2 h-4 w-4" aria-hidden="true" />Explore studios<ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" /></Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
