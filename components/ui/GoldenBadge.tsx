"use client";
import { motion } from "framer-motion";
import { scaleIn } from "@/lib/animations";

interface Props {
  children: React.ReactNode;
  className?: string;
}

export default function GoldenBadge({ children, className = "" }: Props) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={scaleIn}
      className={`
        inline-flex items-center gap-2 px-4 py-1.5
        rounded-full border border-[var(--accent-500)]
        bg-gradient-to-r from-[var(--accent-500)]/10 to-[var(--accent-300)]/20
        text-sm font-semibold tracking-widest uppercase
        text-[var(--accent-500)]
        ${className}
      `}
    >
      {/* shimmer bar */}
      <span className="w-4 h-px bg-gradient-to-r from-transparent via-[var(--accent-400)] to-transparent" />
      <span>{children}</span>
      <span className="w-4 h-px bg-gradient-to-r from-transparent via-[var(--accent-400)] to-transparent" />
    </motion.div>
  );
}
