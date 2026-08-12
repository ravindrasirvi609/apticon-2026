"use client";
import { useRef, useEffect, useState } from "react";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { staggerContainer, fadeLeft, fadeRight } from "@/lib/animations";
import ScrollReveal from "@/components/ui/ScrollReveal";
import GoldenBadge from "@/components/ui/GoldenBadge";
import CulturalDivider from "@/components/ui/CulturalDivider";
import { STATS } from "@/lib/constants";

function CountUp({ target, suffix }: { target: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  useEffect(() => {
    if (!inView) return;
    const duration = 1800;
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, target]);

  return (
    <span ref={ref} className="tabular-nums">
      {count}
      <span className="text-[var(--accent-500)]">{suffix}</span>
    </span>
  );
}

export default function AboutPreview() {
  return (
    <section className="relative py-20 md:py-28 bg-[var(--surface-50)]">
      {/* Gondi sun watermark */}
      <div className="absolute right-0 top-0 w-72 h-72 opacity-30 pointer-events-none" aria-hidden>
        <img src="/cultural/gondi-sun.svg" alt="" className="w-full h-full" />
      </div>

      <div className="container-site">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Left — Text */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeLeft}>
              <GoldenBadge>About APTICON 2026</GoldenBadge>
            </motion.div>

            <motion.h2
              variants={fadeLeft}
              className="mt-5 font-display font-bold text-3xl sm:text-4xl md:text-5xl text-[var(--dark-text)] leading-tight"
            >
              India's Premier{" "}
              <span className="text-gradient-primary">Pharmacy</span>{" "}
              Education Convention
            </motion.h2>

            <motion.p variants={fadeLeft} className="mt-6 text-base md:text-lg text-[var(--muted-text)] leading-relaxed">
              APTICON — the Annual National Convention of the{" "}
              <strong className="text-[var(--dark-text)]">
                Association of Pharmaceutical Teachers of India (APTI)
              </strong>{" "}
              — brings together pharmacy educators, researchers, and industry leaders from across the nation.
            </motion.p>

            <motion.p variants={fadeLeft} className="mt-4 text-base text-[var(--muted-text)] leading-relaxed">
              The 28th edition is proudly hosted by{" "}
              <strong className="text-[var(--primary-800)]">APTI Chhattisgarh State Branch</strong>{" "}
              in association with the{" "}
              <strong className="text-[var(--dark-text)]">
                University Institute of Pharmacy, Pt. Ravishankar Shukla University, Raipur
              </strong>{" "}
              — a NAAC A+ accredited institution.
            </motion.p>

            <motion.div variants={fadeLeft} className="mt-8">
              <CulturalDivider variant="lotus-row" className="justify-start max-w-xs" />
            </motion.div>

            <motion.p variants={fadeLeft} className="mt-4 font-devanagari text-sm text-[var(--primary-800)]/70">
              "विकसित फार्मासिस्ट — आत्मनिर्भर भारत की नींव"
            </motion.p>

            {/* Cultural photo collage */}
            <motion.div variants={fadeLeft} className="relative mt-10 mb-6 w-full max-w-sm">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-lg border-4 border-white">
                <Image
                  src="/cultural/CHITRAKOTE.jpg"
                  alt="Chitrakote Falls, the 'Niagara of India' in Chhattisgarh"
                  fill
                  sizes="(max-width: 768px) 100vw, 400px"
                  className="object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 w-28 sm:w-36 aspect-square rounded-2xl overflow-hidden shadow-xl border-4 border-white rotate-3">
                <Image
                  src="/cultural/kotumsar-caves-jagdalpur-chhattisgarh-1-attr-hero.jpeg"
                  alt="Kotumsar Caves near Jagdalpur, Chhattisgarh"
                  fill
                  sizes="144px"
                  className="object-cover"
                />
              </div>
              <span
                aria-hidden
                className="absolute -top-3 -left-3 w-10 h-10 rounded-full bg-[var(--accent-500)]/15 border border-[var(--accent-500)]/30 flex items-center justify-center text-lg"
              >
                📍
              </span>
            </motion.div>
          </motion.div>

          {/* Right — Stats with Bastar frame */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={fadeRight}
            className="relative"
          >
            {/* Bastar art border frame */}
            <div className="absolute -inset-4 rounded-3xl overflow-hidden pointer-events-none" aria-hidden>
              <CulturalDivider variant="bastar" />
              <div className="flex-1 border-x-2 border-[var(--accent-500)]/20 h-full" />
              <CulturalDivider variant="bastar" />
            </div>

            <div className="grid grid-cols-2 gap-4 p-6">
              {STATS.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="
                    relative rounded-2xl p-6 text-center
                    bg-white shadow-sm border border-[var(--accent-500)]/15
                    hover:shadow-md hover:border-[var(--accent-500)]/40
                    transition-all duration-300
                  "
                >
                  <p className="font-display font-black text-4xl md:text-5xl text-[var(--primary-800)]">
                    <CountUp target={stat.value} suffix={stat.suffix} />
                  </p>
                  <p className="mt-2 text-xs sm:text-sm font-semibold text-[var(--muted-text)] leading-snug">
                    {stat.label}
                  </p>
                  {/* Gold corner accent */}
                  <span
                    aria-hidden
                    className="absolute top-3 right-3 w-2 h-2 rounded-full bg-[var(--accent-500)]/40"
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
