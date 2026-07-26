"use client";
import { motion } from "framer-motion";
import GoldenBadge from "@/components/ui/GoldenBadge";
import CulturalDivider from "@/components/ui/CulturalDivider";
import ScrollReveal from "@/components/ui/ScrollReveal";
import PulseButton from "@/components/ui/PulseButton";
import { SPONSORSHIP_TIERS } from "@/lib/constants";
import { staggerContainer, fadeUp } from "@/lib/animations";

const BENEFITS_WHY = [
  { icon: "👥", title: "500+ Pharmacy Leaders",    desc: "Direct access to pharmacy educators, HODs, Principals and Deans from across India." },
  { icon: "🎓", title: "Academic Reach",           desc: "Your brand in front of decision-makers in pharmaceutical education and research." },
  { icon: "📰", title: "Souvenir Publication",     desc: "Full and half-page advertisement in the official conference souvenir book." },
  { icon: "🏆", title: "Brand Visibility",         desc: "Logo on backdrops, banners, registration kits, website, and social media." },
  { icon: "🤝", title: "Exhibition Stall",         desc: "Premium or standard exhibition stalls for product demonstrations and networking." },
  { icon: "📢", title: "Session Branding",         desc: "Opportunity to brand scientific sessions, workshops, and cultural events." },
];

export default function SponsorsClient() {
  return (
    <div className="bg-[var(--cream-50)] min-h-screen">

      {/* Hero */}
      <section className="relative py-24 md:py-28 overflow-hidden">
        <div className="absolute inset-0 tribal-pattern-bg opacity-30" aria-hidden />
        <div className="container-site relative z-10 text-center">
          <GoldenBadge>Sponsorship</GoldenBadge>
          <h1 className="mt-6 font-display font-black text-4xl sm:text-5xl md:text-6xl text-[var(--dark-text)] leading-tight">
            Partner with <span className="text-gradient-crimson">APTICON 2026</span>
          </h1>
          <p className="mt-5 text-base md:text-lg text-[var(--muted-text)] max-w-xl mx-auto">
            Gain unparalleled visibility among 500+ pharmacy professionals. Support India's premier pharmacy education convention and be part of a national movement.
          </p>
          <div className="mt-8">
            <PulseButton href="mailto:apticon2026@gmail.com" variant="gold" pulse external>
              Enquire About Sponsorship
            </PulseButton>
          </div>
        </div>
      </section>

      <CulturalDivider variant="bastar" className="opacity-40" />

      {/* Why Sponsor */}
      <section className="py-16 md:py-20">
        <div className="container-site">
          <ScrollReveal className="text-center mb-12">
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-[var(--dark-text)]">
              Why <span className="text-gradient-gold">Sponsor?</span>
            </h2>
          </ScrollReveal>
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {BENEFITS_WHY.map((b) => (
              <motion.div
                key={b.title}
                variants={fadeUp}
                className="rounded-2xl bg-white border border-[var(--gold-500)]/15 p-6 hover:border-[var(--gold-500)]/50 hover:shadow-md transition-all duration-300 group"
              >
                <span className="text-4xl mb-4 block">{b.icon}</span>
                <h3 className="font-display font-bold text-lg text-[var(--dark-text)] mb-2 group-hover:text-[var(--crimson-800)] transition-colors">{b.title}</h3>
                <p className="text-sm text-[var(--muted-text)] leading-relaxed">{b.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Sponsorship Tiers */}
      <section className="py-16 md:py-20 bg-[var(--cream-100)]">
        <div className="container-site">
          <ScrollReveal className="text-center mb-12">
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-[var(--dark-text)]">
              Sponsorship <span className="text-gradient-crimson">Packages</span>
            </h2>
          </ScrollReveal>
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {SPONSORSHIP_TIERS.map((tier, i) => (
              <motion.div
                key={tier.tier}
                variants={fadeUp}
                className={`rounded-2xl bg-white border p-6 shadow-sm flex flex-col ${i === 0 ? "border-[#E5E4E2] ring-2 ring-[#E5E4E2]/50 shadow-lg" : "border-[var(--gold-500)]/15"}`}
              >
                {i === 0 && (
                  <div className="mb-3">
                    <span className="text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full bg-slate-100 text-slate-500">Most Exclusive</span>
                  </div>
                )}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full" style={{ backgroundColor: tier.color }} />
                  <h3 className="font-display font-black text-xl text-[var(--dark-text)]">{tier.tier}</h3>
                </div>
                <p className="font-black text-3xl text-[var(--crimson-800)] mb-5">{tier.amount}</p>
                <ul className="space-y-2 flex-1">
                  {tier.benefits.map((b) => (
                    <li key={b} className="flex items-start gap-2 text-sm text-[var(--muted-text)]">
                      <span className="w-4 h-4 rounded-full bg-[var(--gold-500)]/20 text-[var(--gold-500)] text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">✓</span>
                      {b}
                    </li>
                  ))}
                </ul>
                <a
                  href="mailto:apticon2026@gmail.com"
                  className="mt-6 block text-center py-2.5 rounded-xl border-2 border-[var(--crimson-800)] text-[var(--crimson-800)] font-semibold text-sm hover:bg-[var(--crimson-800)] hover:text-white transition-all duration-200"
                >
                  Express Interest
                </a>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <CulturalDivider variant="lotus-row" className="container-site" />

      <div className="py-12 text-center">
        <p className="text-[var(--muted-text)] mb-4">For customized packages and sponsorship brochure:</p>
        <PulseButton href="mailto:apticon2026@gmail.com" variant="crimson" external>
          Contact: apticon2026@gmail.com
        </PulseButton>
      </div>
    </div>
  );
}
