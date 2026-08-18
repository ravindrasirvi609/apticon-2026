"use client";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import GoldenBadge from "@/components/ui/GoldenBadge";
import CulturalDivider from "@/components/ui/CulturalDivider";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { staggerContainer, fadeUp } from "@/lib/animations";

const GALLERY_ITEMS = [
  { id: 1, src: "/last-apticon/_NZ60977.JPG", caption: "APTICON — Conference Moments", category: "Inaugural", color: "bg-[var(--primary-800)]", span: "col-span-2 row-span-2" },
  { id: 2, src: "/last-apticon/_NZ61117.JPG", caption: "APTICON — Conference Moments", category: "Academic", color: "bg-[var(--secondary-800)]", span: "" },
  { id: 3, src: "/last-apticon/_8105394.JPG", caption: "APTICON — Conference Moments", category: "Cultural", color: "bg-orange-700", span: "" },
  { id: 4, src: "/last-apticon/_NZ60369.JPG", caption: "APTICON — Conference Moments", category: "Academic", color: "bg-purple-700", span: "" },
  { id: 5, src: "/last-apticon/_NZ60143.JPG", caption: "APTICON — Conference Moments", category: "Cultural", color: "bg-orange-700", span: "col-span-2" },
  { id: 6, src: "/last-apticon/_NZ61501.JPG", caption: "APTICON — Conference Moments", category: "Awards", color: "bg-[var(--accent-500)]", span: "" },
  { id: 7, src: "/last-apticon/_NZ60230.JPG", caption: "APTICON — Conference Moments", category: "Academic", color: "bg-[var(--secondary-700)]", span: "" },
  { id: 8, src: "/last-apticon/_NZ60135.JPG", caption: "APTICON — Conference Moments", category: "Inaugural", color: "bg-[var(--primary-900)]", span: "" },
  { id: 9, src: "/last-apticon/_NZ61002.JPG", caption: "APTICON — Conference Moments", category: "Awards", color: "bg-slate-700", span: "" },
  { id: 10, src: "/last-apticon/_NZ60254.JPG", caption: "APTICON — Conference Moments", category: "Academic", color: "bg-teal-700", span: "" },
  { id: 11, src: "/last-apticon/_8105685.JPG", caption: "APTICON — Conference Moments", category: "Cultural", color: "bg-[var(--primary-800)]", span: "" },
  { id: 12, src: "/last-apticon/_8105337.JPG", caption: "APTICON — Conference Moments", category: "Raipur", color: "bg-amber-700", span: "" },
  { id: 13, src: "/last-apticon/_NZ60309.JPG", caption: "APTICON — Conference Moments", category: "Inaugural", color: "bg-[var(--primary-800)]", span: "" },
  { id: 14, src: "/last-apticon/_NZ60114.JPG", caption: "APTICON — Conference Moments", category: "Academic", color: "bg-[var(--secondary-800)]", span: "" },
  { id: 15, src: "/last-apticon/_NZ60894.JPG", caption: "APTICON — Conference Moments", category: "Cultural", color: "bg-orange-700", span: "" },
  { id: 16, src: "/last-apticon/_NZ60853.JPG", caption: "APTICON — Conference Moments", category: "Academic", color: "bg-purple-700", span: "" },
  { id: 17, src: "/last-apticon/_NZ61581.JPG", caption: "APTICON — Conference Moments", category: "Awards", color: "bg-[var(--accent-500)]", span: "" },
  { id: 18, src: "/last-apticon/_NZ61030.JPG", caption: "APTICON — Conference Moments", category: "Academic", color: "bg-[var(--secondary-700)]", span: "" },
  { id: 19, src: "/last-apticon/_NZ60163.JPG", caption: "APTICON — Conference Moments", category: "Inaugural", color: "bg-[var(--primary-900)]", span: "" },
  { id: 20, src: "/last-apticon/_NZ61479.JPG", caption: "APTICON — Conference Moments", category: "Awards", color: "bg-slate-700", span: "" },
  { id: 21, src: "/last-apticon/_NZ60175.JPG", caption: "APTICON — Conference Moments", category: "Academic", color: "bg-teal-700", span: "" },
  { id: 22, src: "/last-apticon/_NZ60213.JPG", caption: "APTICON — Conference Moments", category: "Cultural", color: "bg-[var(--primary-800)]", span: "" },
  { id: 23, src: "/last-apticon/_NZ60826.JPG", caption: "APTICON — Conference Moments", category: "Raipur", color: "bg-amber-700", span: "" },
  { id: 24, src: "/last-apticon/_NZ61044.JPG", caption: "APTICON — Conference Moments", category: "Inaugural", color: "bg-[var(--primary-800)]", span: "" },
];

const TABS = ["All", "Inaugural", "Academic", "Cultural", "Awards", "Raipur"];

export default function GalleryClient() {
  const [activeTab, setActiveTab] = useState("All");
  const [lightbox, setLightbox] = useState<number | null>(null);

  const filtered = activeTab === "All"
    ? GALLERY_ITEMS
    : GALLERY_ITEMS.filter((g) => g.category === activeTab);

  const currentLightboxItem = lightbox !== null ? GALLERY_ITEMS.find((g) => g.id === lightbox) : null;
  const currentIndex = lightbox !== null ? filtered.findIndex((g) => g.id === lightbox) : -1;

  const prev = useCallback(() => {
    if (currentIndex > 0) setLightbox(filtered[currentIndex - 1].id);
  }, [currentIndex, filtered]);

  const next = useCallback(() => {
    if (currentIndex < filtered.length - 1) setLightbox(filtered[currentIndex + 1].id);
  }, [currentIndex, filtered]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (lightbox === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(null);
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox, prev, next]);

  return (
    <div className="bg-[var(--surface-50)] min-h-screen">

      {/* Hero */}
      <section className="relative py-24 md:py-28 overflow-hidden">
        <div className="absolute inset-0 tribal-pattern-bg opacity-30" aria-hidden />
        <div className="container-site relative z-10 text-center">
          <GoldenBadge>Gallery</GoldenBadge>
          <h1 className="mt-6 font-display font-black text-4xl sm:text-5xl md:text-6xl text-[var(--dark-text)] leading-tight">
            Moments from <span className="text-gradient-primary">APTICON</span>
          </h1>
          <p className="mt-5 text-base md:text-lg text-[var(--muted-text)] max-w-xl mx-auto">
            A visual journey through the Annual National Convention — keynotes, culture, camaraderie, and celebration.
          </p>
        </div>
      </section>

      <CulturalDivider variant="bastar" className="opacity-40" />

      {/* Filter tabs */}
      <section className="sticky top-16 md:top-20 z-20 bg-[var(--surface-50)]/95 backdrop-blur-sm border-b border-[var(--accent-500)]/15 py-4">
        <div className="container-site">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-shrink-0 px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200
                  ${activeTab === tab
                    ? "bg-[var(--primary-800)] text-white shadow-md"
                    : "bg-white border border-[var(--accent-500)]/25 text-[var(--muted-text)] hover:text-[var(--primary-800)] hover:border-[var(--accent-500)]/60"
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Masonry Grid */}
      <section className="py-12 md:py-16">
        <div className="container-site">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial="hidden" animate="visible"
              variants={staggerContainer}
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 auto-rows-[200px]"
            >
              {filtered.map((item) => (
                <motion.button
                  key={item.id}
                  variants={fadeUp}
                  onClick={() => setLightbox(item.id)}
                  className={`
                    relative rounded-2xl overflow-hidden group cursor-zoom-in
                    ${item.span}
                  `}
                >
                  <img
                    src={item.src}
                    alt={item.caption}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className={`absolute inset-0 ${item.color} opacity-10 group-hover:opacity-20 transition-opacity duration-300`} />
                  {/* Caption */}
                  <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/60 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <p className="text-white text-xs font-semibold text-left leading-snug">{item.caption}</p>
                    <span className="text-[10px] text-white/70 uppercase tracking-wide">{item.category}</span>
                  </div>
                </motion.button>
              ))}
            </motion.div>
          </AnimatePresence>

          <ScrollReveal className="mt-12 rounded-2xl bg-[var(--primary-800)] p-8 text-center">
            <p className="font-display font-bold text-2xl text-white mb-2">APTICON 2026 Photos Coming Soon</p>
            <p className="text-white/70 text-sm max-w-md mx-auto">
              Official photographs from APTICON 2026 will be published here after the event. Stay tuned!
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox !== null && currentLightboxItem && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={() => setLightbox(null)}
          >
            <button onClick={() => setLightbox(null)} className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors" aria-label="Close">
              <X size={22} />
            </button>
            {currentIndex > 0 && (
              <button onClick={(e) => { e.stopPropagation(); prev(); }} className="absolute left-4 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors" aria-label="Previous">
                <ChevronLeft size={22} />
              </button>
            )}
            {currentIndex < filtered.length - 1 && (
              <button onClick={(e) => { e.stopPropagation(); next(); }} className="absolute right-4 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors" aria-label="Next">
                <ChevronRight size={22} />
              </button>
            )}
            <motion.div
              initial={{ scale: 0.85 }} animate={{ scale: 1 }} exit={{ scale: 0.85 }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-2xl w-full"
            >
              <img
                src={currentLightboxItem.src}
                alt={currentLightboxItem.caption}
                className="max-h-[75vh] w-full rounded-2xl object-contain"
              />
              <p className="text-white font-semibold text-center mt-4">{currentLightboxItem.caption}</p>
              <p className="text-white/50 text-xs text-center mt-1">{currentIndex + 1} / {filtered.length}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
