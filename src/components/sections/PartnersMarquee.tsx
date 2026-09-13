"use client";

import { motion } from "framer-motion";
import { ArrowRight, Camera, Mic, Music, Sparkles, Video } from "lucide-react";
import Link from "next/link";

const CATEGORIES = [
  { name: "Podcast", slug: "podcast", icon: Mic },
  { name: "YouTube", slug: "youtube", icon: Video },
  { name: "Photography", slug: "photography", icon: Camera },
  { name: "Music", slug: "music", icon: Music },
  { name: "Live streaming", slug: "streaming", icon: Sparkles },
];

export default function PartnersMarquee() {
  const doubled = [...CATEGORIES, ...CATEGORIES];

  return (
    <section className="border-y border-white/[0.08] bg-[#111111] py-5 sm:py-6" aria-label="Studio categories">
      <div className="mx-auto flex max-w-7xl items-center gap-5 px-4 sm:px-6 lg:px-8">
        <span className="hidden shrink-0 font-mono text-[10px] uppercase tracking-[0.18em] text-white/40 sm:block">Create in your format</span>
        <div className="min-w-0 flex-1 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
          <div className="marquee-track hover:[animation-play-state:paused]">
            {doubled.map(({ name, slug, icon: Icon }, i) => (
              <Link
                key={`${name}-${i}`}
                href={`/rooms?category=${slug}`}
                className="group flex items-center gap-2 px-4 text-sm text-white/55 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c8e6c9] focus-visible:ring-offset-2 focus-visible:ring-offset-[#111111]"
                aria-hidden={i >= CATEGORIES.length ? true : undefined}
                tabIndex={i >= CATEGORIES.length ? -1 : undefined}
              >
                <Icon className="h-4 w-4 text-white/35 transition-colors group-hover:text-[#c8e6c9]" aria-hidden="true" />
                <span className="whitespace-nowrap">{name}</span>
                <span className="mx-2 text-white/20" aria-hidden="true">•</span>
              </Link>
            ))}
          </div>
        </div>
        <motion.div whileHover={{ x: 2 }} className="hidden shrink-0 lg:block">
          <Link href="/rooms" className="inline-flex min-h-0 items-center gap-1.5 text-xs font-medium text-[#c8e6c9] transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c8e6c9]">
            Browse all <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
