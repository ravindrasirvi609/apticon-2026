"use client";
import { useRef, useEffect, useState } from "react";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { Award, Users, Mic2, Network } from "lucide-react";
import { staggerContainer, fadeLeft, fadeRight } from "@/lib/animations";
import { STATS } from "@/lib/constants";

const STAT_ICONS = [Award, Users, Mic2, Network];

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
      {count.toLocaleString("en-IN")}
      <span className="text-[var(--accent-500)]">{suffix}</span>
    </span>
  );
}

export default function AboutPreview() {
  return (
    <section className="relative overflow-hidden bg-[var(--surface-50)] py-16 sm:py-20 md:py-28">
      {/* soft ambient wash */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 top-0 h-[26rem] w-[26rem] rounded-full bg-[var(--primary-600)]/[0.07] blur-3xl"
      />

      <div className="container-site relative">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">

          {/* ── Left: copy ─────────────────────────────────── */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={staggerContainer}
          >
            <motion.span
              variants={fadeLeft}
              className="inline-flex items-center gap-2 rounded-full border border-[var(--accent-500)]/30 bg-[var(--accent-500)]/10 px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--accent-500)] sm:text-[11px]"
            >
              About APTICON 2026
            </motion.span>

            <motion.h2
              variants={fadeLeft}
              className="mt-5 font-display text-3xl font-bold leading-tight text-[var(--dark-text)] sm:text-4xl md:text-5xl"
            >
              India&apos;s Premier{" "}
              <span className="text-gradient-primary">Pharmacy</span>{" "}
              Education Convention
            </motion.h2>

            <motion.p
              variants={fadeLeft}
              className="mt-6 text-base leading-relaxed text-[var(--muted-text)] md:text-lg"
            >
              APTICON — the Annual National Convention of the{" "}
              <strong className="font-semibold text-[var(--dark-text)]">
                Association of Pharmaceutical Teachers of India (APTI)
              </strong>{" "}
              — brings together pharmacy educators, researchers, and industry leaders from across the nation.
            </motion.p>

            <motion.p
              variants={fadeLeft}
              className="mt-4 text-base leading-relaxed text-[var(--muted-text)]"
            >
              The 28th edition is proudly hosted by{" "}
              <strong className="font-semibold text-[var(--primary-800)]">
                APTI Chhattisgarh State Branch
              </strong>{" "}
              in association with the{" "}
              <strong className="font-semibold text-[var(--dark-text)]">
                University Institute of Pharmacy, Pt. Ravishankar Shukla University, Raipur
              </strong>{" "}
              — a NAAC A+ accredited institution.
            </motion.p>

            {/* Hindi pull-quote */}
            <motion.blockquote
              variants={fadeLeft}
              className="mt-8 border-l-2 border-[var(--accent-500)] pl-4 font-devanagari text-sm text-[var(--primary-800)] sm:text-base"
            >
              &ldquo;विकसित फार्मासिस्ट — आत्मनिर्भर भारत की नींव&rdquo;
            </motion.blockquote>
          </motion.div>

          {/* ── Right: stats + imagery ─────────────────────── */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={fadeRight}
          >
            {/* Stat grid */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {STATS.map((stat, i) => {
                const Icon = STAT_ICONS[i % STAT_ICONS.length];
                return (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                    className="group rounded-2xl border border-[var(--surface-200)] bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[var(--accent-500)]/40 hover:shadow-lg sm:p-5"
                  >
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--primary-800)]/8 text-[var(--primary-800)] transition-colors duration-300 group-hover:bg-[var(--accent-500)]/15 group-hover:text-[var(--accent-500)] sm:h-10 sm:w-10">
                      <Icon size={18} />
                    </span>
                    <p className="mt-3 font-display text-3xl font-black leading-none text-[var(--primary-800)] sm:text-4xl">
                      <CountUp target={stat.value} suffix={stat.suffix} />
                    </p>
                    <p className="mt-1.5 text-xs font-semibold leading-snug text-[var(--muted-text)] sm:text-sm">
                      {stat.label}
                    </p>
                  </motion.div>
                );
              })}
            </div>

            {/* Imagery */}
            <div className="relative mt-6 grid grid-cols-3 gap-3">
              <div className="relative col-span-2 aspect-[4/3] overflow-hidden rounded-2xl shadow-md">
                <Image
                  src="/cultural/CHITRAKOTE.jpg"
                  alt="Chitrakote Falls, the 'Niagara of India' in Chhattisgarh"
                  fill
                  sizes="(max-width: 1024px) 60vw, 380px"
                  className="object-cover transition-transform duration-700 hover:scale-105"
                />
                <span className="absolute bottom-2 left-2 rounded-full bg-black/50 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur-sm">
                  Chitrakote Falls
                </span>
              </div>
              <div className="relative aspect-[3/4] overflow-hidden rounded-2xl shadow-md">
                <Image
                  src="/cultural/kotumsar-caves-jagdalpur-chhattisgarh-1-attr-hero.jpeg"
                  alt="Kotumsar Caves near Jagdalpur, Chhattisgarh"
                  fill
                  sizes="180px"
                  className="object-cover transition-transform duration-700 hover:scale-105"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
