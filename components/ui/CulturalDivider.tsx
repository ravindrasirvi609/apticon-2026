interface Props {
  variant?: "bastar" | "wave" | "lotus-row";
  className?: string;
  flip?: boolean;
}

export default function CulturalDivider({ variant = "bastar", className = "", flip = false }: Props) {
  if (variant === "wave") {
    return (
      <div className={`wave-divider ${flip ? "rotate-180" : ""} ${className}`}>
        <svg viewBox="0 0 1440 80" preserveAspectRatio="none" className="w-full h-16 md:h-20">
          <path
            d="M0,40 C120,70 240,10 360,40 C480,70 600,10 720,40 C840,70 960,10 1080,40 C1200,70 1320,10 1440,40 L1440,80 L0,80 Z"
            fill="#312E81"
          />
        </svg>
      </div>
    );
  }

  if (variant === "lotus-row") {
    return (
      <div className={`flex items-center gap-4 justify-center py-4 ${className}`}>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[var(--accent-500)]" />
        <img src="/cultural/lotus.svg" alt="" aria-hidden className="w-8 h-8" />
        <img src="/cultural/lotus.svg" alt="" aria-hidden className="w-6 h-6 opacity-60" />
        <img src="/cultural/lotus.svg" alt="" aria-hidden className="w-8 h-8" />
        <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[var(--accent-500)]" />
      </div>
    );
  }

  // bastar border
  return (
    <div className={`w-full overflow-hidden ${className}`}>
      <img
        src="/cultural/bastar-border.svg"
        alt=""
        aria-hidden
        className="w-full h-6 object-cover"
        style={{ imageRendering: "crisp-edges" }}
      />
    </div>
  );
}
