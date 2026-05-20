"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function CTABanner() {
  return (
    <section className="bg-[#1a472a] py-24 lg:py-[120px] px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-2xl mx-auto text-center"
      >
        <h2
          className="text-heading-lg text-white mb-4"
          style={{ fontFamily: "var(--font-primary)" }}
        >
          Ready to Create?
        </h2>
        <p className="text-white/70 mb-10">
          Book your studio today and start creating
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/rooms">
            <motion.span
              className="inline-flex items-center px-12 py-4 rounded-pill bg-white text-[#1a472a] font-medium cursor-pointer hover:bg-white/90 transition-colors"
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
            >
              Book a Studio
              <ArrowRight className="w-4 h-4 ml-2" />
            </motion.span>
          </Link>
          <Link
            href="/rooms"
            className="text-white hover:underline underline-offset-4 text-sm transition-all"
          >
            View All Studios
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
