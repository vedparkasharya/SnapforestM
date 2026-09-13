"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import Link from "next/link";

interface RoomRate { pricePerHour?: number; pricePerDay?: number; }

export default function PricingSection() {
  const [rates, setRates] = useState<{ hourly: number | null; daily: number | null }>({ hourly: null, daily: null });

  useEffect(() => {
    let cancelled = false;
    fetch("/api/rooms", { headers: { Accept: "application/json" } })
      .then((response) => response.json())
      .then((payload) => {
        if (cancelled || !payload?.success || !Array.isArray(payload.data)) return;
        const rooms = payload.data as RoomRate[];
        const hourly = rooms.map((room) => Number(room.pricePerHour)).filter(Number.isFinite).filter((price) => price > 0);
        const daily = rooms.map((room) => Number(room.pricePerDay)).filter(Number.isFinite).filter((price) => price > 0);
        setRates({ hourly: hourly.length ? Math.min(...hourly) : null, daily: daily.length ? Math.min(...daily) : null });
      })
      .catch(() => undefined);
    return () => { cancelled = true; };
  }, []);

  const plans = [
    {
      name: "Hourly",
      price: rates.hourly,
      period: "/hour",
      description: "For short recording, shooting or work sessions.",
      features: ["Choose a listed studio", "See equipment before booking", "Pay for the time you select"],
      featured: false,
    },
    {
      name: "Full day",
      price: rates.daily,
      period: "/day",
      description: "For longer sessions when a single slot is not enough.",
      features: ["Use the room's listed day rate", "Plan around your session", "One booking, one studio"],
      featured: true,
    },
    {
      name: "Compare rooms",
      price: null,
      period: "",
      description: "Rates and setups vary by studio.",
      features: ["Compare rooms and equipment", "Check capacity and location", "Choose the rate that fits"],
      featured: false,
    },
  ];

  return (
    <section className="bg-white section-padding">
      <div className="mx-auto max-w-6xl">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} className="mb-16 text-center">
          <h2 className="text-heading-lg text-[#111111]" style={{ fontFamily: "var(--font-primary)" }}>See live room rates.</h2>
          <p className="mt-4 text-[#888888]">There is no single platform-wide price. Each studio shows its current rate before you book.</p>
        </motion.div>

        <div className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-3">
          {plans.map((plan, i) => (
            <motion.div key={plan.name} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }} className={`relative flex flex-col rounded-2xl p-8 lg:p-10 ${plan.featured ? "bg-[#1a472a] text-white shadow-xl" : "bg-[#e8f5e9] text-[#111111]"}`}>
              {plan.featured && <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded bg-[#f9a825] px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-[#111111]">Full-day option</span>}
              <div className="mb-6">
                <h3 className="text-2xl" style={{ fontFamily: "var(--font-primary)" }}>{plan.name}</h3>
                <p className={`mt-1 text-sm ${plan.featured ? "text-white/70" : "text-[#666666]"}`}>{plan.description}</p>
              </div>

              <div className="mb-8 min-h-16">
                {plan.price !== null ? (
                  <><span className="text-4xl font-light lg:text-5xl">₹{plan.price.toLocaleString("en-IN")}</span><span className={`ml-1 font-mono text-sm ${plan.featured ? "text-white/70" : "text-[#888888]"}`}>{plan.period}</span></>
                ) : <span className="text-2xl font-medium">Live rates</span>}
              </div>

              <ul className="mb-8 flex-1 space-y-3">
                {plan.features.map((feature) => <li key={feature} className="flex items-start gap-3"><Check className={`mt-0.5 h-4 w-4 flex-shrink-0 ${plan.featured ? "text-[#f9a825]" : "text-[#1a472a]"}`} /><span className="text-sm">{feature}</span></li>)}
              </ul>

              <Link href="/rooms" className={`inline-flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-sm font-medium transition-colors ${plan.featured ? "bg-[#f9a825] text-[#111111] hover:bg-[#ffd166]" : "bg-[#1a472a] text-white hover:bg-[#236b3a]"}`}>
                Browse studios <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
