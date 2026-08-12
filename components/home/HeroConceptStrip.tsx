"use client";
import { motion } from "framer-motion";

export default function HeroConceptStrip() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="w-full flex items-center justify-center px-2 sm:px-4"
      aria-hidden
    >
      <div className="rounded-2xl bg-[var(--surface-50)]/95 shadow-lg px-4 py-3 sm:px-6 sm:py-4">
        <img
          src="/cultural/concept-strip.png"
          alt=""
          className="w-full max-w-[260px] sm:max-w-[400px] md:max-w-[560px] lg:max-w-[700px] xl:max-w-[820px] h-auto object-contain select-none"
          draggable={false}
        />
      </div>
    </motion.div>
  );
}
