"use client";
import { motion } from "framer-motion";
import { CheckCircle, Download } from "lucide-react";
import GoldenBadge from "@/components/ui/GoldenBadge";
import CulturalDivider from "@/components/ui/CulturalDivider";
import ScrollReveal from "@/components/ui/ScrollReveal";
import PulseButton from "@/components/ui/PulseButton";
import { EVENT } from "@/lib/constants";
import { staggerContainer, fadeUp } from "@/lib/animations";

const ORAL_PDF = "/downloads/APTICON-2026-Oral-Presentation-Guidelines.pdf";
const POSTER_PDF = "/downloads/APTICON-2026-Poster-Presentation-Guidelines.pdf";

interface StructureRow {
  section: string;
  slides?: string;
  content: string;
}

const ORAL_STATS = [
  { label: "Presentation", value: "5 minutes" },
  { label: "Q&A", value: "2 minutes" },
  { label: "Maximum Slides", value: "10" },
];

const ORAL_STRUCTURE: StructureRow[] = [
  {
    section: "Title Slide",
    slides: "1",
    content:
      "Title, presenter and co-author names, affiliation(s), and APTICON 2026 presentation details.",
  },
  {
    section: "Introduction",
    slides: "2 slides",
    content: "Background/rationale, research gap, objective or hypothesis.",
  },
  {
    section: "Materials & Methods",
    slides: "2 slides",
    content:
      "Study design/workflow; key materials, methods, analytical/statistical approaches. Prefer flowcharts/schematics.",
  },
  {
    section: "Results & Discussion",
    slides: "Up to 3 slides",
    content:
      "Present key findings using graphs, figures and concise tables; highlight important/significant results and briefly interpret them.",
  },
  {
    section: "Conclusion",
    slides: "1 slide",
    content:
      "Major findings, scientific significance, applications and/or future scope.",
  },
  {
    section: "References",
    slides: "1 slide",
    content:
      "Only the most relevant references cited in the presentation, in a consistent style.",
  },
];

const ORAL_DESIGN = [
  "Use a clean, professional, scientifically appropriate design with consistent fonts, formatting, terminology and units.",
  "Use large, readable fonts and high-contrast text. Avoid dense paragraphs and overcrowded slides.",
  "Prefer graphs, figures, flowcharts, schematics and representative images over lengthy text.",
  "Keep tables concise and readable; label all figures/tables clearly and indicate statistical significance where applicable.",
  "Use high-resolution visuals and avoid unnecessary animations, decorative graphics or excessive transitions.",
];

const ORAL_TIMING = [
  "Maintain a clear scientific flow: Problem/Gap → Objective → Methodology → Results → Conclusion.",
  "Focus only on the most important findings and avoid reading directly from the slides.",
  "Rehearse beforehand to ensure completion within the strict 5-minute presentation limit.",
  "The presentation will be followed by a 2-minute Question & Answer session; answer questions briefly and scientifically.",
];

const POSTER_STATS = [
  { label: "Poster Size", value: "90 × 90 cm" },
  { label: "Pitch", value: "2–3 minutes" },
  { label: "Legible From", value: "1.5–2 m" },
];

const POSTER_GENERAL = [
  {
    title: "Registration",
    text: "At least one presenting author must be registered for APTICON 2026 for the abstract/poster to be accepted.",
  },
  {
    title: "Presenter & Certificates",
    text: "Only the registered presenting author must stand by the assigned board; certificates are awarded post-session.",
  },
];

const POSTER_FORMAT = [
  {
    title: "Dimensions",
    text: "Standard square size of 90 × 90 cm; clearly legible from 1.5–2 metres with high-resolution figures.",
  },
];

const POSTER_STRUCTURE: StructureRow[] = [
  {
    section: "Title & Authors",
    content:
      "Concise title; presenting and co-author names with institutional affiliations.",
  },
  {
    section: "Introduction",
    content:
      "Background, rationale, research gap, and explicit objectives/hypothesis.",
  },
  {
    section: "Materials & Methods",
    content:
      "Study design, materials, and methodology; use flowcharts/schematics.",
  },
  {
    section: "Results & Discussion",
    content:
      "Key findings via graphs, figures, and concise tables with brief interpretation.",
  },
  {
    section: "Conclusion & References",
    content:
      "Major takeaways/future scope; select core references and funding acknowledgements.",
  },
];

const POSTER_DESIGN = [
  {
    title: "Design Standards",
    text: "Clean scientific layout, high text-background contrast, large readable fonts, and consistent formatting.",
  },
  {
    title: "Visuals Over Text",
    text: "Minimize long paragraphs; prioritize bullet points, flowcharts, graphs, and clearly labelled visual summaries.",
  },
];

const POSTER_PROTOCOL = [
  {
    title: "Session & Pitch",
    text: "Be present during the assigned evaluation session; deliver a 2–3 minute structured pitch (Background → Conclusion).",
  },
  {
    title: "Q&A Adherence",
    text: "Answer judges' questions scientifically and concisely within the allotted time limit.",
  },
];

const POSTER_IMPORTANT = [
  {
    title: "Compliance & Display",
    text: "Adhere to 90 × 90 cm dimensions, display original content as accepted, and mount/remove promptly per committee schedule.",
  },
];

function SectionHeading({
  prefix,
  accent,
}: {
  prefix: string;
  accent: string;
}) {
  return (
    <ScrollReveal className="text-center mb-8">
      <h2 className="font-display font-bold text-2xl sm:text-3xl text-[var(--dark-text)]">
        {prefix} <span className="text-gradient-primary">{accent}</span>
      </h2>
    </ScrollReveal>
  );
}

function SubHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="font-display font-bold text-lg text-[var(--dark-text)] mb-4">
      {children}
    </h3>
  );
}

function StatStrip({ stats }: { stats: { label: string; value: string }[] }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={staggerContainer}
      className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10"
    >
      {stats.map((s) => (
        <motion.div
          key={s.label}
          variants={fadeUp}
          className="rounded-2xl bg-white border border-[var(--accent-500)]/20 p-5 text-center shadow-sm"
        >
          <p className="text-[11px] font-bold uppercase tracking-widest text-[var(--muted-text)]">
            {s.label}
          </p>
          <p className="mt-1 font-display font-black text-2xl text-[var(--primary-800)]">
            {s.value}
          </p>
        </motion.div>
      ))}
    </motion.div>
  );
}

function StructureTable({
  rows,
  showSlides,
}: {
  rows: StructureRow[];
  showSlides?: boolean;
}) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-[var(--accent-500)]/15 bg-white shadow-sm">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--accent-500)]/15 bg-[var(--surface-100)]">
            <th className="text-left font-display font-bold text-[var(--dark-text)] px-5 py-3">
              Section
            </th>
            {showSlides && (
              <th className="text-left font-display font-bold text-[var(--dark-text)] px-5 py-3 whitespace-nowrap">
                Suggested Slides
              </th>
            )}
            <th className="text-left font-display font-bold text-[var(--dark-text)] px-5 py-3">
              {showSlides ? "Key Content" : "Recommended Content & Structure"}
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={row.section}
              className={i % 2 === 1 ? "bg-[var(--surface-50)]" : ""}
            >
              <td className="px-5 py-3 font-semibold text-[var(--dark-text)] align-top">
                {row.section}
              </td>
              {showSlides && (
                <td className="px-5 py-3 text-[var(--primary-800)] font-semibold whitespace-nowrap align-top">
                  {row.slides}
                </td>
              )}
              <td className="px-5 py-3 text-[var(--muted-text)]">
                {row.content}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CheckList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li
          key={item}
          className="flex items-start gap-2.5 text-sm text-[var(--muted-text)] leading-relaxed"
        >
          <CheckCircle
            className="w-4 h-4 text-[var(--primary-800)] mt-0.5 flex-shrink-0"
            aria-hidden
          />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function TitledList({ items }: { items: { title: string; text: string }[] }) {
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li
          key={item.title}
          className="flex items-start gap-2.5 text-sm text-[var(--muted-text)] leading-relaxed"
        >
          <CheckCircle
            className="w-4 h-4 text-[var(--primary-800)] mt-0.5 flex-shrink-0"
            aria-hidden
          />
          <span>
            <strong className="font-semibold text-[var(--dark-text)]">
              {item.title}:
            </strong>{" "}
            {item.text}
          </span>
        </li>
      ))}
    </ul>
  );
}

function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-white border border-[var(--accent-500)]/15 p-6 shadow-sm">
      <SubHeading>{title}</SubHeading>
      {children}
    </div>
  );
}

export default function GuidelinesClient() {
  return (
    <div className="bg-[var(--surface-50)] min-h-screen">
      {/* Hero */}
      <section className="relative py-24 md:py-28 overflow-hidden">
        <div
          className="absolute inset-0 tribal-pattern-bg opacity-30"
          aria-hidden
        />
        <div className="container-site relative z-10 text-center">
          <GoldenBadge>Presentation Guidelines</GoldenBadge>
          <h1 className="mt-6 font-display font-black text-4xl sm:text-5xl md:text-6xl text-[var(--dark-text)] leading-tight">
            Oral &amp; Poster{" "}
            <span className="text-gradient-primary">Guidelines</span>
          </h1>
          <p className="mt-5 text-base md:text-lg text-[var(--muted-text)] max-w-2xl mx-auto">
            Guidelines for presenting accepted abstracts at APTICON 2026, the
            28th Annual National Convention of the Association of Pharmaceutical
            Teachers of India (APTI).
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <PulseButton href="#oral" variant="primary">
              Oral Presentation
            </PulseButton>
            <PulseButton href="#poster" variant="outline">
              Poster Presentation
            </PulseButton>
          </div>
        </div>
      </section>

      <CulturalDivider variant="bastar" className="opacity-40" />

      {/* Oral */}
      <section id="oral" className="py-16 md:py-20 scroll-mt-24">
        <div className="container-site max-w-5xl">
          <SectionHeading prefix="Oral" accent="Presentation" />
          <StatStrip stats={ORAL_STATS} />

          <ScrollReveal className="mb-10">
            <SubHeading>1. Recommended Slide Structure</SubHeading>
            <StructureTable rows={ORAL_STRUCTURE} showSlides />
          </ScrollReveal>

          <ScrollReveal className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Panel title="2. Slide Design & Formatting">
              <CheckList items={ORAL_DESIGN} />
            </Panel>
            <Panel title="3. Presentation & Time Management">
              <CheckList items={ORAL_TIMING} />
            </Panel>
          </ScrollReveal>

          <ScrollReveal>
            <div className="rounded-2xl border-2 border-[#B8860B]/50 bg-amber-50 p-5 text-center">
              <p className="text-sm font-semibold text-[var(--dark-text)] leading-relaxed">
                <span className="uppercase tracking-wide text-amber-700">
                  Important:
                </span>{" "}
                Recommended 5–7 slides; absolute maximum = 10 slides, including
                title and references. The 5-minute presentation time will be
                strictly followed.
              </p>
            </div>
            <div className="mt-6 text-center">
              <PulseButton
                href={ORAL_PDF}
                variant="outline"
                download="APTICON-2026-Oral-Presentation-Guidelines.pdf"
              >
                <Download size={16} />
                Download Oral Guidelines (PDF)
              </PulseButton>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <CulturalDivider variant="lotus-row" className="container-site" />

      {/* Poster */}
      <section
        id="poster"
        className="py-16 md:py-20 bg-[var(--surface-100)] scroll-mt-24"
      >
        <div className="container-site max-w-5xl">
          <SectionHeading prefix="Poster" accent="Presentation" />
          <StatStrip stats={POSTER_STATS} />

          <ScrollReveal className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            <Panel title="1. General Instructions & Registration">
              <TitledList items={POSTER_GENERAL} />
            </Panel>
            <Panel title="2. Poster Format & Size">
              <TitledList items={POSTER_FORMAT} />
            </Panel>
          </ScrollReveal>

          <ScrollReveal className="mb-10">
            <SubHeading>3. Recommended Poster Structure</SubHeading>
            <StructureTable rows={POSTER_STRUCTURE} />
          </ScrollReveal>

          <ScrollReveal className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Panel title="4. Poster Design Guidelines">
              <TitledList items={POSTER_DESIGN} />
            </Panel>
            <Panel title="5. Poster Presentation Protocol">
              <TitledList items={POSTER_PROTOCOL} />
            </Panel>
          </ScrollReveal>

          <ScrollReveal>
            <Panel title="6. Important Instructions">
              <TitledList items={POSTER_IMPORTANT} />
            </Panel>
            <div className="mt-6 text-center">
              <PulseButton
                href={POSTER_PDF}
                variant="outline"
                download="APTICON-2026-Poster-Presentation-Guidelines.pdf"
              >
                <Download size={16} />
                Download Poster Guidelines (PDF)
              </PulseButton>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <CulturalDivider variant="bastar" className="opacity-40" />

      <div className="py-12 text-center">
        <p className="text-[var(--muted-text)] mb-4">
          Questions about your presentation? Write to us:
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <PulseButton href={`mailto:${EVENT.contact}`} variant="primary" external>
            {EVENT.contact}
          </PulseButton>
          <PulseButton href="/abstracts" variant="outline">
            Back to Abstracts
          </PulseButton>
        </div>
      </div>
    </div>
  );
}
