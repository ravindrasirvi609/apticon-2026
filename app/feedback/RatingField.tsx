"use client";
import { Star } from "lucide-react";
import { RATING_SCALE } from "@/lib/event-feedback-shared";

interface Props {
  label: string;
  value: number;
  onChange: (value: number) => void;
  error?: boolean;
}

/** 1–5 star picker exposed to assistive tech as a radio group. */
export default function RatingField({ label, value, onChange, error }: Props) {
  return (
    <div
      data-invalid={error ? "true" : undefined}
      className={`scroll-mt-28 rounded-xl border p-4 ${
        error
          ? "border-red-300 bg-red-50/50"
          : "border-[var(--accent-500)]/20 bg-white"
      }`}
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm font-semibold text-[var(--dark-text)]">
          {label} <span className="text-red-500">*</span>
        </div>
        <div role="radiogroup" aria-label={label} className="flex items-center gap-1">
          {RATING_SCALE.map((s) => {
            const selected = value === s.value;
            const filled = value >= s.value;
            return (
              <button
                key={s.value}
                type="button"
                role="radio"
                aria-checked={selected}
                aria-label={`${s.value} — ${s.label}`}
                title={s.label}
                onClick={() => onChange(s.value)}
                className="rounded-md p-1 transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-400)]"
              >
                <Star
                  size={28}
                  strokeWidth={1.75}
                  className={
                    filled
                      ? "fill-[var(--accent-400)] text-[var(--accent-500)]"
                      : "text-[var(--muted-text)]/40"
                  }
                />
              </button>
            );
          })}
          <span className="ml-2 w-20 text-xs text-[var(--muted-text)]">
            {value ? RATING_SCALE[value - 1].label : "Not rated"}
          </span>
        </div>
      </div>
      {error && (
        <p role="alert" className="mt-2 text-xs font-semibold text-red-700">
          Please choose a rating.
        </p>
      )}
    </div>
  );
}
