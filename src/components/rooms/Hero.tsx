"use client";

import { motion } from "framer-motion";
import { ArrowRight, ArrowUpRight, Play, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const USE_CASES = ["Podcasts", "Video", "Photography", "Music", "Streaming"];

export default function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-[#0b0d0c] px-4 pb-16 pt-28 sm:px-6 sm:pb-20 sm:pt-32 lg:px-8 lg:pb-24 lg:pt-36">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-[-12rem] h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-[#7ee7a5]/[0.08] blur-[120px]" />
        <div className="absolute right-[-8rem] top-[12rem] h-[28rem] w-[28rem] rounded-full bg-[#d7b56d]/[0.06] blur-[120px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_10%,rgba(255,255,255,0.08),transparent_35%)]" />
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#0f0f0f] to-transparent" />
      </div>

      <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.02fr_0.98fr] lg:gap-16">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-3xl"
        >
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-2 text-[11px] uppercase tracking-[0.16em] text-white/60 backdrop-blur-xl">
            <Sparkles className="h-3.5 w-3.5 text-[#b9f5ca]" aria-hidden="true" />
            Creator spaces · Patna
          </div>

          <h1 className="max-w-4xl text-balance text-[3.7rem] leading-[0.88] tracking-[-0.055em] text-white sm:text-7xl lg:text-[6.7rem]" style={{ fontFamily: "var(--font-primary)" }}>
            Make something
            <span className="block text-[#b9f5ca]">worth sharing.</span>
          </h1>

          <p className="mt-7 max-w-2xl text-base leading-7 text-white/55 sm:text-lg sm:leading-8">
            Discover creator-ready studios, compare the setup and book a time that fits your shoot, recording or live session.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link href="/rooms" className="group inline-flex items-center justify-center gap-2 rounded-full bg-[#d9f7e2] px-6 py-3.5 text-sm font-semibold text-[#0c2213] shadow-[0_12px_40px_rgba(0,0,0,0.22)] transition-transform duration-300 hover:-translate-y-0.5 hover:bg-white">
              Explore studios
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden="true" />
            </Link>
            <Link href="#how-it-works" className="inline-flex items-center justify-center gap-2 rounded-full border border-white/12 bg-white/[0.03] px-6 py-3.5 text-sm font-medium text-white/80 backdrop-blur-xl transition-colors hover:bg-white/[0.07] hover:text-white">
              <Play className="h-4 w-4" aria-hidden="true" />
              See how it works
            </Link>
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-x-5 gap-y-3 border-t border-white/[0.08] pt-5">
            {USE_CASES.map((item, index) => (
              <div key={item} className="flex items-center gap-3 text-sm text-white/42">
                {index > 0 && <span className="h-1 w-1 rounded-full bg-white/15" aria-hidden="true" />}
                <span>{item}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
          className="relative mx-auto w-full max-w-xl lg:max-w-none"
        >
          <div className="absolute -inset-8 rounded-[2.5rem] bg-[#7ee7a5]/[0.08] blur-3xl" />
          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] p-2 shadow-2xl backdrop-blur-xl">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[1.55rem] bg-[#171a18]">
              <Image
                src="/rooms/photo-studio.jpg"
                alt="Creator studio space"
                fill
                priority
                sizes="(max-width: 1024px) 90vw, 46vw"
                className="object-cover transition-transform duration-700 hover:scale-[1.025]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/5 to-transparent" />

              <div className="absolute left-4 right-4 top-4 flex items-center justify-between">
                <span className="rounded-full border border-white/15 bg-black/30 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.14em] text-white/75 backdrop-blur-xl">Featured space</span>
                <Link href="/rooms" aria-label="Explore studios" className="grid h-10 w-10 place-items-center rounded-full border border-white/15 bg-black/30 text-white backdrop-blur-xl transition-transform hover:scale-105">
                  <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>

              <div className="absolute inset-x-4 bottom-4">
                <div className="rounded-2xl border border-white/10 bg-black/40 p-4 backdrop-blur-xl sm:p-5">
                  <p className="text-xs uppercase tracking-[0.15em] text-white/45">Built for the session</p>
                  <div className="mt-2 flex items-end justify-between gap-4">
                    <div>
                      <h2 className="text-2xl text-white" style={{ fontFamily: "var(--font-primary)" }}>Your next set starts here.</h2>
                      <p className="mt-1 text-sm text-white/55">Browse real rooms. Pick a real slot.</p>
                    </div>
                    <div className="hidden shrink-0 sm:block">
                      <span className="rounded-full bg-[#d9f7e2] px-3 py-1.5 text-xs font-semibold text-[#0c2213]">Book now</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
