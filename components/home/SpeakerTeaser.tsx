"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { UserRound, ArrowRight, Sparkles } from "lucide-react";
import { staggerContainer, fadeUp, scaleIn } from "@/lib/animations";

const PLACEHOLDERS = [
  { role: "Chief Guest" },
  { role: "Keynote Speaker" },
  { role: "Invited Speaker" },
  { role: "Invited Speaker" },
  { role: "Session Chair" },
  { role: "Workshop Facilitator" },
];

export default function SpeakerTeaser() {
  return (
    <section className="relative overflow-hidden bg-[var(--surface-100)] py-16 sm:py-20 md:py-28">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 top-1/2 h-80 w-80 -translate-y-1/2 rounded-full bg-[var(--accent-500)]/[0.06] blur-3xl"
      />

      <div className="container-site relative">
        {/* Header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={staggerContainer}
          className="mb-10 text-center md:mb-14"
        >
          <motion.div variants={scaleIn} className="flex justify-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-[var(--accent-500)]/30 bg-[var(--accent-500)]/10 px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--accent-500)] sm:text-[11px]">
              <Sparkles size={12} />
              Speakers
            </span>
          </motion.div>
          <motion.h2
            variants={fadeUp}
            className="mt-5 font-display text-3xl font-bold text-[var(--dark-text)] sm:text-4xl md:text-5xl"
          >
            Distinguished{" "}
            <span className="text-gradient-primary">Speakers</span>
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="mx-auto mt-4 max-w-xl text-sm text-[var(--muted-text)] sm:text-base"
          >
            Speaker announcements will be updated soon. Stay tuned for an
            outstanding lineup of pharmacy educators and industry leaders.
          </motion.p>
        </motion.div>

        {/* Placeholder grid */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={staggerContainer}
          className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6"
        >
          {PLACEHOLDERS.map((sp, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              className="group flex flex-col items-center gap-3 rounded-2xl border border-[var(--surface-200)] bg-white p-4 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[var(--accent-500)]/40 hover:shadow-lg sm:p-5"
            >
              {/* Avatar slot */}
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[var(--primary-800)]/10 to-[var(--accent-500)]/10 text-[var(--primary-800)]/45 ring-1 ring-[var(--surface-200)] transition-colors duration-300 group-hover:text-[var(--primary-800)] sm:h-18 sm:w-18">
                <UserRound size={26} />
              </div>

              <div className="flex flex-col items-center gap-1.5">
                <p className="text-[11px] font-semibold leading-snug text-[var(--dark-text)] sm:text-xs">
                  {sp.role}
                </p>
                <span className="rounded-full bg-[var(--accent-500)]/12 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em] text-[var(--accent-500)]">
                  To be announced
                </span>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.25, duration: 0.5 }}
          className="mt-10 flex justify-center md:mt-12"
        >
          <Link
            href="/speakers"
            className="group inline-flex items-center gap-2 rounded-full border-2 border-[var(--primary-800)] px-7 py-3 text-sm font-bold text-[var(--primary-800)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[var(--primary-800)] hover:text-white sm:text-base"
          >
            View All Speakers
            <ArrowRight
              size={16}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
