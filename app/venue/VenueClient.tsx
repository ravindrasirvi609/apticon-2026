"use client";
import Image from "next/image";
import { motion } from "framer-motion";
import { MapPin, Plane, Train, Car, Clock } from "lucide-react";
import GoldenBadge from "@/components/ui/GoldenBadge";
import CulturalDivider from "@/components/ui/CulturalDivider";
import ScrollReveal from "@/components/ui/ScrollReveal";
import {
  EVENT,
  PLACES_CHHATTISGARH,
  PLACES_RAIPUR,
  type TravelPlace,
} from "@/lib/constants";
import {
  staggerContainer,
  fadeUp,
  fadeLeft,
  fadeRight,
} from "@/lib/animations";

const TRANSPORT = [
  {
    icon: Plane,
    label: "By Air",
    title: "Swami Vivekananda Airport, Raipur (RPR)",
    details: [
      "Distance to venue ~15 km",
      "Travel time ~30–40 minutes",
      "Taxis, app-based cabs and airport transfer services are available",
    ],
  },
  {
    icon: Train,
    label: "By Rail",
    title: "Raipur Junction Railway Station",
    details: [
      "Distance to venue ~6 km",
      "Travel time ~15–20 minutes",
      "Auto-rickshaws, taxis and app-based cabs are easily available outside the station",
    ],
  },
  {
    icon: Car,
    label: "By Road",
    title: "Well Connected by Highways",
    details: [
      "Connected with Nagpur, Bhopal, Bilaspur, Ranchi and Sambalpur",
      "Well-maintained national highways ensure a smooth and comfortable journey",
      "Major hotel zone at Civil Lines, close to the venue",
    ],
  },
];

const CUISINE = [
  {
    name: "Chila",
    desc: "Rice flour pancakes — a Chhattisgarhi breakfast staple",
    icon: "🥞",
  },
  {
    name: "Bafauri",
    desc: "Steamed dal dumplings, light and nutritious",
    icon: "🍥",
  },
  {
    name: "Aamat",
    desc: "Spicy vegetable curry with Bastar forest ingredients",
    icon: "🍲",
  },
  {
    name: "Muthia",
    desc: "Spiced dumplings in tangy mustard gravy",
    icon: "🥣",
  },
  { name: "Fara", desc: "Steamed rice rolls with spicy stuffing", icon: "🌯" },
  {
    name: "Kusli",
    desc: "Deep-fried sweet snack, perfect for celebrations",
    icon: "🍩",
  },
];

const HOTELS = [
  {
    name: "Hotel Babylon International",
    stars: 4,
    distance: "1.2 km",
    area: "GE Road",
  },
  { name: "Hotel Piccadily", stars: 4, distance: "2.0 km", area: "Fafadih" },
  { name: "Hotel Nanking", stars: 3, distance: "0.8 km", area: "GE Road" },
  {
    name: "Hotel Celebration",
    stars: 3,
    distance: "1.5 km",
    area: "Shankar Nagar",
  },
  {
    name: "OYO / Budget Guesthouses",
    stars: 2,
    distance: "0.5–2 km",
    area: "Near Venue",
  },
];

function PlaceGrid({ places }: { places: TravelPlace[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {places.map((place, i) => (
        <ScrollReveal key={place.name} delay={(i % 4) * 0.08}>
          <article className="group h-full overflow-hidden rounded-2xl border border-[var(--accent-500)]/15 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[var(--accent-500)]/50 hover:shadow-lg">
            <div className="relative aspect-[16/10] overflow-hidden bg-[var(--surface-100)]">
              <Image
                src={place.image}
                alt={place.name}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <div className="p-5">
              <h4 className="font-display font-bold text-lg text-[var(--dark-text)] transition-colors group-hover:text-[var(--primary-800)]">
                {place.name}
              </h4>
              <p className="mt-2 text-sm leading-relaxed text-[var(--muted-text)]">
                {place.description}
              </p>
              {place.distance && (
                <div className="mt-3 flex items-center gap-4 text-xs font-semibold text-[var(--primary-800)]">
                  <span className="flex items-center gap-1">
                    <Car size={13} /> {place.distance}
                  </span>
                  {place.time && (
                    <span className="flex items-center gap-1">
                      <Clock size={13} /> {place.time}
                    </span>
                  )}
                </div>
              )}
            </div>
          </article>
        </ScrollReveal>
      ))}
    </div>
  );
}

export default function VenueClient() {
  return (
    <div className="bg-[var(--surface-50)] min-h-screen">
      {/* Hero */}
      <section className="relative py-24 md:py-28 overflow-hidden">
        <div
          className="absolute inset-0 tribal-pattern-bg opacity-30"
          aria-hidden
        />
        <div
          className="absolute right-0 bottom-0 w-80 h-80 opacity-20 pointer-events-none"
          aria-hidden
        >
          <img src="/cultural/gondi-sun.svg" alt="" className="w-full h-full" />
        </div>
        <div className="container-site relative z-10 text-center">
          <GoldenBadge>Venue & Travel</GoldenBadge>
          <h1 className="mt-6 font-display font-black text-4xl sm:text-5xl md:text-6xl text-[var(--dark-text)] leading-tight">
            Raipur —{" "}
            <span className="text-gradient-primary">City of Temples</span>
          </h1>
          <p className="mt-5 text-base md:text-lg text-[var(--muted-text)] max-w-2xl mx-auto leading-relaxed">
            The cultural and educational capital of Chhattisgarh, Raipur blends
            ancient tribal heritage with modern infrastructure and warm
            hospitality.
          </p>
        </div>
      </section>

      <CulturalDivider variant="bastar" className="opacity-40" />

      {/* Venue + Map */}
      <section className="py-16 md:py-20">
        <div className="container-site">
          <ScrollReveal className="text-center mb-12">
            <GoldenBadge>Conference Venue</GoldenBadge>
            <h2 className="mt-5 font-display font-bold text-3xl sm:text-4xl text-[var(--dark-text)]">
              Pt. Deendayal Upadhyay Auditorium
            </h2>
            <p className="mt-3 text-[var(--muted-text)]">
              {EVENT.venueAddress}
            </p>
          </ScrollReveal>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3">
              <div className="rounded-2xl overflow-hidden shadow-lg border border-[var(--accent-500)]/20 aspect-[4/3]">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3718.8!2d81.6296!3d21.2514!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a28dd5a7b4dd70d%3A0xf5b2ec7c97b86d3e!2sPt.%20Deendayal%20Upadhyaya%20Auditorium!5e0!3m2!1sen!2sin!4v1"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Venue map — Pt. Deendayal Upadhyay Auditorium"
                />
              </div>
            </div>
            <div className="lg:col-span-2 space-y-4">
              <div className="rounded-2xl bg-white border border-[var(--accent-500)]/20 p-5 shadow-sm">
                <div className="flex gap-3 items-start mb-4">
                  <div className="w-10 h-10 rounded-full bg-[var(--primary-800)]/10 flex items-center justify-center flex-shrink-0">
                    <MapPin size={18} className="text-[var(--primary-800)]" />
                  </div>
                  <div>
                    <p className="font-bold text-[var(--dark-text)]">
                      Pt. Deendayal Upadhyay Auditorium
                    </p>
                    <p className="text-sm text-[var(--muted-text)] mt-0.5">
                      {EVENT.venueAddress}
                    </p>
                  </div>
                </div>
                <ul className="space-y-2 text-sm text-[var(--muted-text)]">
                  {[
                    "Large auditorium seating 1000+",
                    "Multiple breakout halls",
                    "Central air-conditioning",
                    "Ample parking facility",
                    "Accessible for differently-abled",
                  ].map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-500)] flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
              {/* Nearby Hotels */}
              <div className="rounded-2xl bg-white border border-[var(--accent-500)]/20 p-5 shadow-sm">
                <p className="text-xs font-bold tracking-widest uppercase text-[var(--accent-500)] mb-4">
                  Nearby Hotels
                </p>
                <div className="space-y-3">
                  {HOTELS.map((h) => (
                    <div
                      key={h.name}
                      className="flex justify-between items-start gap-2"
                    >
                      <div>
                        <p className="text-sm font-medium text-[var(--dark-text)] leading-snug">
                          {h.name}
                        </p>
                        <p className="text-xs text-[var(--muted-text)]">
                          {h.area}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs text-[var(--primary-800)] font-semibold">
                          {h.distance}
                        </p>
                        <p className="text-[10px] text-[var(--muted-text)]">
                          {"★".repeat(h.stars)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How to Reach */}
      <section className="py-16 bg-[var(--surface-100)]">
        <div className="container-site">
          <ScrollReveal className="text-center mb-12">
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-[var(--dark-text)]">
              How to <span className="text-gradient-accent">Reach the Venue</span>
            </h2>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TRANSPORT.map((t, i) => (
              <ScrollReveal key={t.label} delay={i * 0.1}>
                <div className="rounded-2xl bg-white border border-[var(--accent-500)]/20 p-6 shadow-sm h-full">
                  <div className="w-12 h-12 rounded-full bg-[var(--primary-800)] flex items-center justify-center mb-4">
                    <t.icon size={22} className="text-white" />
                  </div>
                  <p className="text-xs font-bold tracking-widest uppercase text-[var(--accent-500)] mb-1">
                    {t.label}
                  </p>
                  <h3 className="font-semibold text-[var(--dark-text)] mb-3">
                    {t.title}
                  </h3>
                  <ul className="space-y-1.5">
                    {t.details.map((d) => (
                      <li
                        key={d}
                        className="flex items-start gap-2 text-sm text-[var(--muted-text)]"
                      >
                        <span className="w-1 h-1 rounded-full bg-[var(--primary-800)]/50 mt-1.5 flex-shrink-0" />
                        {d}
                      </li>
                    ))}
                  </ul>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Explore Raipur */}
      <section className="py-16 md:py-20">
        <div className="container-site">
          <ScrollReveal className="text-center mb-12">
            <GoldenBadge>Tourism</GoldenBadge>
            <h2 className="mt-5 font-display font-bold text-3xl sm:text-4xl text-[var(--dark-text)]">
              Explore{" "}
              <span className="text-gradient-primary">
                Raipur & Chhattisgarh
              </span>
            </h2>
            <p className="mt-3 text-sm text-[var(--muted-text)]">
              Make the most of your conference visit with a memorable local
              detour.
            </p>
          </ScrollReveal>
          <h3 className="font-display font-bold text-2xl text-[var(--primary-800)] mb-5">
            Places to Visit in Chhattisgarh
          </h3>
          <PlaceGrid places={PLACES_CHHATTISGARH} />
          <h3 className="mt-14 font-display font-bold text-2xl text-[var(--primary-800)] mb-5">
            In &amp; Around Raipur
          </h3>
          <PlaceGrid places={PLACES_RAIPUR} />
        </div>
      </section>

      {/* Local Cuisine */}
      <section className="py-16 bg-[var(--primary-800)] relative overflow-hidden">
        <div
          className="absolute inset-0 tribal-pattern-bg opacity-5"
          aria-hidden
        />
        <div className="container-site relative z-10">
          <ScrollReveal className="text-center mb-12">
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-white">
              Taste of <span className="shimmer-accent">Chhattisgarh</span>
            </h2>
            <p className="mt-3 text-white/70">
              Savour authentic local cuisine during your stay
            </p>
          </ScrollReveal>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {CUISINE.map((c, i) => (
              <ScrollReveal key={c.name} delay={i * 0.07}>
                <div className="rounded-2xl bg-white/8 border border-white/10 p-4 text-center hover:bg-white/15 transition-colors duration-300">
                  <span className="text-3xl mb-3 block">{c.icon}</span>
                  <p className="font-bold text-sm text-[var(--accent-400)]">
                    {c.name}
                  </p>
                  <p className="text-xs text-white/60 mt-1 leading-snug">
                    {c.desc}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
