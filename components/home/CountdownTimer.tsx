"use client";
import { useSyncExternalStore } from "react";
import { motion } from "framer-motion";
import { EVENT } from "@/lib/constants";

const TARGET_MS = EVENT.targetDate.getTime();

/**
 * The countdown reads from the system clock — an external, mutable source —
 * so it subscribes via useSyncExternalStore rather than setting state in an
 * effect. The server snapshot is `-1` ("not measured yet"), which keeps SSR
 * markup identical to the first client render and avoids a hydration mismatch.
 */
let snapshot = -1;

function measure() {
  return Math.max(0, TARGET_MS - Date.now());
}

function subscribe(onStoreChange: () => void) {
  // Seed a real value; React re-reads the snapshot right after subscribing.
  snapshot = measure();
  onStoreChange();

  const id = setInterval(() => {
    snapshot = measure();
    onStoreChange();
  }, 1000);

  return () => clearInterval(id);
}

const getSnapshot = () => snapshot;
const getServerSnapshot = () => -1;

function pad(n: number) {
  return String(n).padStart(2, "0");
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
  const remaining = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const ready = remaining >= 0;

  const values = ready
    ? [
        String(Math.floor(remaining / 86_400_000)),
        pad(Math.floor((remaining / 3_600_000) % 24)),
        pad(Math.floor((remaining / 60_000) % 60)),
        pad(Math.floor((remaining / 1000) % 60)),
      ]
    : ["--", "--", "--", "--"];

  return (
    <div
      className={`flex flex-col items-center gap-3 transition-opacity duration-500 ${
        ready ? "opacity-100" : "opacity-0"
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
