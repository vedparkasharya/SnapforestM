"use client";

import { motion } from "framer-motion";
import { ArrowRight, CalendarDays, Check, CreditCard, Search } from "lucide-react";
import Link from "next/link";

const STEPS = [
  { number: "01", icon: Search, title: "Find your space", description: "Browse real studios with photos, capacity, equipment and location details." },
  { number: "02", icon: CalendarDays, title: "Pick a live slot", description: "Choose the date and time that fits your shoot, recording or session." },
  { number: "03", icon: CreditCard, title: "Book with confidence", description: "Review your booking, pay securely and get a clear confirmation." },
];

export default function Features() {
  return (
    <section id="how-it-works" className="relative overflow-hidden bg-[#f3f7f3] px-4 py-20 text-[#101411] sm:px-6 lg:px-8 lg:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="lg:sticky lg:top-28 lg:self-start">
            <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#42654d]">How it works</p>
            <h2 className="max-w-xl text-balance text-5xl leading-[0.92] tracking-[-0.045em] sm:text-6xl" style={{ fontFamily: "var(--font-primary)" }}>
              Less planning.
              <span className="block text-[#557a60]">More making.</span>
            </h2>
            <p className="mt-6 max-w-md text-sm leading-6 text-black/55 sm:text-base">
              Snapforest keeps the search simple: discover the right space, choose the right time and get on with your session.
            </p>
            <Link href="/rooms" className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#101411] px-5 py-3 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5">
              Explore studios <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>

          <div className="space-y-3">
            {STEPS.map(({ number, icon: Icon, title, description }, index) => (
              <motion.article key={number} initial={{ opacity: 0, x: 24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.55, delay: index * 0.08 }} className="group rounded-[1.5rem] border border-black/[0.08] bg-white/75 p-5 shadow-[0_10px_35px_rgba(16,20,17,0.05)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:bg-white sm:p-7">
                <div className="flex gap-5 sm:gap-7">
                  <div className="flex shrink-0 flex-col items-center gap-3">
                    <span className="text-[11px] font-mono font-medium tracking-[0.14em] text-black/30">{number}</span>
                    <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#e3f1e6] text-[#17351f]"><Icon className="h-5 w-5" /></span>
                  </div>
                  <div className="flex-1 pt-1">
                    <h3 className="text-2xl tracking-[-0.025em]" style={{ fontFamily: "var(--font-primary)" }}>{title}</h3>
                    <p className="mt-2 max-w-xl text-sm leading-6 text-black/50">{description}</p>
                    <div className="mt-5 flex flex-wrap gap-2 text-[11px] text-black/40">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-black/[0.07] bg-black/[0.025] px-3 py-1.5"><Check className="h-3 w-3 text-[#477453]" /> Clear details</span>
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-black/[0.07] bg-black/[0.025] px-3 py-1.5"><Check className="h-3 w-3 text-[#477453]" /> Simple flow</span>
                    </div>
                  </div>
                  <ArrowRight className="mt-2 hidden h-5 w-5 text-black/20 transition-transform group-hover:translate-x-1 sm:block" />
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
