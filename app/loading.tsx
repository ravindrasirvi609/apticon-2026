export default function Loading() {
  return (
    <div className="min-h-[50dvh] flex flex-col items-center justify-center gap-4" aria-label="Loading">
      {/* Pulsing lotus */}
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-[var(--gold-500)]/30 animate-[spin_3s_linear_infinite]" />
        <div className="absolute inset-2 rounded-full border-4 border-t-[var(--crimson-800)] border-transparent animate-[spin_1.5s_linear_infinite]" />
        <div className="absolute inset-4 rounded-full bg-[var(--gold-500)]/20 animate-pulse" />
      </div>
      <p className="text-sm font-semibold tracking-widest uppercase text-[var(--muted-text)] animate-pulse">
        Loading…
      </p>
    </div>
  );
}
