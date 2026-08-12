"use client";
import { motion } from "framer-motion";

/**
 * Slim full-width band showing the convention concept graphic from the flyer.
 * Sits directly under the hero so the hero itself stays uncluttered.
 */
export default function HeroConceptStrip() {
  return (
    <section className="relative overflow-hidden bg-[var(--secondary-900)] py-5 sm:py-6">
      {/* soft accent glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-40 w-[36rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--accent-500)]/10 blur-3xl"
      />
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="container-site relative flex justify-center"
        aria-hidden
      >
        <div className="rounded-2xl border border-white/15 bg-white/95 px-4 py-2.5 shadow-2xl shadow-black/30 sm:px-6 sm:py-3">
          <img
            src="/cultural/concept-strip.png"
            alt=""
            className="h-auto w-full max-w-[17rem] select-none object-contain sm:max-w-md md:max-w-xl lg:max-w-2xl"
            draggable={false}
          />
        </div>
      </motion.div>
    </section>
  );
}
