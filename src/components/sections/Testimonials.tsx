"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, Camera, Check, Clock3, CreditCard } from "lucide-react";
import Link from "next/link";

const POINTS = [
  { icon: Camera, tag: "DISCOVER", title: "Know the space before you book", description: "See photos, capacity, equipment and location details up front." },
  { icon: Clock3, tag: "CHOOSE", title: "Book only the time you need", description: "Pick an available slot that works for your shoot or recording." },
  { icon: CreditCard, tag: "CHECKOUT", title: "Keep the booking simple", description: "Review the details, complete payment and keep everything together." },
];

export default function Testimonials() {
  return (
    <section className="bg-[#edf6ef] px-4 py-20 text-[#101411] sm:px-6 lg:px-8 lg:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="grid items-end gap-8 border-b border-black/10 pb-10 lg:grid-cols-[1fr_auto]">
          <div className="max-w-3xl">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#477453]">Why Snapforest</p>
            <h2 className="text-balance text-5xl leading-[0.92] tracking-[-0.05em] sm:text-6xl" style={{ fontFamily: "var(--font-primary)" }}>The details matter when you're making something.</h2>
          </div>
          <Link href="/rooms" className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/55 px-4 py-2.5 text-xs font-semibold text-black/65 transition-colors hover:bg-white hover:text-black">Browse spaces <ArrowUpRight className="h-3.5 w-3.5" /></Link>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {POINTS.map(({ icon: Icon, tag, title, description }, i) => (
            <motion.article key={title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.08 }} className="relative overflow-hidden rounded-[1.5rem] border border-black/[0.08] bg-white/75 p-6 shadow-[0_15px_45px_rgba(30,60,37,0.05)] backdrop-blur-xl sm:p-7">
              <div className="flex items-center justify-between"><span className="text-[10px] font-semibold tracking-[0.16em] text-black/30">{tag}</span><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#e2f1e5] text-[#315c3b]"><Icon className="h-4.5 w-4.5" /></span></div>
              <h3 className="mt-12 max-w-sm text-3xl leading-[0.98] tracking-[-0.03em]" style={{ fontFamily: "var(--font-primary)" }}>{title}</h3>
              <p className="mt-3 max-w-sm text-sm leading-6 text-black/50">{description}</p>
              <div className="mt-7 flex items-center gap-1.5 text-xs text-black/45"><Check className="h-3.5 w-3.5 text-[#4b7b58]" /> Clear, focused booking flow</div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
