"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronUp } from "lucide-react";

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 480);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          key="back-to-top"
          initial={{ opacity: 0, scale: 0.6, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.6, y: 16 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          onClick={scrollTop}
          aria-label="Back to top"
          className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-[var(--crimson-800)] text-white shadow-lg flex items-center justify-center hover:bg-[var(--crimson-700)] hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--gold-400)] focus:ring-offset-2 group"
        >
          {/* Pulse ring */}
          <span aria-hidden className="absolute inset-0 rounded-full border-2 border-[var(--gold-500)] opacity-0 group-hover:opacity-60 group-hover:scale-125 transition-all duration-400" />
          <ChevronUp size={20} strokeWidth={2.5} />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
