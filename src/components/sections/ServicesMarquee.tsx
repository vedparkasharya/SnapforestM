"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

const SERVICES = [
  ["Podcast", "For conversations that sound good."],
  ["Video", "For shoots with a proper setup."],
  ["Photography", "For portraits, products and campaigns."],
  ["Music", "For recording, rehearsing and creating."],
  ["Streaming", "For going live without the scramble."],
];

export default function ServicesMarquee() {
  return (
    <section className="overflow-hidden bg-[#111311] px-4 py-20 text-white sm:px-6 lg:px-8 lg:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-5 border-b border-white/[0.08] pb-8 sm:flex-row sm:items-end">
          <div>
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9eeeb5]">Made for the work</p>
            <h2 className="text-4xl tracking-[-0.04em] sm:text-5xl" style={{ fontFamily: "var(--font-primary)" }}>One place. Different ways to create.</h2>
          </div>
          <p className="max-w-sm text-sm leading-6 text-white/40">Find a room around the kind of session you're building. Every listing can be checked before you book.</p>
        </div>

        <div className="mt-8 grid gap-px overflow-hidden rounded-[1.5rem] border border-white/[0.08] bg-white/[0.08] md:grid-cols-5">
          {SERVICES.map(([title, description], index) => (
            <Link key={title} href={`/rooms?category=${encodeURIComponent(title === "Video" ? "youtube" : title.toLowerCase())}`} className="group relative min-h-[210px] bg-[#171a18] p-5 transition-colors duration-300 hover:bg-[#1d211f] sm:p-6">
              <span className="text-[10px] font-mono tracking-[0.16em] text-white/25">0{index + 1}</span>
              <div className="absolute inset-x-5 bottom-5 sm:inset-x-6 sm:bottom-6">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <h3 className="text-2xl tracking-[-0.025em]" style={{ fontFamily: "var(--font-primary)" }}>{title}</h3>
                    <p className="mt-2 text-xs leading-5 text-white/40">{description}</p>
                  </div>
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-white/50 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-white"><ArrowUpRight className="h-4 w-4" /></span>
                </div>
              </div>
              <span className="absolute right-0 top-0 h-px w-0 bg-[#9eeeb5] transition-all duration-500 group-hover:w-full" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
