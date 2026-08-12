"use client";
import Image from "next/image";
import { motion } from "framer-motion";
import { MapPin, Plane, Train, Car } from "lucide-react";
import { staggerContainer, fadeLeft, fadeRight } from "@/lib/animations";
import GoldenBadge from "@/components/ui/GoldenBadge";
import PulseButton from "@/components/ui/PulseButton";
import { RAIPUR_PLACES, EVENT } from "@/lib/constants";

const TRANSPORT = [
  { icon: Plane, label: "By Air", detail: "Swami Vivekananda Airport (RPR) — 15 km from venue" },
  { icon: Train, label: "By Train", detail: "Raipur Junction — major hub on Mumbai–Howrah line" },
  { icon: Car,   label: "By Road", detail: "NH 30 & NH 53 — well-connected from all CG cities" },
];

export default function VenuePreview() {
  return (
    <section className="py-20 md:py-28 bg-[var(--cream-50)] overflow-hidden">
      <div className="container-site">

        {/* Header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={staggerContainer}
          className="text-center mb-14"
        >
          <motion.div variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }} className="flex justify-center">
            <GoldenBadge>Venue & Travel</GoldenBadge>
          </motion.div>
          <motion.h2
            variants={fadeLeft}
            className="mt-5 font-display font-bold text-3xl sm:text-4xl md:text-5xl text-[var(--dark-text)]"
          >
            Heart of <span className="text-gradient-crimson">Chhattisgarh</span>
          </motion.h2>
          <motion.p variants={fadeLeft} className="mt-4 text-[var(--muted-text)] max-w-2xl mx-auto text-base md:text-lg">
            Raipur — the vibrant capital city, home to ancient temples, tribal heritage, and modern academia.
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

          {/* Left — Map & Venue */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={fadeLeft}
          >
            {/* Map embed */}
            <div className="rounded-2xl overflow-hidden shadow-lg border border-[var(--gold-500)]/20 aspect-[4/3]">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3718.8!2d81.6296!3d21.2514!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a28dd5a7b4dd70d%3A0xf5b2ec7c97b86d3e!2sPt.%20Deendayal%20Upadhyaya%20Auditorium!5e0!3m2!1sen!2sin!4v1"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Venue map"
              />
            </div>

            {/* Venue card */}
            <div className="mt-4 rounded-2xl bg-white border border-[var(--gold-500)]/20 p-5 shadow-sm">
              <div className="flex gap-3 items-start">
                <div className="w-10 h-10 rounded-full bg-[var(--crimson-800)]/10 flex items-center justify-center flex-shrink-0">
                  <MapPin size={18} className="text-[var(--crimson-800)]" />
                </div>
                <div>
                  <p className="font-bold text-[var(--dark-text)]">Pt. Deendayal Upadhyay Auditorium</p>
                  <p className="text-sm text-[var(--muted-text)] mt-0.5">G.E. Road, Raipur, Chhattisgarh</p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3">
                {TRANSPORT.map(({ icon: Icon, label, detail }) => (
                  <div key={label} className="text-center p-3 rounded-xl bg-[var(--cream-100)]">
                    <Icon size={18} className="mx-auto text-[var(--crimson-800)] mb-1" />
                    <p className="text-xs font-bold text-[var(--dark-text)]">{label}</p>
                    <p className="text-[10px] text-[var(--muted-text)] mt-0.5 leading-snug hidden sm:block">{detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right — Raipur tourism */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={fadeRight}
          >
            <h3 className="font-display font-bold text-2xl text-[var(--dark-text)] mb-6">
              Explore <span className="text-gradient-gold">Raipur</span>
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {RAIPUR_PLACES.slice(0, 4).map((place, i) => (
                <motion.div
                  key={place.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="
                    group relative overflow-hidden rounded-2xl
                    border border-[var(--gold-500)]/15 bg-white shadow-sm
                    hover:-translate-y-1 hover:border-[var(--gold-500)]/50 hover:shadow-lg
                    transition-all duration-300
                  "
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-[var(--cream-100)]">
                    <Image
                      src={place.image.src}
                      alt={place.image.alt}
                      fill
                      sizes="(max-width: 640px) 50vw, 25vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" aria-hidden />
                    <span className="absolute bottom-2 left-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-base shadow-sm" aria-hidden>
                      {place.icon}
                    </span>
                  </div>
                  <div className="p-3">
                    <p className="font-semibold text-xs sm:text-sm text-[var(--dark-text)] group-hover:text-[var(--crimson-800)] transition-colors leading-snug">
                      {place.name}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-8">
              <PulseButton href="/venue" variant="crimson">
                Full Venue & Travel Guide
              </PulseButton>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
