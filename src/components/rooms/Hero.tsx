"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import Link from "next/link";

const WORDS = ["CREATE", "STUDIO"];
const SUBWORDS = ["SPACE", "RENT"];
const CYCLE_DURATION = 5000;
const CHAR_STAGGER = 80;

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const line1Ref = useRef<HTMLDivElement>(null);
  const line2Ref = useRef<HTMLDivElement>(null);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const animateWord = (word: string, subWord: string) => {
      if (!line1Ref.current || !line2Ref.current) return;

      line1Ref.current.innerHTML = "";
      line2Ref.current.innerHTML = "";

      const chars = word.split("");
      const midPoint = Math.ceil(chars.length / 2);
      const upperChars = chars.slice(0, midPoint);
      const lowerChars = chars.slice(midPoint);

      renderLine(line1Ref.current, upperChars, 70, CHAR_STAGGER);
      renderLine(line2Ref.current, lowerChars, 40, CHAR_STAGGER + 40);

      // Also render the subtitle word
      setTimeout(() => {
        if (!line2Ref.current) return;
        const subChars = subWord.split("");
        renderLine(line2Ref.current, subChars, 30, CHAR_STAGGER * 2, true);
      }, midPoint * CHAR_STAGGER + 400);
    };

    const startCycle = () => {
      const word = WORDS[currentWordIndex];
      const subWord = SUBWORDS[currentWordIndex];
      animateWord(word, subWord);

      intervalRef.current = setTimeout(() => {
        setCurrentWordIndex((prev) => (prev + 1) % WORDS.length);
      }, CYCLE_DURATION);
    };

    startCycle();

    return () => {
      if (intervalRef.current) clearTimeout(intervalRef.current);
    };
  }, [currentWordIndex]);

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-[#111111]">
      {/* Background grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.03) 1px, transparent 0), url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h80v80H0z' fill='none' stroke='rgba(255,255,255,0.02)' stroke-width='1'/%3E%3C/svg%3E")`,
          backgroundSize: "40px 40px, 80px 80px",
        }}
      />

      {/* Floating accent shapes */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#1a472a]/8 rounded-full blur-[120px] animate-pulse" />
      <div
        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#1a472a]/5 rounded-full blur-[120px] animate-pulse"
        style={{ animationDelay: "1s" }}
      />

      {/* Voxel Text Container */}
      <div
        ref={containerRef}
        className="relative z-10 flex flex-col items-center justify-center"
        style={{ perspective: "800px" }}
      >
        <div
          ref={line1Ref}
          className="voxel-line"
          style={{ fontFamily: "var(--font-primary)", fontSize: 70 }}
        />
        <div
          ref={line2Ref}
          className="voxel-line voxel-line--subtitle"
          style={{ fontFamily: "var(--font-mono)", fontSize: 40 }}
        />
      </div>

      {/* Tagline */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 mt-12 text-center text-lg sm:text-xl md:text-2xl text-white/80 max-w-xl px-4"
        style={{ fontFamily: "var(--font-primary)" }}
      >
        Book professional creator studios in Patna — by the hour
      </motion.p>

      {/* CTA Row */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
      >
        <Link href="/rooms">
          <motion.span
            className="btn-primary cursor-pointer"
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.98 }}
          >
            Explore Studios
            <ArrowRight className="w-4 h-4 ml-2" />
          </motion.span>
        </Link>
        <Link href="/rooms">
          <motion.span
            className="btn-secondary cursor-pointer"
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.98 }}
          >
            <Play className="w-4 h-4 mr-2" />
            How It Works
          </motion.span>
        </Link>
      </motion.div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#111111] to-transparent pointer-events-none" />
    </section>
  );
}

function renderLine(
  lineElement: HTMLDivElement,
  chars: string[],
  fontSize: number,
  baseDelay: number,
  append = false
) {
  if (!append) lineElement.innerHTML = "";
  lineElement.style.fontSize = `${fontSize}px`;
  lineElement.style.perspective = "800px";

  chars.forEach((char, i) => {
    const span = document.createElement("span");
    span.className = "voxel-char";
    span.textContent = char === " " ? "\u00A0" : char;
    span.dataset.char = char === " " ? "\u00A0" : char;

    const delay = i * CHAR_STAGGER + baseDelay;
    span.style.animation = `voxelFall 0.8s ${delay}ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards, voxelSettle 2s ${delay + 800}ms ease-in-out forwards`;

    lineElement.appendChild(span);
  });
}
