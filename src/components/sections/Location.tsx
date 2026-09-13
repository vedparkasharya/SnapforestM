"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const PILLS = ["Patna, Bihar", "Creator-focused spaces", "Hourly booking", "Live room details"];

export default function LocationShowcase() {
  return (
    <section className="bg-[#111311] px-4 py-20 text-white sm:px-6 lg:px-8 lg:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="grid items-center gap-10 lg:grid-cols-[1.18fr_0.82fr] lg:gap-16">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.65 }} className="group relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.03] p-2 shadow-2xl">
            <div className="relative aspect-[16/10] overflow-hidden rounded-[1.6rem]">
              <Image src="/rooms/exterior-main.jpg" alt="Snapforest studio exterior" fill sizes="(max-width: 1024px) 100vw, 65vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.025]" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/5 to-transparent" />
              <div className="absolute left-5 right-5 top-5 flex items-center justify-between">
                <span className="rounded-full border border-white/15 bg-black/25 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-white/75 backdrop-blur-xl">Current city</span>
                <span className="grid h-10 w-10 place-items-center rounded-full border border-white/15 bg-black/25 text-white backdrop-blur-xl"><MapPin className="h-4 w-4" /></span>
              </div>
              <div className="absolute inset-x-5 bottom-5">
                <p className="text-xs uppercase tracking-[0.14em] text-white/45">Snapforest · Patna</p>
                <p className="mt-1 text-3xl text-white" style={{ fontFamily: "var(--font-primary)" }}>A home for the next session.</p>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 25 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.65, delay: 0.08 }}>
            <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9eeeb5]">Find your space</p>
            <h2 className="text-balance text-5xl leading-[0.92] tracking-[-0.05em] sm:text-6xl" style={{ fontFamily: "var(--font-primary)" }}>Start where the work happens.</h2>
            <p className="mt-6 max-w-xl text-sm leading-7 text-white/45 sm:text-base">Browse studios currently listed in Patna, compare what each space offers and choose the setup that fits your session.</p>
            <div className="mt-7 flex flex-wrap gap-2">{PILLS.map((pill) => <span key={pill} className="rounded-full border border-white/[0.09] bg-white/[0.035] px-3 py-1.5 text-xs text-white/55">{pill}</span>)}</div>
            <Link href="/rooms" className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#d9f7e2] px-5 py-3.5 text-sm font-semibold text-[#102017] transition-transform hover:-translate-y-0.5">Explore Patna studios <ArrowUpRight className="h-4 w-4" /></Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
