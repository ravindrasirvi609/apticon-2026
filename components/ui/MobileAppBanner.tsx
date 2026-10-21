"use client";
import { useEffect, useSyncExternalStore } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { APP_NAME, StoreBadge } from "@/components/ui/AppStoreLinks";

type Platform = "ios" | "android" | "other";

const DISMISS_KEY = "apticon:app-banner-dismissed";
const DISMISS_FOR_MS = 3 * 24 * 60 * 60 * 1000;

// ─── Platform (read once on the client, "server" during SSR so nothing renders until hydrated) ──
const subscribeNever = () => () => {};

function readPlatform(): Platform {
  const ua = navigator.userAgent;
  // iPadOS reports itself as a Mac but is a touch device.
  if (
    /iPhone|iPad|iPod/i.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  )
    return "ios";
  if (/Android/i.test(ua)) return "android";
  return "other";
}

// ─── Dismissal (localStorage when available, memory otherwise) ──────────────────────────────
let dismissedInMemory = false;
const listeners = new Set<() => void>();

function subscribeDismissed(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

function readDismissed(): boolean {
  if (dismissedInMemory) return true;
  try {
    const at = Number(localStorage.getItem(DISMISS_KEY));
    return at > Date.now() - DISMISS_FOR_MS;
  } catch {
    return false;
  }
}

function dismiss() {
  dismissedInMemory = true;
  try {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
  } catch {
    // Private mode / blocked storage: the in-memory flag still hides it for this visit.
  }
  listeners.forEach((l) => l());
}

/**
 * Phone-only "Download the APTICON Delegates App" bar. Shows the badge for the visitor's own
 * store (both on unknown devices), and can be dismissed for a few days.
 */
export default function MobileAppBanner() {
  const platform = useSyncExternalStore<Platform | "server">(
    subscribeNever,
    readPlatform,
    () => "server",
  );
  const dismissed = useSyncExternalStore(
    subscribeDismissed,
    readDismissed,
    () => true,
  );
  const visible = platform !== "server" && !dismissed;

  // Lets other floating UI (back-to-top) sit above the bar while it is showing.
  useEffect(() => {
    if (!visible) return;
    document.documentElement.dataset.appBanner = "on";
    return () => {
      delete document.documentElement.dataset.appBanner;
    };
  }, [visible]);

  const both = platform === "other";

  return (
    <AnimatePresence>
      {visible && (
        <motion.aside
          key="app-banner"
          role="complementary"
          aria-label={`Download the ${APP_NAME}`}
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1, transition: { delay: 1.2, type: "spring", damping: 26, stiffness: 260 } }}
          exit={{ y: 120, opacity: 0, transition: { duration: 0.2 } }}
          className="fixed inset-x-0 bottom-0 z-[60] border-t-2 border-[var(--accent-500)] bg-[var(--primary-900)] px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 text-white shadow-[0_-8px_24px_rgba(15,23,42,0.25)] print:hidden lg:hidden"
        >
          <div className="mx-auto flex max-w-xl items-center gap-3">
            <Image
              src="/apticon-icon.png"
              alt=""
              width={44}
              height={44}
              className="h-11 w-11 shrink-0 rounded-xl border border-white/20 object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent-400)]">
                Free app
              </p>
              <p className="text-[13px] font-bold leading-tight">
                Download the {APP_NAME}
              </p>
              {both && (
                <p className="mt-0.5 hidden text-[11px] text-white/70 sm:block">
                  Sessions, questions &amp; feedback in your pocket
                </p>
              )}
            </div>
            {!both && (
              <StoreBadge
                store={platform === "ios" ? "apple" : "play"}
                className="h-9"
              />
            )}
            <button
              type="button"
              onClick={dismiss}
              aria-label="Dismiss app download banner"
              className="-mr-1 shrink-0 self-start rounded-full p-1.5 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
            >
              <X size={16} />
            </button>
          </div>
          {both && (
            <div className="mx-auto mt-3 flex max-w-xl items-center gap-3">
              <StoreBadge store="play" className="h-10" />
              <StoreBadge store="apple" className="h-10" />
            </div>
          )}
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
