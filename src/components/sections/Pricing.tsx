"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import Link from "next/link";

const PLANS = [
  {
    name: "Hourly",
    price: "299",
    period: "/hour",
    description: "Perfect for quick sessions",
    features: [
      "Up to 4 hours per booking",
      "Basic equipment included",
      "WiFi access",
      "Community support",
    ],
    featured: false,
  },
  {
    name: "Half Day",
    price: "999",
    period: "/5 hours",
    description: "Most popular choice",
    features: [
      "5-hour session block",
      "Full equipment access",
      "Priority scheduling",
      "Insurance included",
      "Free cancellation",
    ],
    featured: true,
  },
  {
    name: "Full Day",
    price: "1,999",
    period: "/day",
    description: "For serious creators",
    features: [
      "Up to 10 hours",
      "All premium equipment",
      "Dedicated studio manager",
      "Full insurance coverage",
      "Flexible rescheduling",
    ],
    featured: false,
  },
];

export default function PricingSection() {
  return (
    <section className="bg-white section-padding">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-16"
        >
          <h2
            className="text-heading-lg text-[#111111]"
            style={{ fontFamily: "var(--font-primary)" }}
          >
            Simple, Transparent Pricing
          </h2>
          <p className="mt-4 text-[#888888]">
            No hidden fees. Pay only for what you use.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {PLANS.map((plan, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.6,
                delay: i * 0.1,
                ease: [0.16, 1, 0.3, 1],
              }}
              className={`relative rounded-lg p-8 lg:p-12 flex flex-col ${
                plan.featured
                  ? "bg-[#1a472a] text-white scale-[1.02] shadow-xl"
                  : "bg-[#e8f5e9] text-[#111111]"
              }`}
            >
              {plan.featured && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 font-mono text-[11px] uppercase tracking-wider bg-[#f9a825] text-[#111111] px-3 py-1 rounded">
                  Most Popular
                </span>
              )}

              <div className="mb-6">
                <h3
                  className="text-2xl"
                  style={{ fontFamily: "var(--font-primary)" }}
                >
                  {plan.name}
                </h3>
                <p
                  className={`text-sm mt-1 ${
                    plan.featured ? "text-white/70" : "text-[#888888]"
                  }`}
                >
                  {plan.description}
                </p>
              </div>

              <div className="mb-8">
                <span
                  className="text-4xl lg:text-5xl font-light"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Rs.{plan.price}
                </span>
                <span
                  className={`font-mono text-sm ml-1 ${
                    plan.featured ? "text-white/70" : "text-[#888888]"
                  }`}
                >
                  {plan.period}
                </span>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature, j) => (
                  <li key={j} className="flex items-center gap-3">
                    <Check
                      className={`w-4 h-4 flex-shrink-0 ${
                        plan.featured ? "text-[#f9a825]" : "text-[#1a472a]"
                      }`}
                    />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link href="/rooms" className="w-full">
                <motion.span
                  className={`w-full block text-center py-3.5 rounded-pill text-sm font-medium transition-all cursor-pointer ${
                    plan.featured
                      ? "bg-[#f9a825] text-[#111111] hover:bg-[#f9a825]/90"
                      : "bg-[#1a472a] text-white hover:bg-[#236b3a]"
                  }`}
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Get Started
                </motion.span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
