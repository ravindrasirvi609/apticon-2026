interface Props {
  url?: string;
  /** Used for the alt text and the initial shown when no photo exists. */
  name: string;
  /** Rendered diameter in pixels. */
  size?: number;
  className?: string;
}

/**
 * Circular delegate avatar. Falls back to the delegate's initial in the same primary gradient
 * used for the console account chip, so photo-less legacy rows still look deliberate.
 */
export default function DelegatePhoto({
  url,
  name,
  size = 40,
  className = "",
}: Props) {
  const box = { width: size, height: size };
  const base = `shrink-0 overflow-hidden rounded-full border border-[var(--accent-500)]/30 ${className}`;

  if (!url) {
    return (
      <div
        style={box}
        className={`${base} flex items-center justify-center bg-gradient-to-br from-[var(--primary-800)] to-[var(--primary-900)] font-bold text-white`}
        title={`${name} — no photo uploaded`}
        aria-label={`${name}, no photo uploaded`}
      >
        <span style={{ fontSize: Math.max(11, Math.round(size * 0.4)) }}>
          {name.trim().charAt(0).toUpperCase() || "?"}
        </span>
      </div>
    );
  }

  return (
    <div style={box} className={`${base} bg-[var(--surface-100)]`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt={`${name}'s profile photo`}
        className="h-full w-full object-cover"
        loading="lazy"
      />
    </div>
  );
}
