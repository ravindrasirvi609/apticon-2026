"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { Handshake, ArrowRight } from "lucide-react";

const TIERS = [
  { label: "Platinum Sponsor", color: "#94A3B8" },
  { label: "Gold Sponsor", color: "#EA580C" },
  { label: "Silver Sponsor", color: "#CBD5E1" },
  { label: "Knowledge Partner", color: "#1E293B" },
  { label: "Bronze Sponsor", color: "#B45309" },
  { label: "Hospitality Partner", color: "#312E81" },
];

function SponsorPlaceholder({
  label,
  color,
}: {
  label: string;
  color: string;
}) {
  return (
    <div className="group mx-3 flex h-24 w-40 shrink-0 flex-col items-center justify-center gap-2 rounded-2xl border border-[var(--surface-200)] bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md sm:mx-4 sm:w-44">
      <span
        className="h-8 w-8 rounded-full opacity-70 transition-opacity duration-300 group-hover:opacity-100"
        style={{ backgroundColor: color }}
      />
      <p className="px-3 text-center text-[10px] font-semibold leading-snug text-[var(--muted-text)] sm:text-[11px]">
        {label}
      </p>
    </div>
  );
}

const DOUBLED = [...TIERS, ...TIERS];

export default function SponsorMarquee() {
  return (
    <section className="border-t border-[var(--surface-200)] bg-[var(--surface-50)] py-16 sm:py-20">
      <div className="container-site mb-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-[var(--accent-500)]/30 bg-[var(--accent-500)]/10 px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--accent-500)] sm:text-[11px]">
            <Handshake size={12} />
            Sponsors &amp; Partners
          </span>
          <h2 className="mt-5 font-display text-2xl font-bold text-[var(--dark-text)] sm:text-3xl md:text-4xl">
            Support APTICON 2026
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-[var(--muted-text)]">
            Sponsorship details will be announced shortly. Become a part of
            India&apos;s premier pharmacy education event.
          </p>
        </motion.div>
      </div>

      {/* Marquee */}
      <div className="relative w-full overflow-hidden py-1" aria-hidden>
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-[var(--surface-50)] to-transparent sm:w-28"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-[var(--surface-50)] to-transparent sm:w-28"
        />
        <div className="marquee-track">
          {DOUBLED.map((tier, i) => (
            <SponsorPlaceholder key={i} label={tier.label} color={tier.color} />
          ))}
        </div>
      </div>

      <div className="container-site mt-10 flex justify-center">
        <Link
          href="/sponsors"
          className="group inline-flex items-center gap-2 rounded-full border-2 border-[var(--primary-800)] px-7 py-3 text-sm font-bold text-[var(--primary-800)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[var(--primary-800)] hover:text-white sm:text-base"
        >
          Sponsorship Opportunities
          <ArrowRight
            size={16}
            className="transition-transform duration-300 group-hover:translate-x-1"
          />
        </Link>
      </div>
    </section>
  );
}
