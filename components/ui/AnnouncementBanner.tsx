"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles } from "lucide-react";
import Link from "next/link";

const STORAGE_KEY = "apticon2026-banner-dismissed";

export default function AnnouncementBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissed = sessionStorage.getItem(STORAGE_KEY);
    if (!dismissed) setVisible(true);
  }, []);

  const dismiss = () => {
    sessionStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden"
        >
          <div className="bg-gradient-to-r from-[var(--gold-500)] via-[var(--gold-400)] to-[var(--gold-500)] text-[var(--dark-text)] py-2 px-4 relative">
            <div className="flex items-center justify-center gap-3 flex-wrap pr-8">
              <Sparkles size={14} className="flex-shrink-0 text-[var(--crimson-800)]" aria-hidden />
              <p className="text-xs sm:text-sm font-semibold text-center">
                <span className="font-black text-[var(--crimson-800)]">APTICON 2026</span>
                {" "}— 24 & 25 Oct, Raipur ✦ Registration &amp; Abstract submission opening soon!{" "}
                <Link
                  href="/registration"
                  className="underline underline-offset-2 hover:text-[var(--crimson-800)] transition-colors font-bold ml-1"
                  onClick={dismiss}
                >
                  Learn More →
                </Link>
              </p>
            </div>
            <button
              onClick={dismiss}
              aria-label="Dismiss announcement"
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-black/10 transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--crimson-800)]"
            >
              <X size={14} strokeWidth={2.5} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
