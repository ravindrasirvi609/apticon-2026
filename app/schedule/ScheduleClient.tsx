"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GoldenBadge from "@/components/ui/GoldenBadge";
import CulturalDivider from "@/components/ui/CulturalDivider";
import SessionCard from "@/components/schedule/SessionCard";
import { SCHEDULE_DAY1, SCHEDULE_DAY2, SESSION_COLORS } from "@/lib/constants";
import { staggerContainer, fadeUp } from "@/lib/animations";
import {
  OralScheduleList,
  PosterScheduleList,
} from "@/components/schedule/PresentationLists";

const TABS = [
  {
    key: "day1",
    label: "Main Program — Day 1",
    sublabel: "24 Oct 2026",
    sessions: SCHEDULE_DAY1,
  },
  {
    key: "day2",
    label: "Main Program — Day 2",
    sublabel: "25 Oct 2026",
    sessions: SCHEDULE_DAY2,
  },
  {
    key: "poster-schedule",
    label: "Poster Schedule",
    sublabel: "Day 1 & Day 2",
    sessions: null,
  },
  {
    key: "oral-schedule",
    label: "Oral Schedule",
    sublabel: "Full Program",
    sessions: null,
  },
];

const LEGEND = Object.entries(SESSION_COLORS).map(([key, cls]) => ({
  key,
  cls,
}));

export default function ScheduleClient() {
  const [activeTab, setActiveTab] = useState("day1");
  const currentTab = TABS.find((t) => t.key === activeTab)!;
  const conferenceDay = currentTab.sessions
    ? { ...currentTab, sessions: currentTab.sessions }
    : null;

  return (
    <div className="bg-[var(--surface-50)] min-h-screen">
      {/* Hero */}
      <section className="relative py-20 md:py-24 overflow-hidden bg-gradient-to-b from-[var(--surface-100)] to-[var(--surface-50)]">
        <div
          className="absolute inset-0 tribal-pattern-bg opacity-30"
          aria-hidden
        />
        <div className="container-site relative z-10 text-center">
          <GoldenBadge>Scientific Program</GoldenBadge>
          <h1 className="mt-6 font-display font-black text-4xl sm:text-5xl md:text-6xl text-[var(--dark-text)] leading-tight">
            Convention & Presentation <span className="text-gradient-primary">Schedule</span>
          </h1>
          <p className="mt-4 text-[var(--muted-text)] max-w-2xl mx-auto text-base sm:text-lg">
            Complete schedule for Oral Presentations, Poster Presentations, Keynotes, Workshops and Plenary Sessions at APTICON 2026 Raipur.
          </p>
        </div>
      </section>

      <CulturalDivider variant="bastar" className="opacity-40" />

      {/* Tabs bar */}
      <section className="sticky top-16 md:top-20 z-20 bg-[var(--surface-50)]/95 backdrop-blur-md border-b border-[var(--accent-500)]/15 py-3.5 shadow-sm">
        <div className="container-site flex items-center justify-center sm:justify-start gap-2 sm:gap-3 overflow-x-auto no-scrollbar py-1">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-2.5 rounded-full font-bold text-xs sm:text-sm whitespace-nowrap transition-all duration-200 shrink-0
                ${
                  activeTab === tab.key
                    ? "bg-[var(--primary-800)] text-white shadow-md scale-[1.02]"
                    : "bg-white border border-[var(--accent-500)]/25 text-[var(--muted-text)] hover:text-[var(--primary-800)] hover:border-[var(--accent-500)]/60"
                }`}
            >
              <span>{tab.label}</span>
              <span className="opacity-70 font-normal text-[11px] ml-1.5">({tab.sublabel})</span>
            </button>
          ))}
        </div>
      </section>

      {/* Main Content */}
      <section className="py-10 md:py-16">
        <div className="container-site">
          {activeTab === "oral-schedule" && <OralScheduleList />}
          {activeTab === "poster-schedule" && <PosterScheduleList />}

          {conferenceDay && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              {/* Timeline */}
              <div className="lg:col-span-2">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial="hidden"
                    animate="visible"
                    exit={{ opacity: 0, y: -10 }}
                    variants={staggerContainer}
                  >
                    {conferenceDay.sessions.map((session, i) => (
                      <motion.div key={i} variants={fadeUp}>
                        <SessionCard session={session} index={i} />
                      </motion.div>
                    ))}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Summary */}
                <div className="rounded-2xl bg-[var(--primary-800)] p-6 text-white">
                  <p className="text-xs font-bold tracking-widest uppercase text-[var(--accent-400)] mb-2">
                    {currentTab.label}
                  </p>
                  <p className="font-display font-bold text-xl">
                    {currentTab.sublabel}
                  </p>
                  <p className="text-sm text-white/70 mt-1">
                    {conferenceDay.sessions.length} sessions planned
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
          )}
        </div>
      </section>
    </div>
  );
}
