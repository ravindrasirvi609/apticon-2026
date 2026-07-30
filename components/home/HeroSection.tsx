"use client";
import Image from "next/image";
import { motion } from "framer-motion";
import { Calendar, MapPin, ChevronDown } from "lucide-react";
import FloatingParticles from "@/components/ui/FloatingParticles";
import GoldenBadge from "@/components/ui/GoldenBadge";
import PulseButton from "@/components/ui/PulseButton";
import CountdownTimer from "./CountdownTimer";
import HeroConceptStrip from "./HeroConceptStrip";
import { staggerContainer, fadeUp, scaleIn } from "@/lib/animations";
import { EVENT } from "@/lib/constants";

const APTICON_LETTERS = ["A", "P", "T", "I", "C", "O", "N"];

export default function HeroSection() {
  return (
    <section className="relative min-h-[100svh] flex flex-col overflow-hidden pt-6 md:pt-10">

      {/* ── Background layers ─────────────────────────────── */}
      {/* Base gradient */}
      <div
        aria-hidden
        className="absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse 120% 80% at 50% 0%, #fff8e1 0%, #fffde7 45%, #fff3cd 100%)",
        }}
      />

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
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 pt-4 pb-12 md:pb-16">

        {/* Logos row */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex items-center justify-center gap-6 mb-8"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-[var(--crimson-800)]/20 bg-white/90 p-1.5 shadow-sm md:h-20 md:w-20">
            <Image
              src="/logo/APTI.png"
              alt="Association of Pharmaceutical Teachers of India"
              width={350}
              height={437}
              priority
              className="h-full w-full object-contain"
            />
          </div>
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-[var(--gold-500)]/20 border border-[var(--gold-500)]/40 flex items-center justify-center">
            <img src="/cultural/lotus.svg" alt="" className="w-6 h-6" />
          </div>
          <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-[var(--navy-800)]/20 bg-white/90 p-1.5 shadow-sm md:h-20 md:w-20">
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

        {/* APTICON title — letter stagger */}
        <div className="mt-6 mb-2 overflow-hidden">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="flex items-baseline justify-center gap-0 sm:gap-1"
            aria-label="APTICON"
          >
            {APTICON_LETTERS.map((letter, i) => (
              <motion.span
                key={i}
                variants={{
                  hidden:  { opacity: 0, y: 80, rotateX: -90 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    rotateX: 0,
                    transition: { duration: 0.55, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] },
                  },
                }}
                className="inline-block font-display font-black leading-none select-none"
                style={{
                  fontSize: "clamp(3.5rem, 12vw, 8rem)",
                  color: i === 4 ? "transparent" : undefined,
                  background: i === 4
                    ? "linear-gradient(135deg, #D4AF37, #F5C842)"
                    : "linear-gradient(160deg, #0D1B6E 0%, #1A237E 40%, #8B1A1A 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  textShadow: "none",
                }}
              >
                {letter}
              </motion.span>
            ))}
          </motion.div>
        </div>

        {/* Year */}
        <motion.p
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="font-display font-black text-[var(--crimson-800)] leading-none mb-6"
          style={{ fontSize: "clamp(2rem, 6vw, 4.5rem)" }}
        >
          2026
        </motion.p>

        {/* Theme — typewriter effect via Framer */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.85 }}
          className="max-w-2xl mx-auto text-sm sm:text-base md:text-lg font-semibold text-[var(--dark-text)]/75 leading-relaxed mb-2 px-2"
        >
          {EVENT.theme}
        </motion.p>

        {/* Hindi tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.1 }}
          className="font-devanagari text-sm md:text-base text-[var(--crimson-800)]/70 mb-8"
        >
          {EVENT.themeHindi}
        </motion.p>

        {/* Date + Venue pills */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.2 }}
          className="flex flex-col sm:flex-row items-center gap-3 mb-10"
        >
          <span className="flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--crimson-800)] text-white text-xs sm:text-sm font-medium shadow-md shadow-[var(--crimson-800)]/25">
            <Calendar size={14} />
            {EVENT.dateDisplay}
          </span>
          <span className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 border border-[var(--gold-500)]/30 text-[var(--dark-text)] text-xs sm:text-sm font-medium shadow-sm">
            <MapPin size={14} className="text-[var(--crimson-800)] flex-shrink-0" />
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
          <PulseButton href="/registration" variant="gold" pulse className="min-w-[160px]">
            Register Now
          </PulseButton>
          <PulseButton href="/schedule" variant="outline" className="min-w-[160px]">
            View Program
          </PulseButton>
        </motion.div>

        {/* Countdown */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.55 }}
          className="mt-12 md:mt-14"
        >
          <CountdownTimer />
        </motion.div>

        {/* Scroll cue */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.2 }}
          className="mt-8"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
            className="flex flex-col items-center gap-1 text-[var(--crimson-800)]/50"
          >
            <span className="text-[10px] tracking-widest uppercase font-medium">Scroll</span>
            <ChevronDown size={18} />
          </motion.div>
        </motion.div>
      </div>

      {/* ── Concept strip from flyer ── */}
      <div className="relative z-10 mt-auto w-full pb-6 md:pb-8">
        <HeroConceptStrip />
      </div>

    </section>
  );
}
