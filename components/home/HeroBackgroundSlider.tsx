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
          {/* Ken Burns slow zoom */}
          <motion.div
            className="absolute inset-0"
            initial={{ scale: 1 }}
            animate={{ scale: 1.12 }}
            transition={{ duration: 6.5, ease: "linear" }}
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

      {/* Dark scrim for text contrast */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(15,6,6,0.72) 0%, rgba(60,13,13,0.58) 45%, rgba(15,6,6,0.82) 100%)",
        }}
      />

      {/* Current destination caption — hidden on narrow phones where it would collide with the centered logo row */}
      <div className="hidden sm:block absolute top-24 left-6 z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/35 border border-white/15 backdrop-blur-sm"
          >
            <span className="text-sm">{place.icon}</span>
            <span className="text-[11px] sm:text-xs font-semibold tracking-wide text-white/90 whitespace-nowrap">
              {place.name}
            </span>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
