"use client";
import { useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Hand } from "lucide-react";

interface Props {
  dismissed: boolean;
}

const COARSE_POINTER_QUERY = "(pointer: coarse)";

function subscribeToPointerType(callback: () => void) {
  const mql = window.matchMedia(COARSE_POINTER_QUERY);
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}

function getIsTouch() {
  return window.matchMedia(COARSE_POINTER_QUERY).matches;
}

function getIsTouchServerSnapshot() {
  return false;
}

/**
 * "Grab the badge…" teaser. Copy switches for touch devices since the gesture differs.
 * Parent owns the dismissed flag — it's set permanently true on the badge's first drag.
 */
export default function InteractionHint({ dismissed }: Props) {
  const isTouch = useSyncExternalStore(subscribeToPointerType, getIsTouch, getIsTouchServerSnapshot);

  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8, transition: { duration: 0.3 } }}
          transition={{ delay: 1.4, duration: 0.5 }}
          className="mt-3 flex items-center justify-center gap-2 text-sm text-[var(--muted-text)]"
          role="status"
        >
          <motion.span
            animate={{ x: [0, 6, 0, -6, 0] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut", delay: 1.8 }}
          >
            <Hand className="w-4 h-4 text-[var(--gold-500)]" />
          </motion.span>
          <span>{isTouch ? "Touch and drag the badge" : "Grab the badge and move it around"}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
