"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { User, ArrowRight, Crown } from "lucide-react";
import { staggerContainer, fadeUp, scaleIn } from "@/lib/animations";
import type { CommitteeMember } from "@/lib/committee-data";
import { CHIEF_GUESTS, PATRONS } from "@/lib/committee-rosters";

function PatronCard({
  patron,
  large,
}: {
  patron: CommitteeMember;
  large?: boolean;
}) {
  const size = large ? "h-36 w-36" : "h-28 w-28";
  return (
    <motion.div
      variants={fadeUp}
      className="group flex flex-col items-center gap-3 rounded-2xl border border-[var(--surface-200)] bg-[var(--surface-50)] p-6 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[var(--accent-500)]/40 hover:shadow-lg"
    >
      <div className="relative">
        {patron.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={patron.image}
            alt={patron.name}
            className={`${size} rounded-full object-cover object-top ring-4 ring-white shadow-md`}
          />
        ) : (
          <div
            className={`flex ${size} items-center justify-center rounded-full bg-gradient-to-br from-[var(--primary-800)] to-[var(--accent-500)] ring-4 ring-white shadow-md`}
          >
            <User size={36} className="text-white/90" />
          </div>
        )}
      </div>

      {patron.role && (
        <span className="inline-block rounded-full bg-gradient-to-r from-[var(--primary-800)] to-[var(--accent-500)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-white">
          {patron.role}
        </span>
      )}

      <div>
        <p
          className={`font-semibold leading-snug text-[var(--dark-text)] ${large ? "text-base" : "text-sm"}`}
        >
          {patron.name}
        </p>
        {patron.designation && (
          <p className="mt-1 text-xs leading-snug text-[var(--muted-text)]">
            {patron.designation}
          </p>
        )}
        {patron.institution && (
          <p className="text-xs leading-snug text-[var(--muted-text)]">
            {patron.institution}
          </p>
        )}
      </div>
    </motion.div>
  );
}

export default function PatronsSection() {
  return (
    <section className="relative overflow-hidden bg-white py-16 sm:py-20 md:py-28">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 top-1/3 h-80 w-80 rounded-full bg-[var(--primary-800)]/[0.05] blur-3xl"
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
              <Crown size={12} />
              Patrons
            </span>
          </motion.div>
          <motion.h2
            variants={fadeUp}
            className="mt-5 font-display text-3xl font-bold text-[var(--dark-text)] sm:text-4xl md:text-5xl"
          >
            Guided by{" "}
            <span className="text-gradient-primary">
              Distinguished Patronage
            </span>
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="mx-auto mt-4 max-w-xl text-sm text-[var(--muted-text)] sm:text-base"
          >
            APTICON 2026 is held under the esteemed patronage of the following
            dignitaries.
          </motion.p>
        </motion.div>

        {/* Chief Patron */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={staggerContainer}
          className="mx-auto grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-2"
        >
          {CHIEF_GUESTS.map((patron) => (
            <PatronCard key={patron.name} patron={patron} large />
          ))}
        </motion.div>

        {/* Patrons */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={staggerContainer}
          className="mx-auto mt-6 grid max-w-6xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {PATRONS.map((patron) => (
            <PatronCard key={patron.name} patron={patron} />
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
            href="/committee#patrons"
            className="group inline-flex items-center gap-2 rounded-full border-2 border-[var(--primary-800)] px-7 py-3 text-sm font-bold text-[var(--primary-800)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[var(--primary-800)] hover:text-white sm:text-base"
          >
            View All Patrons &amp; Committees
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
