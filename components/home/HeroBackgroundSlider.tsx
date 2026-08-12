"use client";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";

interface Slide {
  src: string;
  alt: string;
}

export default function HeroBackgroundSlider({ slides, index }: { slides: Slide[]; index: number }) {
  return (
    <div aria-hidden className="absolute inset-0 z-0 overflow-hidden bg-[var(--crimson-900)]">
      <AnimatePresence>
        <motion.div
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <Image
            src={slides[index].src}
            alt=""
            fill
            priority={index === 0}
            sizes="100vw"
            className="object-cover"
          />
        </motion.div>
      </AnimatePresence>

      {/* Dark scrim for text contrast */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(15,6,6,0.72) 0%, rgba(60,13,13,0.58) 45%, rgba(15,6,6,0.82) 100%)",
        }}
      />
    </div>
  );
}
