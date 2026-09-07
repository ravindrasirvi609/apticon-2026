"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GoldenBadge from "@/components/ui/GoldenBadge";
import CulturalDivider from "@/components/ui/CulturalDivider";
import SpeakerCard, { type Speaker } from "@/components/speakers/SpeakerCard";
import { staggerContainer, fadeUp, scaleIn } from "@/lib/animations";

const SPEAKERS: Speaker[] = [
  {
    name: "Chief Guest",
    title: "Eminent Personality",
    institution: "To Be Announced",
    role: "keynote",
    topic: "Vision for Pharmacy Education in India",
  },
  {
    name: "Keynote Speaker",
    title: "Distinguished Professor",
    institution: "To Be Announced",
    role: "keynote",
    topic: "Viksit Pharmacist for Atmanirbhar Bharat",
  },
  {
    name: "Invited Speaker I",
    title: "Professor & Head",
    institution: "To Be Announced",
    role: "invited",
    topic: "Pharmaceutical Education Innovation",
  },
  {
    name: "Invited Speaker II",
    title: "Senior Researcher",
    institution: "To Be Announced",
    role: "invited",
    topic: "Drug Discovery in India",
  },
  {
    name: "Invited Speaker III",
    title: "Dean, Pharmacy",
    institution: "To Be Announced",
    role: "invited",
    topic: "Clinical Pharmacy Practice",
  },
  {
    name: "Invited Speaker IV",
    title: "Professor",
    institution: "To Be Announced",
    role: "invited",
    topic: "Herbal & Traditional Medicine",
  },
  {
    name: "Invited Speaker V",
    title: "Associate Professor",
    institution: "To Be Announced",
    role: "invited",
    topic: "Regulatory Affairs & Quality",
  },
  {
    name: "Workshop Facilitator",
    title: "Expert Educator",
    institution: "To Be Announced",
    role: "workshop",
    topic: "Outcome-Based Pharmacy Education",
  },
  {
    name: "Session Chair I",
    title: "Professor",
    institution: "To Be Announced",
    role: "chair",
  },
  {
    name: "Session Chair II",
    title: "Professor & Principal",
    institution: "To Be Announced",
    role: "chair",
  },
  {
    name: "Session Chair III",
    title: "Head of Department",
    institution: "To Be Announced",
    role: "chair",
  },
  {
    name: "Session Chair IV",
    title: "Dean",
    institution: "To Be Announced",
    role: "chair",
  },
];

const TABS = [
  { key: "all", label: "All" },
  { key: "keynote", label: "Keynote" },
  { key: "invited", label: "Invited" },
  { key: "workshop", label: "Workshop" },
  { key: "chair", label: "Session Chairs" },
] as const;

type Tab = (typeof TABS)[number]["key"];

export default function SpeakersClient() {
  const [activeTab, setActiveTab] = useState<Tab>("all");

  const filtered =
    activeTab === "all"
      ? SPEAKERS
      : SPEAKERS.filter((s) => s.role === activeTab);

  return (
    <div className="bg-[var(--surface-50)] min-h-screen">
      {/* Hero */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <div
          className="absolute inset-0 tribal-pattern-bg opacity-30"
          aria-hidden
        />
        <div
          className="absolute left-0 top-0 w-72 h-72 opacity-20 pointer-events-none"
          aria-hidden
        >
          <img src="/cultural/gondi-sun.svg" alt="" className="w-full h-full" />
        </div>
        <div className="container-site relative z-10 text-center">
          <GoldenBadge>Distinguished Speakers</GoldenBadge>
          <h1 className="mt-6 font-display font-black text-4xl sm:text-5xl md:text-6xl text-[var(--dark-text)] leading-tight">
            Meet the <span className="text-gradient-primary">Experts</span>
          </h1>
          <p className="mt-6 text-base md:text-lg text-[var(--muted-text)] max-w-xl mx-auto">
            Speaker announcements are coming soon. We are curating an
            outstanding lineup of pharmacy educators and industry leaders.
          </p>
        </div>
      </section>

      <CulturalDivider variant="bastar" className="opacity-40" />

      {/* Filter tabs */}
      <section className="sticky top-16 md:top-20 z-20 bg-[var(--surface-50)]/95 backdrop-blur-sm border-b border-[var(--accent-500)]/15 py-4">
        <div className="container-site">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-shrink-0 px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200
                  ${
                    activeTab === tab.key
                      ? "bg-[var(--primary-800)] text-white shadow-md shadow-[var(--primary-800)]/25"
                      : "bg-white border border-[var(--accent-500)]/25 text-[var(--muted-text)] hover:border-[var(--accent-500)]/60 hover:text-[var(--primary-800)]"
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="py-16 md:py-20">
        <div className="container-site">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
            >
              {filtered.map((speaker, i) => (
                <motion.div key={`${speaker.name}-${i}`} variants={fadeUp}>
                  <SpeakerCard speaker={speaker} />
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-16 rounded-2xl bg-[var(--primary-800)] p-8 text-center"
          >
            <p className="font-display font-bold text-2xl text-white mb-2">
              More Speakers Being Confirmed
            </p>
            <p className="text-white/70 text-sm max-w-md mx-auto mb-6">
              Check back soon — we are in the process of finalising a stellar
              speaker lineup from across India and beyond.
            </p>
            <a
              href={`mailto:${process.env.NEXT_PUBLIC_EMAIL ?? "apticon2026@gmail.com"}`}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[var(--accent-400)] text-[var(--dark-text)] font-semibold text-sm hover:bg-[var(--accent-300)] transition-colors"
            >
              Nominate a Speaker
            </a>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
