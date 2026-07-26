"use client";
import { motion } from "framer-motion";
import { staggerContainer, fadeUp, scaleIn } from "@/lib/animations";
import CulturalDivider from "@/components/ui/CulturalDivider";
import PulseButton from "@/components/ui/PulseButton";
import { EVENT } from "@/lib/constants";

const PILLARS = [
  { icon: "🎓", title: "Pharma Education", desc: "Innovative, outcome-based curriculum aligned with national health goals." },
  { icon: "🔬", title: "Research Excellence", desc: "Advancing drug discovery, indigenous medicine and translational research." },
  { icon: "🇮🇳", title: "Atmanirbhar Bharat", desc: "Self-reliant pharmaceutical ecosystem supporting India's health sovereignty." },
  { icon: "🌿", title: "Viksit Bharat 2047", desc: "Building a developed India through skilled, ethical pharmacy professionals." },
];

export default function ThemeSection() {
  return (
    <section className="relative overflow-hidden">
      {/* Wave top */}
      <CulturalDivider variant="wave" />

      <div className="bg-[var(--crimson-800)] relative">
        {/* Tribal pattern overlay */}
        <div
          aria-hidden
          className="absolute inset-0 tribal-pattern-bg opacity-[0.06] pointer-events-none"
        />
        {/* Gold shimmer lines */}
        <div aria-hidden className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[var(--gold-500)]/60 to-transparent" />
        <div aria-hidden className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[var(--gold-500)]/60 to-transparent" />

        <div className="container-site py-20 md:py-28 relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={staggerContainer}
            className="text-center"
          >
            {/* Theme badge */}
            <motion.div variants={scaleIn} className="flex justify-center mb-6">
              <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-[var(--gold-500)]/40 bg-[var(--gold-500)]/10 text-[var(--gold-400)] text-xs font-bold tracking-widest uppercase">
                <span className="w-4 h-px bg-[var(--gold-500)]/50" />
                Conference Theme
                <span className="w-4 h-px bg-[var(--gold-500)]/50" />
              </span>
            </motion.div>

            {/* Main theme */}
            <motion.h2
              variants={fadeUp}
              className="font-display font-black text-white leading-tight mx-auto max-w-4xl"
              style={{ fontSize: "clamp(1.5rem, 4vw, 3rem)" }}
            >
              {EVENT.theme}
            </motion.h2>

            {/* Hindi */}
            <motion.p variants={fadeUp} className="mt-4 font-devanagari text-lg md:text-xl text-[var(--gold-400)]/80">
              {EVENT.themeHindi}
            </motion.p>

            {/* Vision badge */}
            <motion.div variants={scaleIn} className="mt-8 flex justify-center">
              <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/10 border border-white/20">
                <span className="text-2xl">🚀</span>
                <div className="text-left">
                  <p className="text-xs text-white/60 font-semibold tracking-widest uppercase">Sub-Vision</p>
                  <p className="text-sm font-bold text-[var(--gold-400)]">{EVENT.vision}</p>
                </div>
              </div>
            </motion.div>

            {/* Lotus divider */}
            <motion.div variants={fadeUp} className="mt-12">
              <CulturalDivider variant="lotus-row" className="[&>div]:bg-[var(--gold-500)]/20 [&_span]:border-[var(--gold-500)]/20" />
            </motion.div>

            {/* Pillars grid */}
            <motion.div
              variants={staggerContainer}
              className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
            >
              {PILLARS.map((p) => (
                <motion.div
                  key={p.title}
                  variants={fadeUp}
                  className="
                    group rounded-2xl p-6 text-left
                    bg-white/8 border border-white/10
                    hover:bg-white/15 hover:border-[var(--gold-500)]/30
                    transition-all duration-300
                  "
                >
                  <span className="text-3xl mb-4 block">{p.icon}</span>
                  <h3 className="font-display font-bold text-white text-lg mb-2 group-hover:text-[var(--gold-400)] transition-colors">
                    {p.title}
                  </h3>
                  <p className="text-sm text-white/65 leading-relaxed">{p.desc}</p>
                </motion.div>
              ))}
            </motion.div>

            {/* CTA */}
            <motion.div variants={fadeUp} className="mt-12">
              <PulseButton href="/about" variant="gold">
                Learn More About APTICON
              </PulseButton>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Wave bottom (flipped) */}
      <CulturalDivider variant="wave" flip />
    </section>
  );
}
