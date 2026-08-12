const ITEMS = [
  "28th Annual National Convention",
  "1500+ Delegates Expected",
  "24–25 October 2026",
  "Raipur, Chhattisgarh",
  "Registration Opens Soon",
  "Pt. Deendayal Upadhyay Auditorium",
  "Viksit Bharat 2047",
  "APTI Chhattisgarh State Branch",
];

function Dot() {
  return (
    <span
      aria-hidden
      className="mx-5 h-1 w-1 shrink-0 self-center rounded-full bg-[var(--accent-400)] sm:mx-7"
    />
  );
}

export default function HighlightsBar() {
  const doubled = [...ITEMS, ...ITEMS];

  return (
    <div
      className="relative w-full overflow-hidden bg-gradient-to-r from-[var(--primary-900)] via-[var(--primary-800)] to-[var(--primary-900)] py-3"
      aria-label="Conference highlights"
    >
      {/* hairline accents */}
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--accent-500)]/50 to-transparent"
      />
      <span
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[var(--accent-500)]/50 to-transparent"
      />

      {/* edge fades so text melts in/out instead of clipping */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-[var(--primary-900)] to-transparent sm:w-20"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-[var(--primary-900)] to-transparent sm:w-20"
      />

      <div className="marquee-track">
        {doubled.map((item, i) => (
          <span key={i} className="inline-flex shrink-0 items-center">
            <span className="whitespace-nowrap text-[11px] font-semibold tracking-wide text-white/85 sm:text-sm">
              {item}
            </span>
            <Dot />
          </span>
        ))}
      </div>
    </div>
  );
}
