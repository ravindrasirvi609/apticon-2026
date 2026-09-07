"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  GraduationCap,
  FlaskConical,
  Factory,
  Sprout,
  ArrowRight,
  Target,
} from "lucide-react";
import { staggerContainer, fadeUp, scaleIn } from "@/lib/animations";
import { EVENT } from "@/lib/constants";

const PILLARS = [
  {
    icon: GraduationCap,
    title: "Pharma Education",
    desc: "Innovative, outcome-based curriculum aligned with national health goals.",
  },
  {
    icon: FlaskConical,
    title: "Research Excellence",
    desc: "Advancing drug discovery, indigenous medicine and translational research.",
  },
  {
    icon: Factory,
    title: "Atmanirbhar Bharat",
    desc: "Self-reliant pharmaceutical ecosystem supporting India's health sovereignty.",
  },
  {
    icon: Sprout,
    title: "Viksit Bharat 2047",
    desc: "Building a developed India through skilled, ethical pharmacy professionals.",
  },
];

export default function ThemeSection() {
  return (
    <section className="relative overflow-hidden bg-[var(--primary-900)]">
      {/* Gradient field */}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-br from-[var(--primary-900)] via-[var(--primary-800)] to-[var(--secondary-900)]"
      />
      {/* Ambient glows */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-[var(--accent-500)]/15 blur-[110px]" />
        <div className="absolute -bottom-32 right-0 h-96 w-96 rounded-full bg-[var(--primary-600)]/25 blur-[110px]" />
      </div>
      {/* Texture */}
      <div
        aria-hidden
        className="tribal-pattern-bg pointer-events-none absolute inset-0 opacity-[0.04]"
      />

      <div className="container-site relative z-10 py-16 sm:py-20 md:py-28">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={staggerContainer}
          className="text-center"
        >
          {/* Section label */}
          <motion.div variants={scaleIn} className="flex justify-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-[var(--accent-400)]/35 bg-[var(--accent-500)]/10 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--accent-300)] backdrop-blur-sm sm:text-[11px]">
              <Target size={12} />
              Conference Theme
            </span>
          </motion.div>

          {/* Theme headline */}
          <motion.h2
            variants={fadeUp}
            className="mx-auto mt-6 max-w-4xl font-display font-black leading-tight text-white"
            style={{ fontSize: "clamp(1.5rem, 4vw, 3rem)" }}
          >
            {EVENT.theme}
          </motion.h2>

          {/* Hindi */}
          <motion.p
            variants={fadeUp}
            className="mt-4 font-devanagari text-base text-[var(--accent-200)] sm:text-lg md:text-xl"
          >
            {EVENT.themeHindi}
          </motion.p>

          {/* Vision chip */}
          <motion.div variants={scaleIn} className="mt-8 flex justify-center">
            <div className="inline-flex items-center gap-3 rounded-2xl border border-white/15 bg-white/[0.08] px-5 py-3 backdrop-blur-md">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--accent-500)]/20 text-[var(--accent-300)]">
                <Target size={17} />
              </span>
              <div className="text-left">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/55">
                  Sub-Vision
                </p>
                <p className="text-sm font-bold text-[var(--accent-300)]">
                  {EVENT.vision}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Pillars */}
          <motion.div
            variants={staggerContainer}
            className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 md:mt-14"
          >
            {PILLARS.map(({ icon: Icon, title, desc }) => (
              <motion.div
                key={title}
                variants={fadeUp}
                className="group rounded-2xl border border-white/10 bg-white/[0.06] p-5 text-left backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-[var(--accent-400)]/40 hover:bg-white/[0.11] sm:p-6"
              >
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--accent-500)]/15 text-[var(--accent-300)] transition-colors duration-300 group-hover:bg-[var(--accent-500)] group-hover:text-white">
                  <Icon size={20} />
                </span>
                <h3 className="mt-4 font-display text-lg font-bold text-white transition-colors duration-300 group-hover:text-[var(--accent-300)]">
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-white/65">
                  {desc}
                </p>
              </motion.div>
            ))}
          </motion.div>

          {/* CTA */}
          <motion.div variants={fadeUp} className="mt-12">
            <Link
              href="/about"
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-[var(--accent-500)] px-7 py-3.5 text-sm font-bold text-white shadow-xl shadow-black/25 transition-all duration-300 hover:-translate-y-0.5 hover:bg-[var(--accent-400)] sm:text-base"
            >
              Know More About 28th APTICON
              <ArrowRight
                size={17}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
