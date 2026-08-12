"use client";
import { motion } from "framer-motion";
import { cardHover } from "@/lib/animations";

interface Props {
  children: React.ReactNode;
  className?: string;
  glowColor?: "accent" | "primary" | "secondary";
}

const glowMap = {
  accent:    "hover:shadow-[0_8px_40px_rgba(234,88,12,0.35)]",
  primary:   "hover:shadow-[0_8px_40px_rgba(49,46,129,0.35)]",
  secondary: "hover:shadow-[0_8px_40px_rgba(30,41,59,0.35)]",
};

export default function GlowCard({ children, className = "", glowColor = "accent" }: Props) {
  return (
    <motion.div
      initial="rest"
      whileHover="hover"
      variants={cardHover}
      className={`
        rounded-2xl border border-[var(--accent-500)]/20 bg-white
        transition-shadow duration-300
        ${glowMap[glowColor]}
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
}
