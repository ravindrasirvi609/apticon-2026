"use client";
import { motion } from "framer-motion";
import Link from "next/link";

interface Props {
  href: string;
  children: React.ReactNode;
  variant?: "accent" | "primary" | "outline" | "outline-light";
  pulse?: boolean;
  className?: string;
  external?: boolean;
  download?: boolean | string;
}

const variantStyles = {
  accent:
    "bg-[var(--accent-400)] text-[var(--dark-text)] hover:bg-[var(--accent-300)] border-2 border-[var(--accent-400)]",
  primary:
    "bg-[var(--primary-800)] text-white hover:bg-[var(--primary-700)] border-2 border-[var(--primary-800)]",
  outline:
    "bg-transparent text-[var(--primary-800)] border-2 border-[var(--primary-800)] hover:bg-[var(--primary-800)] hover:text-white",
  "outline-light":
    "bg-transparent text-white border-2 border-white/80 hover:bg-white hover:text-[var(--primary-800)]",
};

export default function PulseButton({
  href,
  children,
  variant = "accent",
  pulse = false,
  className = "",
  external = false,
  download,
}: Props) {
  const classes = `
    inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full
    font-semibold text-sm md:text-base tracking-wide
    transition-all duration-300
    ${variantStyles[variant]}
    ${pulse ? "pulse-accent" : ""}
    ${className}
  `;

  if (external) {
    return (
      <motion.a
        href={href}
        target={download ? undefined : "_blank"}
        rel="noopener noreferrer"
        download={download}
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
