"use client";
import { motion } from "framer-motion";
import PulseButton from "@/components/ui/PulseButton";

const TIERS = [
  { label: "Platinum Sponsor",   color: "#E5E4E2" },
  { label: "Gold Sponsor",       color: "#EA580C" },
  { label: "Silver Sponsor",     color: "#C0C0C0" },
  { label: "Knowledge Partner",  color: "#1E293B" },
  { label: "Bronze Sponsor",     color: "#CD7F32" },
  { label: "Hospitality Partner",color: "#312E81" },
];

function SponsorPlaceholder({ label, color }: { label: string; color: string }) {
  return (
    <div
      className="flex-shrink-0 mx-6 flex flex-col items-center justify-center gap-2 w-36 h-20 rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200 group"
    >
      <div
        className="w-8 h-8 rounded-full opacity-60 group-hover:opacity-90 transition-opacity"
        style={{ backgroundColor: color }}
      />
      <p className="text-[10px] font-semibold text-center text-gray-400 px-2 leading-snug">
        {label}
      </p>
    </div>
  );
}

const DOUBLED = [...TIERS, ...TIERS];

export default function SponsorMarquee() {
  return (
    <section className="py-16 md:py-20 bg-[var(--surface-100)] border-y border-[var(--accent-500)]/10">
      <div className="container-site mb-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-xs font-bold tracking-widest uppercase text-[var(--accent-500)] mb-3">
            Sponsors & Partners
          </p>
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-[var(--dark-text)]">
            Support APTICON 2026
          </h2>
          <p className="mt-3 text-sm text-[var(--muted-text)] max-w-md mx-auto">
            Sponsorship details will be announced shortly. Become a part of India's premier pharmacy education event.
          </p>
        </motion.div>
      </div>

      {/* Marquee */}
      <div className="w-full overflow-hidden" aria-hidden>
        <div className="marquee-track">
          {DOUBLED.map((tier, i) => (
            <SponsorPlaceholder key={i} label={tier.label} color={tier.color} />
          ))}
        </div>
      </div>

      <div className="container-site mt-10 flex justify-center">
        <PulseButton href="/sponsors" variant="outline">
          Sponsorship Opportunities
        </PulseButton>
      </div>
    </section>
  );
}
