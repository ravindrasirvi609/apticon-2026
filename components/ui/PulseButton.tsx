"use client";
import { motion } from "framer-motion";
import Link from "next/link";

interface Props {
  href: string;
  children: React.ReactNode;
  variant?: "gold" | "crimson" | "outline" | "outline-light";
  pulse?: boolean;
  className?: string;
  external?: boolean;
}

const variantStyles = {
  gold:    "bg-[var(--gold-400)] text-[var(--dark-text)] hover:bg-[var(--gold-300)] border-2 border-[var(--gold-400)]",
  crimson: "bg-[var(--crimson-800)] text-white hover:bg-[var(--crimson-700)] border-2 border-[var(--crimson-800)]",
  outline: "bg-transparent text-[var(--crimson-800)] border-2 border-[var(--crimson-800)] hover:bg-[var(--crimson-800)] hover:text-white",
  "outline-light": "bg-transparent text-white border-2 border-white/80 hover:bg-white hover:text-[var(--crimson-800)]",
};

export default function PulseButton({
  href,
  children,
  variant = "gold",
  pulse = false,
  className = "",
  external = false,
}: Props) {
  const classes = `
    inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full
    font-semibold text-sm md:text-base tracking-wide
    transition-all duration-300
    ${variantStyles[variant]}
    ${pulse ? "pulse-gold" : ""}
    ${className}
  `;

  if (external) {
    return (
      <motion.a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={classes}
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.97 }}
      >
        {children}
      </motion.a>
    );
  }

  return (
    <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}>
      <Link href={href} className={classes}>
        {children}
      </Link>
    </motion.div>
  );
}
