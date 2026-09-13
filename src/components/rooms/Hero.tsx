"use client";

import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative flex min-h-[78vh] flex-col items-center justify-center overflow-hidden bg-[#111111] px-4 py-24 text-center sm:min-h-[82vh]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(26,71,42,0.18),transparent_45%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#111111] to-transparent" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 max-w-4xl"
      >
        <p className="sf-label-forest mb-5">PATNA • CREATOR SPACES</p>
        <h1 className="text-balance text-5xl leading-[0.95] tracking-[-0.04em] text-white sm:text-6xl lg:text-8xl" style={{ fontFamily: "var(--font-primary)" }}>
          A better place to make.
        </h1>
        <p className="mx-auto mt-7 max-w-2xl text-base leading-7 text-white/55 sm:text-lg">
          Find a studio that fits your session, see what is actually included and book the time you need.
        </p>

        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/rooms" className="btn-primary inline-flex items-center">
            Explore studios
            <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
          </Link>
          <Link href="/#how-it-works" className="btn-secondary inline-flex items-center">
            <Play className="mr-2 h-4 w-4" aria-hidden="true" />
            How it works
          </Link>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.25 }} className="relative z-10 mt-12 flex flex-wrap justify-center gap-2 text-xs text-white/45">
        {["Podcasts", "Video", "Photography", "Music", "Streaming"].map((item) => (
          <span key={item} className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5">{item}</span>
        ))}
      </motion.div>
    </section>
  );
}
