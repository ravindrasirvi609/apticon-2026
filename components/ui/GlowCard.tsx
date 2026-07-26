"use client";
import { motion } from "framer-motion";
import { cardHover } from "@/lib/animations";

interface Props {
  children: React.ReactNode;
  className?: string;
  glowColor?: "gold" | "crimson" | "navy";
}

const glowMap = {
  gold:    "hover:shadow-[0_8px_40px_rgba(212,175,55,0.35)]",
  crimson: "hover:shadow-[0_8px_40px_rgba(139,26,26,0.35)]",
  navy:    "hover:shadow-[0_8px_40px_rgba(26,35,126,0.35)]",
};

export default function GlowCard({ children, className = "", glowColor = "gold" }: Props) {
  return (
    <motion.div
      initial="rest"
      whileHover="hover"
      variants={cardHover}
      className={`
        rounded-2xl border border-[var(--gold-500)]/20 bg-white
        transition-shadow duration-300
        ${glowMap[glowColor]}
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
}
