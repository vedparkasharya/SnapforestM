"use client";

import { motion } from "framer-motion";
import { Search, Calendar, CreditCard, CheckCircle2, Clock, Headphones } from "lucide-react";

const FEATURES = [
  {
    icon: Search,
    title: "Find the right room",
    description: "Compare photos, equipment, capacity, location and live room details before you commit.",
  },
  {
    icon: Calendar,
    title: "Choose your slot",
    description: "Pick a date and available time that works for your shoot, podcast, recording or session.",
  },
  {
    icon: CreditCard,
    title: "Secure checkout",
    description: "Pay through Razorpay when online payments are configured, with the booking amount calculated server-side.",
  },
  {
    icon: CheckCircle2,
    title: "Clear confirmation",
    description: "See your booking status, room details and session information after successful payment.",
  },
  {
    icon: Clock,
    title: "Simple cancellation",
    description: "Eligible bookings can be cancelled before the stated cutoff. Paid refunds are processed separately.",
  },
  {
    icon: Headphones,
    title: "Creator-first support",
    description: "Keep the booking flow focused on what you actually need: a suitable room, a suitable time and clear details.",
  },
];

export default function Features() {
  return (
    <section className="bg-[#111111] section-padding">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mb-14 text-center"
        >
          <p className="sf-label-forest mb-4">HOW IT WORKS</p>
          <h2 className="text-heading-lg text-white" style={{ fontFamily: "var(--font-primary)" }}>
            Book without the back-and-forth.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-white/55">
            A straightforward flow from room discovery to confirmed booking.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, description }, i) => (
            <motion.article
              key={title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.07 }}
              className="group rounded-2xl border border-white/[0.08] bg-[#1b1b1b] p-7 transition-transform duration-300 hover:-translate-y-1 hover:border-white/[0.14] hover:bg-[#202020]"
            >
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-[#1a472a]/30 ring-1 ring-[#c8e6c9]/10">
                <Icon className="h-5 w-5 text-[#c8e6c9]" aria-hidden="true" />
              </div>
              <h3 className="mb-2 text-lg text-white" style={{ fontFamily: "var(--font-primary)" }}>
                {title}
              </h3>
              <p className="text-sm leading-6 text-white/55">{description}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
