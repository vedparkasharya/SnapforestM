"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, Sparkles } from "lucide-react";
import Link from "next/link";

export default function CTABanner() {
  return (
    <section className="relative overflow-hidden bg-[#d9f7e2] px-4 py-20 text-[#0f1a13] sm:px-6 lg:px-8 lg:py-28">
      <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-white/60 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 left-[-8rem] h-80 w-80 rounded-full bg-[#8ecaa0]/25 blur-3xl" />
      <motion.div initial={{ opacity: 0, y: 25 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.65 }} className="relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] border border-black/[0.08] bg-[#edf9f0]/70 p-7 shadow-[0_28px_80px_rgba(22,54,31,0.10)] backdrop-blur-xl sm:p-10 lg:p-14">
        <div className="flex flex-col justify-between gap-10 lg:flex-row lg:items-end">
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-black/[0.08] bg-white/55 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-black/50"><Sparkles className="h-3.5 w-3.5 text-[#39724a]" /> Your next session</div>
            <h2 className="text-balance text-5xl leading-[0.92] tracking-[-0.05em] sm:text-6xl lg:text-7xl" style={{ fontFamily: "var(--font-primary)" }}>Stop searching.<br />Start creating.</h2>
            <p className="mt-5 max-w-xl text-sm leading-6 text-black/50 sm:text-base">Find a studio that fits the idea, the team and the time. Then get back to the work.</p>
          </div>
          <div className="flex shrink-0 flex-col gap-3 sm:flex-row lg:flex-col">
            <Link href="/rooms" className="group inline-flex items-center justify-center gap-2 rounded-full bg-[#101411] px-6 py-3.5 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5">Explore studios <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" /></Link>
            <Link href="/rooms" className="inline-flex items-center justify-center rounded-full border border-black/10 px-6 py-3.5 text-sm font-medium text-black/60 transition-colors hover:bg-white/50 hover:text-black">View all spaces</Link>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
