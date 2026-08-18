"use client";
import { motion } from "framer-motion";
import GoldenBadge from "@/components/ui/GoldenBadge";
import CulturalDivider from "@/components/ui/CulturalDivider";
import ScrollReveal from "@/components/ui/ScrollReveal";
import PulseButton from "@/components/ui/PulseButton";
import {
  MAJOR_EVENT_SPONSORSHIP,
  MATERIAL_SPONSORSHIP,
  VENUE_SPONSORSHIP,
  FOOD_COURT_SPONSORSHIP,
  OTHER_SPONSORSHIP,
  ACADEMIC_SPONSORSHIP,
  SOUVENIR_AD_RATES,
} from "@/lib/constants";
import { staggerContainer, fadeUp } from "@/lib/animations";

const BENEFITS_WHY = [
  { icon: "👥", title: "1500+ Pharmacy Leaders",    desc: "Direct access to pharmacy educators, HODs, Principals and Deans from across India." },
  { icon: "🎓", title: "Academic Reach",           desc: "Your brand in front of decision-makers in pharmaceutical education and research." },
  { icon: "📰", title: "Souvenir Publication",     desc: "Full and half-page advertisement in the official conference souvenir book." },
  { icon: "🏆", title: "Brand Visibility",         desc: "Logo on backdrops, banners, registration kits, website, and social media." },
  { icon: "🤝", title: "Exhibition Stall",         desc: "Premium or standard exhibition stalls for product demonstrations and networking." },
  { icon: "📢", title: "Session Branding",         desc: "Opportunity to brand scientific sessions, workshops, and cultural events." },
];

interface PackageItem {
  category: string;
  note?: string;
  amount: string;
  benefits: string[];
}

function PackageGrid({ items }: { items: PackageItem[] }) {
  return (
    <motion.div
      initial="hidden" whileInView="visible" viewport={{ once: true }}
      variants={staggerContainer}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
    >
      {items.map((item) => (
        <motion.div
          key={item.category}
          variants={fadeUp}
          className="rounded-2xl bg-white border border-[var(--accent-500)]/15 p-5 shadow-sm hover:border-[var(--accent-500)]/40 hover:shadow-md transition-all duration-300"
        >
          <div className="flex items-start justify-between gap-3 mb-1">
            <h3 className="font-display font-bold text-base text-[var(--dark-text)] leading-snug">{item.category}</h3>
          </div>
          {item.note && (
            <span className="inline-block mb-2 text-[10px] font-bold uppercase tracking-wide text-[var(--muted-text)]">{item.note}</span>
          )}
          <p className="font-black text-xl text-[var(--primary-800)] mb-3">{item.amount}</p>
          <ul className="space-y-1.5">
            {item.benefits.map((b) => (
              <li key={b} className="flex items-start gap-2 text-xs text-[var(--muted-text)] leading-snug">
                <span className="w-3.5 h-3.5 rounded-full bg-[var(--accent-500)]/20 text-[var(--accent-500)] text-[8px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">✓</span>
                {b}
              </li>
            ))}
          </ul>
        </motion.div>
      ))}
    </motion.div>
  );
}

function RateTable({ rows }: { rows: { category: string; quantity: string; amount: string }[] }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-[var(--accent-500)]/15 bg-white shadow-sm">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--accent-500)]/15 bg-[var(--surface-100)]">
            <th className="text-left font-display font-bold text-[var(--dark-text)] px-5 py-3">Ad Category</th>
            <th className="text-left font-display font-bold text-[var(--dark-text)] px-5 py-3">Quantity</th>
            <th className="text-right font-display font-bold text-[var(--dark-text)] px-5 py-3">Rate</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row.category} className={i % 2 === 1 ? "bg-[var(--surface-50)]" : ""}>
              <td className="px-5 py-3 text-[var(--dark-text)]">{row.category}</td>
              <td className="px-5 py-3 text-[var(--muted-text)]">{row.quantity}</td>
              <td className="px-5 py-3 text-right font-semibold text-[var(--primary-800)]">{row.amount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SectionHeading({ prefix, accent }: { prefix: string; accent: string }) {
  return (
    <ScrollReveal className="text-center mb-10">
      <h2 className="font-display font-bold text-2xl sm:text-3xl text-[var(--dark-text)]">
        {prefix} <span className="text-gradient-primary">{accent}</span>
      </h2>
    </ScrollReveal>
  );
}

export default function SponsorsClient() {
  return (
    <div className="bg-[var(--surface-50)] min-h-screen">

      {/* Hero */}
      <section className="relative py-24 md:py-28 overflow-hidden">
        <div className="absolute inset-0 tribal-pattern-bg opacity-30" aria-hidden />
        <div className="container-site relative z-10 text-center">
          <GoldenBadge>Sponsorship</GoldenBadge>
          <h1 className="mt-6 font-display font-black text-4xl sm:text-5xl md:text-6xl text-[var(--dark-text)] leading-tight">
            Partner with <span className="text-gradient-primary">APTICON 2026</span>
          </h1>
          <p className="mt-5 text-base md:text-lg text-[var(--muted-text)] max-w-xl mx-auto">
            Gain unparalleled visibility among 1500+ pharmacy professionals. Support India&apos;s premier pharmacy education convention and be part of a national movement.
          </p>
          <div className="mt-8">
            <PulseButton href="mailto:apticon2026@gmail.com" variant="accent" pulse external>
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
              Why <span className="text-gradient-accent">Sponsor?</span>
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
                className="rounded-2xl bg-white border border-[var(--accent-500)]/15 p-6 hover:border-[var(--accent-500)]/50 hover:shadow-md transition-all duration-300 group"
              >
                <span className="text-4xl mb-4 block">{b.icon}</span>
                <h3 className="font-display font-bold text-lg text-[var(--dark-text)] mb-2 group-hover:text-[var(--primary-800)] transition-colors">{b.title}</h3>
                <p className="text-sm text-[var(--muted-text)] leading-relaxed">{b.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Major Event Sponsorship */}
      <section className="py-16 md:py-20 bg-[var(--surface-100)]">
        <div className="container-site">
          <ScrollReveal className="text-center mb-3">
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-[var(--dark-text)]">
              Major Event <span className="text-gradient-primary">Sponsorship</span>
            </h2>
          </ScrollReveal>
          <p className="text-center text-xs text-[var(--muted-text)] mb-12">All rates inclusive of GST</p>
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
          >
            {MAJOR_EVENT_SPONSORSHIP.map((tier) => (
              <motion.div
                key={tier.tier}
                variants={fadeUp}
                className={`rounded-2xl bg-white border p-6 shadow-sm flex flex-col ${tier.featured ? "border-[#B8860B] ring-2 ring-[#B8860B]/40 shadow-lg" : "border-[var(--accent-500)]/15"}`}
              >
                {tier.featured && (
                  <div className="mb-3">
                    <span className="text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full bg-amber-100 text-amber-700">Most Exclusive</span>
                  </div>
                )}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full" style={{ backgroundColor: tier.color }} />
                  <h3 className="font-display font-black text-lg text-[var(--dark-text)]">{tier.tier}</h3>
                </div>
                <p className="font-black text-2xl text-[var(--primary-800)] mb-5">{tier.amount}</p>
                <ul className="space-y-2 flex-1">
                  {tier.benefits.map((b) => (
                    <li key={b} className="flex items-start gap-2 text-sm text-[var(--muted-text)]">
                      <span className="w-4 h-4 rounded-full bg-[var(--accent-500)]/20 text-[var(--accent-500)] text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">✓</span>
                      {b}
                    </li>
                  ))}
                </ul>
                <a
                  href="mailto:apticon2026@gmail.com"
                  className="mt-6 block text-center py-2.5 rounded-xl border-2 border-[var(--primary-800)] text-[var(--primary-800)] font-semibold text-sm hover:bg-[var(--primary-800)] hover:text-white transition-all duration-200"
                >
                  Express Interest
                </a>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <CulturalDivider variant="bastar" className="opacity-40" />

      {/* Material Sponsorship */}
      <section className="py-16 md:py-20">
        <div className="container-site">
          <SectionHeading prefix="Material" accent="Sponsorship" />
          <PackageGrid items={MATERIAL_SPONSORSHIP} />
        </div>
      </section>

      {/* Venue Sponsorship */}
      <section className="py-16 md:py-20 bg-[var(--surface-100)]">
        <div className="container-site">
          <SectionHeading prefix="Venue" accent="Sponsorship" />
          <PackageGrid items={VENUE_SPONSORSHIP} />
        </div>
      </section>

      {/* Food Court Sponsorship */}
      <section className="py-16 md:py-20">
        <div className="container-site">
          <SectionHeading prefix="Food Court" accent="Sponsorship" />
          <PackageGrid items={FOOD_COURT_SPONSORSHIP} />
        </div>
      </section>

      {/* Other Sponsorship */}
      <section className="py-16 md:py-20 bg-[var(--surface-100)]">
        <div className="container-site">
          <SectionHeading prefix="Other" accent="Sponsorship" />
          <PackageGrid items={OTHER_SPONSORSHIP} />
        </div>
      </section>

      {/* Academic Sponsorship */}
      <section className="py-16 md:py-20">
        <div className="container-site">
          <SectionHeading prefix="Academic" accent="Sponsorship" />
          <p className="text-center text-sm text-[var(--muted-text)] -mt-6 mb-10">Exclusively for universities, institutes and academic consultancies</p>
          <PackageGrid items={ACADEMIC_SPONSORSHIP} />
        </div>
      </section>

      <CulturalDivider variant="bastar" className="opacity-40" />

      {/* Souvenir Ad Rates */}
      <section className="py-16 md:py-20 bg-[var(--surface-100)]">
        <div className="container-site max-w-3xl">
          <SectionHeading prefix="Souvenir" accent="Advertisement Rates" />
          <RateTable rows={SOUVENIR_AD_RATES} />
        </div>
      </section>

      <CulturalDivider variant="lotus-row" className="container-site" />

      <div className="py-12 text-center">
        <p className="text-[var(--muted-text)] mb-4">For customized packages and sponsorship brochure:</p>
        <PulseButton href="mailto:apticon2026@gmail.com" variant="primary" external>
          Contact: apticon2026@gmail.com
        </PulseButton>
      </div>
    </div>
  );
}
