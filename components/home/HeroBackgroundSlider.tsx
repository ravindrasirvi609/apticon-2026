"use client";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";

interface Place {
  name: string;
  icon: string;
  image: { src: string; alt: string };
}

export default function HeroBackgroundSlider({ places, index }: { places: Place[]; index: number }) {
  const place = places[index];

  return (
    <div aria-hidden className="absolute inset-0 z-0 overflow-hidden bg-[var(--secondary-900)]">
      <AnimatePresence>
        <motion.div
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.4, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          {/* Ken Burns slow zoom */}
          <motion.div
            className="absolute inset-0"
            initial={{ scale: 1 }}
            animate={{ scale: 1.1 }}
            transition={{ duration: 7.5, ease: "linear" }}
          >
            <Image
              src={place.image.src}
              alt=""
              fill
              priority={index === 0}
              sizes="100vw"
              className="object-cover"
            />
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* Scrim — deep indigo/slate for text contrast */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(15,23,42,0.82) 0%, rgba(30,27,75,0.68) 45%, rgba(15,23,42,0.90) 100%)",
        }}
      />

      {/* Bottom fade into the page below */}
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[var(--secondary-900)] to-transparent" />

      {/* Current destination caption */}
      <div className="absolute left-4 top-20 z-10 hidden sm:block md:left-6 md:top-24">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2 rounded-full border border-white/15 bg-black/30 px-3 py-1.5 backdrop-blur-md"
          >
            <span className="text-sm">{place.icon}</span>
            <span className="whitespace-nowrap text-[11px] font-semibold tracking-wide text-white/90 sm:text-xs">
              {place.name}
            </span>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
