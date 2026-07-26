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
      <img
        src="/cultural/concept-strip.png"
        alt=""
        /* mix-blend-mode:multiply makes white areas vanish against the cream background */
        className="w-full max-w-[300px] sm:max-w-[460px] md:max-w-[620px] lg:max-w-[780px] xl:max-w-[920px] h-auto object-contain select-none"
        style={{ mixBlendMode: "multiply" }}
        draggable={false}
      />
    </motion.div>
  );
}
