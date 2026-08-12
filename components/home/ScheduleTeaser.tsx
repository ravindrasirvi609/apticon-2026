"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { Clock, MapPin, ArrowRight } from "lucide-react";
import { SCHEDULE_DAY1, SCHEDULE_DAY2, SESSION_COLORS } from "@/lib/constants";
import { staggerContainer, fadeUp } from "@/lib/animations";
import ScrollReveal from "@/components/ui/ScrollReveal";

const DAY_HIGHLIGHTS = [
  {
    day: "Day 1",
    date: "24 October 2026",
    color: "from-[var(--primary-800)] to-[var(--primary-900)]",
    sessions: SCHEDULE_DAY1.filter((s) => !["break", "logistics"].includes(s.type)).slice(0, 4),
  },
  {
    day: "Day 2",
    date: "25 October 2026",
    color: "from-[var(--secondary-800)] to-[var(--secondary-900)]",
    sessions: SCHEDULE_DAY2.filter((s) => !["break", "logistics"].includes(s.type)).slice(0, 4),
  },
];

export default function ScheduleTeaser() {
  return (
    <section className="py-20 md:py-24 bg-[var(--surface-100)]">
      <div className="container-site">
        <ScrollReveal className="text-center mb-12">
          <p className="text-xs font-bold tracking-widest uppercase text-[var(--accent-500)] mb-3">Conference Program</p>
          <h2 className="font-display font-black text-3xl sm:text-4xl md:text-5xl text-[var(--dark-text)]">
            Two Days of <span className="text-gradient-primary">Excellence</span>
          </h2>
          <p className="mt-4 text-[var(--muted-text)] max-w-md mx-auto text-sm sm:text-base">
            Keynotes, scientific sessions, workshops, cultural evenings — a packed agenda awaits.
          </p>
        </ScrollReveal>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {DAY_HIGHLIGHTS.map((day) => (
            <motion.div
              key={day.day}
              variants={fadeUp}
              className="overflow-hidden rounded-2xl border border-[var(--surface-200)] bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[var(--accent-500)]/30 hover:shadow-lg"
            >
              {/* Day header */}
              <div className={`bg-gradient-to-r ${day.color} p-5`}>
                <p className="text-[var(--accent-400)] text-xs font-bold tracking-widest uppercase mb-1">{day.date}</p>
                <h3 className="font-display font-black text-2xl text-white">{day.day}</h3>
              </div>

              {/* Sessions list */}
              <div className="divide-y divide-[var(--accent-500)]/10">
                {day.sessions.map((session, i) => {
                  const colorCls = SESSION_COLORS[session.type] ?? "bg-gray-100 text-gray-700";
                  return (
                    <div key={i} className="flex gap-4 items-start p-4 hover:bg-[var(--surface-50)] transition-colors duration-150">
                      <div className="flex flex-col items-center gap-1 flex-shrink-0 min-w-[56px]">
                        <Clock size={12} className="text-[var(--muted-text)]" />
                        <span className="text-[10px] font-semibold text-[var(--muted-text)] text-center leading-tight">{session.time.split("–")[0].trim()}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[var(--dark-text)] leading-snug">{session.title}</p>
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${colorCls}`}>
                            {session.type.charAt(0).toUpperCase() + session.type.slice(1)}
                          </span>
                          <span className="flex items-center gap-1 text-[10px] text-[var(--muted-text)]">
                            <MapPin size={9} /> {session.hall}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Footer CTA */}
              <div className="p-4 border-t border-[var(--accent-500)]/10 bg-[var(--surface-50)]">
                <Link
                  href="/schedule"
                  className="flex items-center gap-2 text-sm font-semibold text-[var(--primary-800)] hover:gap-3 transition-all duration-200"
                >
                  View Full {day.day} Schedule <ArrowRight size={14} />
                </Link>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom CTA */}
        <ScrollReveal className="mt-10 text-center">
          <Link
            href="/schedule"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-[var(--primary-800)] text-white font-bold text-sm hover:bg-[var(--primary-700)] transition-colors shadow-md focus:outline-none focus:ring-2 focus:ring-[var(--accent-400)] focus:ring-offset-2"
          >
            Full Program Schedule <ArrowRight size={16} />
          </Link>
        </ScrollReveal>
      </div>
    </section>
  );
}
