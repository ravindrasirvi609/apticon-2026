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
      className="mx-6 inline-block w-1.5 h-1.5 rounded-full bg-[var(--accent-500)] flex-shrink-0 self-center"
    />
  );
}

export default function HighlightsBar() {
  const doubled = [...ITEMS, ...ITEMS];

  return (
    <div
      className="w-full overflow-hidden bg-[var(--primary-800)] py-3 border-y border-[var(--accent-500)]/20"
      aria-label="Conference highlights"
    >
      <div className="marquee-track">
        {doubled.map((item, i) => (
          <span key={i} className="inline-flex items-center flex-shrink-0">
            <span className="text-xs sm:text-sm font-semibold tracking-wide text-[var(--accent-300)] whitespace-nowrap">
              {item}
            </span>
            <Dot />
          </span>
        ))}
      </div>
    </div>
  );
}
