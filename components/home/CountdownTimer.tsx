"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { EVENT } from "@/lib/constants";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function getTimeLeft(): TimeLeft {
  const diff = EVENT.targetDate.getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    days:    Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours:   Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

const UNIT_LABELS = ["Days", "Hours", "Mins", "Secs"] as const;

/* Glassmorphic unit tile */
function Unit({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative w-[3.75rem] overflow-hidden rounded-2xl border border-white/20 bg-white/10 px-1 py-2.5 backdrop-blur-md sm:w-[4.5rem] sm:py-3 md:w-20">
        {/* top sheen */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/15 to-transparent"
        />
        <motion.span
          key={value}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="relative block text-center font-display text-2xl font-black leading-none tabular-nums text-white sm:text-3xl md:text-4xl"
        >
          {value}
        </motion.span>
      </div>
      <span className="text-[9px] font-semibold uppercase tracking-[0.15em] text-white/60 sm:text-[10px]">
        {label}
      </span>
    </div>
  );
}

export default function CountdownTimer() {
  // null on server — avoids Date.now() hydration mismatch
  const [time, setTime] = useState<TimeLeft | null>(null);

  useEffect(() => {
    setTime(getTimeLeft());
    const id = setInterval(() => setTime(getTimeLeft()), 1000);
    return () => clearInterval(id);
  }, []);

  const values = time
    ? [String(time.days), pad(time.hours), pad(time.minutes), pad(time.seconds)]
    : ["--", "--", "--", "--"];

  return (
    <div
      className={`flex flex-col items-center gap-3 transition-opacity duration-500 ${
        time ? "opacity-100" : "opacity-0"
      }`}
    >
      <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--accent-300)] sm:text-xs">
        Conference begins in
      </p>
      <div className="flex items-start gap-2 sm:gap-3">
        {UNIT_LABELS.map((label, i) => (
          <Unit key={label} value={values[i]} label={label} />
        ))}
      </div>
    </div>
  );
}
