"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Calendar, MapPin, ChevronDown } from "lucide-react";
import FloatingParticles from "@/components/ui/FloatingParticles";
import GoldenBadge from "@/components/ui/GoldenBadge";
import PulseButton from "@/components/ui/PulseButton";
import CountdownTimer from "./CountdownTimer";
import HeroConceptStrip from "./HeroConceptStrip";
import HeroBackgroundSlider from "./HeroBackgroundSlider";
import { fadeUp, scaleIn } from "@/lib/animations";
import { EVENT, RAIPUR_PLACES } from "@/lib/constants";

const SLIDE_INTERVAL_MS = 5000;

export default function HeroSection() {
  const [slideIndex, setSlideIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(
      () => setSlideIndex((i) => (i + 1) % RAIPUR_PLACES.length),
      SLIDE_INTERVAL_MS
    );
    return () => clearInterval(id);
  }, []);

  return (
    <section className="relative min-h-[100svh] flex flex-col overflow-hidden pt-4 md:pt-6">

      {/* ── Background layers ─────────────────────────────── */}
      {/* Rotating photo background */}
      <HeroBackgroundSlider places={RAIPUR_PLACES} index={slideIndex} />

      {/* Gondi sun watermark */}
      <div
        aria-hidden
        className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none"
      >
        <img
          src="/cultural/gondi-sun.svg"
          alt=""
          className="w-[600px] md:w-[900px] max-w-none opacity-100"
        />
      </div>

      {/* Tribal tile pattern */}
      <div
        aria-hidden
        className="absolute inset-0 z-0 tribal-pattern-bg opacity-40 pointer-events-none"
      />

      {/* Lotus floating particles */}
      <FloatingParticles count={10} />

      {/* ── Main content ──────────────────────────────────── */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 pt-2 pb-6 md:pb-8">

        {/* Logos row */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex items-center justify-center gap-6 mb-4 md:mb-5"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-[var(--primary-800)]/20 bg-white/90 p-1.5 shadow-sm md:h-20 md:w-20">
            <Image
              src="/logo/APTI.png"
              alt="Association of Pharmaceutical Teachers of India"
              width={350}
              height={437}
              priority
              className="h-full w-full object-contain"
            />
          </div>
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-[var(--accent-500)]/20 border border-[var(--accent-500)]/40 flex items-center justify-center">
            <img src="/cultural/lotus.svg" alt="" className="w-6 h-6" />
          </div>
          <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-[var(--secondary-800)]/20 bg-white/90 p-1.5 shadow-sm md:h-20 md:w-20">
            <Image
              src="/logo/Ravishankar_Shukla_University.png"
              alt="Pt. Ravishankar Shukla University, Raipur"
              width={217}
              height={232}
              priority
              className="h-full w-full object-contain"
            />
          </div>
        </motion.div>

        {/* Badge */}
        <GoldenBadge>{EVENT.edition}</GoldenBadge>

        {/* APTICON logo */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="mt-3 mb-3 w-full max-w-sm sm:max-w-lg md:max-w-xl px-4"
        >
          <Image
            src="/logo/APTICON_LOGO.png"
            alt="APTICON 2026 — Annual National Convention"
            width={1536}
            height={1024}
            priority
            className="w-full h-auto"
          />
        </motion.div>

        {/* Theme — typewriter effect via Framer */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.85 }}
          className="max-w-2xl mx-auto text-sm sm:text-base md:text-lg font-semibold text-white/90 leading-relaxed mb-2 px-2"
        >
          {EVENT.theme}
        </motion.p>

        {/* Hindi tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.1 }}
          className="font-devanagari text-sm md:text-base text-[var(--accent-400)]/90 mb-4"
        >
          {EVENT.themeHindi}
        </motion.p>

        {/* Date + Venue pills */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.2 }}
          className="flex flex-col sm:flex-row items-center gap-3 mb-5"
        >
          <span className="flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--primary-800)] text-white text-xs sm:text-sm font-medium shadow-md shadow-[var(--primary-800)]/25">
            <Calendar size={14} />
            {EVENT.dateDisplay}
          </span>
          <span className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 border border-[var(--accent-500)]/30 text-[var(--dark-text)] text-xs sm:text-sm font-medium shadow-sm">
            <MapPin size={14} className="text-[var(--primary-800)] flex-shrink-0" />
            <span className="truncate max-w-[220px] sm:max-w-none">Raipur, Chhattisgarh</span>
          </span>
        </motion.div>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.35 }}
          className="flex flex-col sm:flex-row items-center gap-4"
        >
          <PulseButton href="/registration" variant="accent" pulse className="min-w-[160px]">
            Register Now
          </PulseButton>
          <PulseButton href="/schedule" variant="outline-light" className="min-w-[160px]">
            View Program
          </PulseButton>
        </motion.div>

        {/* Countdown */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.55 }}
          className="mt-6 md:mt-8"
        >
          <CountdownTimer />
        </motion.div>
      </div>

      {/* Scroll cue — overlaid, doesn't add to hero height */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.2 }}
        className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10 hidden md:block"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
          className="flex flex-col items-center gap-1 text-white/70"
        >
          <span className="text-[10px] tracking-widest uppercase font-medium">Scroll</span>
          <ChevronDown size={18} />
        </motion.div>
      </motion.div>

      {/* ── Concept strip from flyer ── */}
      <div className="relative z-10 mt-auto w-full pb-4 md:pb-6 flex flex-col items-center gap-2">
        {/* Background photo slide indicators */}
        <div className="flex justify-center gap-2">
          {RAIPUR_PLACES.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Show background photo ${i + 1}`}
              onClick={() => setSlideIndex(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === slideIndex ? "w-6 bg-[var(--accent-400)]" : "w-1.5 bg-white/40 hover:bg-white/70"
              }`}
            />
          ))}
        </div>

        <HeroConceptStrip />
      </div>

    </section>
  );
}
