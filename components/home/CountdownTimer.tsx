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

function FlipUnit({ value, label }: { value: string; label: string }) {
  const [prev, setPrev] = useState(value);
  const [flipping, setFlipping] = useState(false);

  useEffect(() => {
    if (value !== prev) {
      setFlipping(true);
      const t = setTimeout(() => {
        setPrev(value);
        setFlipping(false);
      }, 300);
      return () => clearTimeout(t);
    }
  }, [value, prev]);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-16 h-20 sm:w-20 sm:h-24 md:w-24 md:h-28">
        {/* Card face */}
        <motion.div
          className="w-full h-full rounded-xl bg-gradient-to-b from-[var(--crimson-800)] to-[var(--crimson-900)] flex items-center justify-center shadow-xl shadow-[var(--crimson-900)]/40 border border-[var(--gold-500)]/20"
          animate={flipping ? { rotateX: [-90, 0] } : {}}
          transition={{ duration: 0.3, ease: "easeOut" }}
          style={{ transformPerspective: 400 }}
        >
          <span className="font-display font-black text-3xl sm:text-4xl md:text-5xl text-white tabular-nums leading-none">
            {flipping ? prev : value}
          </span>
          {/* Mid-line divider */}
          <div className="absolute inset-x-0 top-1/2 -translate-y-px h-px bg-black/30" />
        </motion.div>
      </div>
      <span className="text-[10px] sm:text-xs font-semibold tracking-widest uppercase text-[var(--gold-500)]">
        {label}
      </span>
    </div>
  );
}

export default function CountdownTimer() {
  const [time, setTime] = useState<TimeLeft>(getTimeLeft());

  useEffect(() => {
    const id = setInterval(() => setTime(getTimeLeft()), 1000);
    return () => clearInterval(id);
  }, []);

  const units = [
    { value: String(time.days),            label: "Days" },
    { value: pad(time.hours),   label: "Hours" },
    { value: pad(time.minutes), label: "Minutes" },
    { value: pad(time.seconds), label: "Seconds" },
  ];

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-xs font-semibold tracking-widest uppercase text-[var(--gold-500)]/80">
        Conference begins in
      </p>
      <div className="flex items-end gap-3 sm:gap-4 md:gap-5">
        {units.map((u, i) => (
          <div key={u.label} className="flex items-end gap-3 sm:gap-4 md:gap-5">
            <FlipUnit value={u.value} label={u.label} />
            {i < units.length - 1 && (
              <span className="text-2xl sm:text-3xl font-black text-[var(--gold-500)] pb-7 leading-none select-none">
                :
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
