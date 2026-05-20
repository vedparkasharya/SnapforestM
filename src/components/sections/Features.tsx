"use client";

import { motion } from "framer-motion";
import { Search, Calendar, CreditCard, Key, Clock, Shield } from "lucide-react";

const FEATURES = [
  {
    icon: Search,
    title: "Browse Studios",
    description: "Explore 8+ professional creator spaces with detailed photos, equipment lists, and real-time availability.",
  },
  {
    icon: Calendar,
    title: "Pick Your Time",
    description: "Choose your preferred date and time slot. Book by the hour or reserve the full day.",
  },
  {
    icon: CreditCard,
    title: "Instant Payment",
    description: "Secure checkout with Razorpay. Demo mode available for testing without real transactions.",
  },
  {
    icon: Key,
    title: "Get Access",
    description: "Receive instant booking confirmation. Walk in at your scheduled time and start creating.",
  },
  {
    icon: Clock,
    title: "Flexible Cancellation",
    description: "Cancel up to 30 minutes before your booking for a full refund. No questions asked.",
  },
  {
    icon: Shield,
    title: "Damage Protection",
    description: "Basic insurance included with every booking. Equipment covered against accidental damage.",
  },
];

export default function Features() {
  return (
    <section className="bg-[#111111] section-padding">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-16"
        >
          <p className="sf-label-forest mb-4">HOW IT WORKS</p>
          <h2
            className="text-heading-lg text-white"
            style={{ fontFamily: "var(--font-primary)" }}
          >
            Book in 3 Simple Steps
          </h2>
        </motion.div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{
                duration: 0.6,
                delay: i * 0.1,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="group p-8 rounded-lg bg-[#2a2a2a] hover:bg-[#333333] transition-all duration-300 hover:-translate-y-1"
            >
              <div className="w-12 h-12 rounded-lg bg-[#1a472a]/20 flex items-center justify-center mb-5 group-hover:bg-[#1a472a]/30 transition-colors">
                <feature.icon className="w-5 h-5 text-[#c8e6c9]" />
              </div>
              <h3
                className="text-xl text-white mb-2"
                style={{ fontFamily: "var(--font-primary)" }}
              >
                {feature.title}
              </h3>
              <p className="text-sm text-[#888888] leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
