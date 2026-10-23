"use client";
import { useSyncExternalStore } from "react";
import { EVENT_FEEDBACK_OPENS_AT } from "@/lib/event-feedback-shared";

const opensAtMs = EVENT_FEEDBACK_OPENS_AT.getTime();
// setTimeout cannot wait longer than a signed 32-bit number of milliseconds (about 24.8 days).
const MAX_TIMEOUT_MS = 2 ** 31 - 1;

/** Re-evaluates exactly when the form goes live, so an open tab gains the menu link without a reload. */
function subscribe(onChange: () => void) {
  const wait = opensAtMs - Date.now();
  if (wait <= 0 || wait > MAX_TIMEOUT_MS) return () => {};
  const timer = setTimeout(onChange, wait + 50);
  return () => clearTimeout(timer);
}

/**
 * True once the post-event feedback form is live. False on the server and during hydration, so
 * statically generated pages never contain the link and nothing flashes in.
 */
export function useFeedbackLive(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => Date.now() >= opensAtMs,
    () => false,
  );
}
