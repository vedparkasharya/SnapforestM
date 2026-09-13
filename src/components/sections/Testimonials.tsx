"use client";

import { motion } from "framer-motion";
import { Camera, CheckCircle2, Clock3, CreditCard } from "lucide-react";

const POINTS = [
  {
    icon: Camera,
    title: "Choose a space that fits",
    description: "Compare photos, equipment, capacity and location before you book.",
  },
  {
    icon: Clock3,
    title: "Book only the time you need",
    description: "Pick an available slot instead of committing to a long-term studio plan.",
  },
  {
    icon: CreditCard,
    title: "Pay securely",
    description: "Complete checkout through the payment flow and keep your booking details in one place.",
  },
  {
    icon: CheckCircle2,
    title: "Get clear confirmation",
    description: "Your booking status and studio details are shown together after checkout.",
  },
];

export default function Testimonials() {
  return (
    <section className="bg-[#e8f5e9] section-padding">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto mb-12 max-w-2xl text-center"
        >
          <p className="sf-label mb-4">A simpler way to create</p>
          <h2
            className="text-heading-lg text-[#111111]"
            style={{ fontFamily: "var(--font-primary)" }}
          >
            Everything important, without the studio-hunting headache.
          </h2>
          <p className="mt-4 text-base leading-7 text-[#4c5a4f]">
            Snapforest is designed around the moments that matter: finding the right room, choosing a time, paying securely and knowing what you booked.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {POINTS.map(({ icon: Icon, title, description }, i) => (
            <motion.article
              key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="rounded-2xl border border-[#cfe3d1] bg-white p-6 shadow-[0_12px_30px_rgba(26,71,42,0.06)]"
            >
              <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl bg-[#e8f5e9]">
                <Icon className="h-5 w-5 text-[#1a472a]" aria-hidden="true" />
              </div>
              <h3 className="mb-2 text-lg font-medium text-[#111111]">{title}</h3>
              <p className="text-sm leading-6 text-[#5f6d62]">{description}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
