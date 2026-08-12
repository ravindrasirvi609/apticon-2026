"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Calendar, MapPin, ArrowRight, CalendarDays } from "lucide-react";
import CountdownTimer from "./CountdownTimer";
import HeroBackgroundSlider from "./HeroBackgroundSlider";
import { EVENT, RAIPUR_PLACES } from "@/lib/constants";

const SLIDE_INTERVAL_MS = 6000;

/* Shared entrance transition — soft, modern easing */
const ease = [0.22, 1, 0.36, 1] as const;
const rise = (delay: number) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, delay, ease },
});

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
    /* Header (announcement bar + navbar) sits above in normal flow, so the hero
       subtracts it to keep the whole composition inside the first screen. */
    <section className="relative flex min-h-[calc(100svh-6.5rem)] flex-col overflow-hidden md:min-h-[calc(100svh-7.5rem)]">

      {/* ── Background ─────────────────────────────────────── */}
      <HeroBackgroundSlider places={RAIPUR_PLACES} index={slideIndex} />

      {/* Ambient colour glows — soft, modern depth */}
      <div aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="absolute -top-32 -left-24 h-[28rem] w-[28rem] rounded-full bg-[var(--primary-600)]/25 blur-[120px]" />
        <div className="absolute -bottom-40 -right-24 h-[32rem] w-[32rem] rounded-full bg-[var(--accent-500)]/20 blur-[130px]" />
      </div>

      {/* Very subtle texture */}
      <div
        aria-hidden
        className="tribal-pattern-bg pointer-events-none absolute inset-0 z-0 opacity-[0.05]"
      />

      {/* ── Content ────────────────────────────────────────── */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 py-5 text-center sm:px-6 md:py-7">

        {/* Institution logos */}
        <motion.div
          {...rise(0.05)}
          className="mb-4 flex items-center justify-center gap-3 sm:gap-4"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/25 bg-white/95 p-2 shadow-lg shadow-black/20 backdrop-blur-sm sm:h-16 sm:w-16 md:h-18 md:w-18">
            <Image
              src="/logo/APTI.png"
              alt="Association of Pharmaceutical Teachers of India"
              width={350}
              height={437}
              priority
              className="h-full w-full object-contain"
            />
          </div>
          <span aria-hidden className="h-8 w-px bg-white/25 sm:h-10" />
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/25 bg-white/95 p-2 shadow-lg shadow-black/20 backdrop-blur-sm sm:h-16 sm:w-16 md:h-18 md:w-18">
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

        {/* Edition badge */}
        <motion.div {...rise(0.15)}>
          <span className="inline-flex items-center gap-2 rounded-full border border-[var(--accent-400)]/40 bg-[var(--accent-500)]/15 px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--accent-200)] backdrop-blur-md sm:px-4 sm:text-[11px]">
            <span className="relative flex h-1.5 w-1.5 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--accent-400)] opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--accent-400)]" />
            </span>
            {EVENT.edition}
          </span>
        </motion.div>

        {/* APTICON wordmark — height-capped so the hero always fits the viewport */}
        <motion.div
          initial={{ opacity: 0, y: 28, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.25, ease }}
          className="relative mt-3 w-full max-w-lg sm:mt-4 md:max-w-xl lg:max-w-2xl"
          style={{ height: "clamp(5.5rem, 17vh, 10rem)" }}
        >
          <Image
            src="/logo/APTICON_LOGO.png"
            alt="APTICON 2026 — 28th Annual National Convention"
            fill
            priority
            sizes="(max-width: 640px) 90vw, (max-width: 1024px) 60vw, 42rem"
            className="object-contain drop-shadow-2xl"
          />
        </motion.div>

        {/* Theme */}
        <motion.h1
          {...rise(0.45)}
          className="mx-auto mt-3 max-w-3xl font-display font-bold leading-snug text-white drop-shadow-md sm:mt-4"
          style={{ fontSize: "clamp(1rem, 2.4vw, 1.75rem)" }}
        >
          {EVENT.theme}
        </motion.h1>

        {/* Hindi tagline */}
        <motion.p
          {...rise(0.55)}
          className="mt-2.5 font-devanagari text-sm text-[var(--accent-200)] sm:text-base md:text-lg"
        >
          {EVENT.themeHindi}
        </motion.p>

        {/* Date + venue chips */}
        <motion.div
          {...rise(0.65)}
          className="mt-5 flex flex-col items-center gap-2.5 sm:flex-row sm:justify-center sm:gap-3"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold text-white backdrop-blur-md sm:text-sm">
            <Calendar size={14} className="shrink-0 text-[var(--accent-300)]" />
            {EVENT.dateDisplay}
          </span>
          <span className="inline-flex max-w-full items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold text-white backdrop-blur-md sm:text-sm">
            <MapPin size={14} className="shrink-0 text-[var(--accent-300)]" />
            <span className="truncate">Raipur, Chhattisgarh</span>
          </span>
        </motion.div>

        {/* CTAs */}
        <motion.div
          {...rise(0.75)}
          className="mt-6 flex w-full max-w-xs flex-col items-stretch gap-3 sm:max-w-none sm:flex-row sm:items-center sm:justify-center"
        >
          <Link
            href="/registration"
            className="group inline-flex items-center justify-center gap-2 rounded-full bg-[var(--accent-500)] px-7 py-3.5 text-sm font-bold text-white shadow-xl shadow-[var(--accent-500)]/30 transition-all duration-300 hover:-translate-y-0.5 hover:bg-[var(--accent-400)] hover:shadow-2xl hover:shadow-[var(--accent-500)]/40 sm:text-base"
          >
            Register Now
            <ArrowRight
              size={17}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </Link>
          <Link
            href="/schedule"
            className="group inline-flex items-center justify-center gap-2 rounded-full border border-white/35 bg-white/10 px-7 py-3.5 text-sm font-bold text-white backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-white/60 hover:bg-white/20 sm:text-base"
          >
            <CalendarDays size={17} className="shrink-0" />
            View Program
          </Link>
        </motion.div>

        {/* Countdown */}
        <motion.div {...rise(0.9)} className="mt-6">
          <CountdownTimer />
        </motion.div>
      </div>

      {/* ── Bottom rail: background slide indicators ───────── */}
      <div className="relative z-10 flex w-full justify-center gap-1.5 pb-4">
        {RAIPUR_PLACES.map((place, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Show ${place.name}`}
            aria-current={i === slideIndex}
            onClick={() => setSlideIndex(i)}
            className={`h-1.5 rounded-full transition-all duration-500 ${
              i === slideIndex
                ? "w-7 bg-[var(--accent-400)]"
                : "w-1.5 bg-white/40 hover:bg-white/70"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
