"use client";
import { Fragment } from "react";
import { motion } from "framer-motion";
import {
  Pill,
  Microscope,
  FlaskConical,
  Dna,
  MonitorSmartphone,
  CloudCog,
  BrainCircuit,
  BookOpen,
  Settings,
  GraduationCap,
  Presentation,
  Users,
  Network,
  Handshake,
  Lightbulb,
  ArrowRight,
  Mail,
} from "lucide-react";
import GoldenBadge from "@/components/ui/GoldenBadge";
import CulturalDivider from "@/components/ui/CulturalDivider";
import ScrollReveal from "@/components/ui/ScrollReveal";
import PulseButton from "@/components/ui/PulseButton";
import { staggerContainer, fadeUp } from "@/lib/animations";
import { EVENT } from "@/lib/constants";

const CATEGORIES = [
  { icon: Pill, label: "Pharmaceutical Technology" },
  { icon: Microscope, label: "Analytical Instruments" },
  { icon: FlaskConical, label: "Laboratory Equipment" },
  { icon: Dna, label: "Biotechnology" },
  { icon: MonitorSmartphone, label: "Medical Devices" },
  { icon: CloudCog, label: "Digital Health" },
  { icon: BrainCircuit, label: "Artificial Intelligence & Software" },
  { icon: BookOpen, label: "Scientific Publishing" },
  { icon: Settings, label: "Research Services" },
  { icon: GraduationCap, label: "Education Technology" },
];

const VALUE_STEPS = [
  { icon: Presentation, label: "Demonstrate" },
  { icon: Users, label: "Interact" },
  { icon: Network, label: "Network" },
  { icon: Handshake, label: "Collaborate" },
  { icon: Lightbulb, label: "Innovate" },
];

export default function ExhibitionClient() {
  return (
    <div className="bg-[var(--surface-50)] min-h-screen">
      {/* Hero */}
      <section className="relative py-24 md:py-28 overflow-hidden">
        <div
          className="absolute inset-0 tribal-pattern-bg opacity-30"
          aria-hidden
        />
        <div className="container-site relative z-10 text-center">
          <GoldenBadge>Exhibition &amp; Expo</GoldenBadge>
          <h1 className="mt-6 font-display font-black text-4xl sm:text-5xl md:text-6xl text-[var(--dark-text)] leading-tight">
            Exhibition <span className="text-gradient-primary">and Expo</span>
          </h1>
          <p className="mt-5 text-base md:text-lg text-[var(--muted-text)] max-w-2xl mx-auto leading-relaxed">
            APTICON 2026 will provide a platform for pharmaceutical companies,
            healthcare organizations, technology providers, publishers,
            equipment manufacturers and research-service organisations to
            demonstrate products, technologies and solutions.
          </p>
        </div>
      </section>

      <CulturalDivider variant="bastar" className="opacity-40" />

      {/* Categories */}
      <section className="py-16 md:py-20">
        <div className="container-site">
          <ScrollReveal className="text-center mb-12">
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-[var(--dark-text)]">
              Suggested Exhibition{" "}
              <span className="text-gradient-accent">Categories</span>
            </h2>
          </ScrollReveal>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={staggerContainer}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4"
          >
            {CATEGORIES.map((c) => (
              <motion.div
                key={c.label}
                variants={fadeUp}
                className="flex flex-col items-center gap-3 rounded-2xl bg-white border border-[var(--accent-500)]/20 p-5 text-center shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-16 h-16 rounded-full bg-[var(--accent-500)]/10 ring-2 ring-[var(--accent-500)]/30 flex items-center justify-center">
                  <c.icon size={28} className="text-[var(--primary-800)]" />
                </div>
                <p className="text-sm font-semibold text-[var(--dark-text)] leading-snug">
                  {c.label}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Value proposition */}
      <section className="py-16 bg-[var(--primary-800)] relative overflow-hidden">
        <div
          className="absolute inset-0 tribal-pattern-bg opacity-5"
          aria-hidden
        />
        <div className="container-site relative z-10">
          <ScrollReveal className="text-center mb-10">
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-white">
              Exhibition{" "}
              <span className="shimmer-accent">Value Proposition</span>
            </h2>
          </ScrollReveal>
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            {VALUE_STEPS.map((step, i) => (
              <Fragment key={step.label}>
                <div className="flex flex-col items-center gap-2 w-24">
                  <div className="w-16 h-16 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                    <step.icon size={26} className="text-[var(--accent-400)]" />
                  </div>
                  <p className="text-sm font-semibold text-white">
                    {step.label}
                  </p>
                </div>
                {i < VALUE_STEPS.length - 1 && (
                  <ArrowRight
                    size={18}
                    className="hidden sm:block text-white/40 -mt-6"
                    aria-hidden
                  />
                )}
              </Fragment>
            ))}
          </div>
          <p className="mt-10 text-center font-display italic text-xl text-[var(--accent-400)]">
            Partnering for a Healthier Tomorrow
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-20">
        <div className="container-site max-w-3xl text-center">
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-[var(--dark-text)]">
            Book Your Stall
          </h2>
          <p className="mt-3 text-[var(--muted-text)]">
            Stall rates and sponsorship packages are listed on the Sponsors
            page. For exhibition enquiries, write to us.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <PulseButton href="/sponsors" variant="accent" pulse>
              View Stall &amp; Sponsorship Rates
            </PulseButton>
            <a
              href={`mailto:${EVENT.contact}?subject=Exhibition%20Enquiry%20-%20APTICON%202026`}
              className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--primary-800)] hover:underline"
            >
              <Mail size={16} /> {EVENT.contact}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
