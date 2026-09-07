"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GoldenBadge from "@/components/ui/GoldenBadge";
import CulturalDivider from "@/components/ui/CulturalDivider";
import SessionCard from "@/components/schedule/SessionCard";
import { SCHEDULE_DAY1, SCHEDULE_DAY2, SESSION_COLORS } from "@/lib/constants";
import { staggerContainer, fadeUp } from "@/lib/animations";
import { Download } from "lucide-react";

const DAYS = [
  {
    key: "day1",
    label: "Day 1",
    date: "24 October 2026",
    sessions: SCHEDULE_DAY1,
  },
  {
    key: "day2",
    label: "Day 2",
    date: "25 October 2026",
    sessions: SCHEDULE_DAY2,
  },
];

const LEGEND = Object.entries(SESSION_COLORS).map(([key, cls]) => ({
  key,
  cls,
}));

export default function ScheduleClient() {
  const [activeDay, setActiveDay] = useState("day1");
  const currentDay = DAYS.find((d) => d.key === activeDay)!;

  return (
    <div className="bg-[var(--surface-50)] min-h-screen">
      {/* Hero */}
      <section className="relative py-24 md:py-28 overflow-hidden">
        <div
          className="absolute inset-0 tribal-pattern-bg opacity-30"
          aria-hidden
        />
        <div className="container-site relative z-10 text-center">
          <GoldenBadge>Program</GoldenBadge>
          <h1 className="mt-6 font-display font-black text-4xl sm:text-5xl md:text-6xl text-[var(--dark-text)] leading-tight">
            Conference <span className="text-gradient-primary">Schedule</span>
          </h1>
          <p className="mt-4 text-[var(--muted-text)] max-w-xl mx-auto">
            Two days of keynotes, scientific sessions, workshops and cultural
            experiences in the heart of Raipur.
          </p>
        </div>
      </section>

      <CulturalDivider variant="bastar" className="opacity-40" />

      {/* Day tabs */}
      <section className="sticky top-16 md:top-20 z-20 bg-[var(--surface-50)]/95 backdrop-blur-sm border-b border-[var(--accent-500)]/15 py-4">
        <div className="container-site flex items-center justify-between gap-4 flex-wrap">
          <div className="flex gap-3">
            {DAYS.map((d) => (
              <button
                key={d.key}
                onClick={() => setActiveDay(d.key)}
                className={`px-6 py-2.5 rounded-full font-semibold text-sm transition-all duration-200
                  ${
                    activeDay === d.key
                      ? "bg-[var(--primary-800)] text-white shadow-md"
                      : "bg-white border border-[var(--accent-500)]/25 text-[var(--muted-text)] hover:text-[var(--primary-800)] hover:border-[var(--accent-500)]/60"
                  }`}
              >
                <span className="hidden sm:inline">{d.label} — </span>
                {d.date}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--accent-500)]/30 text-xs font-semibold text-[var(--muted-text)] hover:border-[var(--accent-500)] hover:text-[var(--primary-800)] transition-colors">
            <Download size={14} /> Program Book
          </button>
        </div>
      </section>

      {/* Sessions */}
      <section className="py-14 md:py-20">
        <div className="container-site">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Timeline */}
            <div className="lg:col-span-2">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeDay}
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0, y: -10 }}
                  variants={staggerContainer}
                >
                  {currentDay.sessions.map((session, i) => (
                    <motion.div key={i} variants={fadeUp}>
                      <SessionCard session={session} index={i} />
                    </motion.div>
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Day summary */}
              <div className="rounded-2xl bg-[var(--primary-800)] p-6 text-white">
                <p className="text-xs font-bold tracking-widest uppercase text-[var(--accent-400)] mb-2">
                  {currentDay.label}
                </p>
                <p className="font-display font-bold text-xl">
                  {currentDay.date}
                </p>
                <p className="text-sm text-white/70 mt-1">
                  {currentDay.sessions.length} sessions planned
                </p>
                <div className="mt-4 pt-4 border-t border-white/10 space-y-1.5">
                  {[
                    "Inauguration",
                    "Keynotes",
                    "Scientific Sessions",
                    "Workshops",
                    "Networking",
                  ].map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-2 text-xs text-white/70"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-500)]" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              {/* Legend */}
              <div className="rounded-2xl bg-white border border-[var(--accent-500)]/15 p-5">
                <p className="text-xs font-bold tracking-widest uppercase text-[var(--muted-text)] mb-4">
                  Session Types
                </p>
                <div className="space-y-2">
                  {LEGEND.map(({ key, cls }) => (
                    <div key={key} className="flex items-center gap-3">
                      <span
                        className={`text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full ${cls}`}
                      >
                        {key}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Venue reminder */}
              <div className="rounded-2xl bg-[var(--surface-100)] border border-[var(--accent-500)]/15 p-5">
                <p className="text-xs font-bold tracking-widest uppercase text-[var(--accent-500)] mb-2">
                  Venue
                </p>
                <p className="text-sm font-semibold text-[var(--dark-text)] leading-snug">
                  Pt. Deendayal Upadhyay Auditorium
                </p>
                <p className="text-xs text-[var(--muted-text)] mt-1">
                  G.E. Road, Raipur, C.G.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
