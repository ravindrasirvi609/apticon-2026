import {
  DAY_DATES,
  SESSION_CATALOG,
  type CatalogSession,
} from "@/lib/mobile/session-catalog";

// Break / logistics slots have nothing to ask about or rate.
const NON_INTERACTIVE = new Set(["break", "logistics"]);

/** Questions stay open this long after a session ends (people ask right after the talk). */
export const QUESTION_GRACE_MS = 30 * 60_000;

/** Feedback can be given/edited until the end of the last conference day (IST). */
export const FEEDBACK_CLOSES_AT = new Date("2026-10-25T23:59:59+05:30");

export interface SessionWindow {
  open: boolean;
  /** Why it is closed; absent when open. */
  reason?: "not_started" | "closed";
  opensAt: string;
  closesAt: string;
}

export function getCatalogSession(id: string): CatalogSession | null {
  return SESSION_CATALOG.find((s) => s.id === id) ?? null;
}

export function isInteractive(session: CatalogSession): boolean {
  return !NON_INTERACTIVE.has(session.type);
}

function at(session: CatalogSession, hhmm: string): Date {
  return new Date(`${DAY_DATES[session.day]}T${hhmm}:00+05:30`);
}

// Lets organizers (and app-store review) exercise Q&A/feedback outside the real session times.
// Off by default; set DELEGATE_WINDOWS_OPEN=true in the environment to open every window.
function windowsForcedOpen(): boolean {
  return process.env.DELEGATE_WINDOWS_OPEN === "true";
}

function buildWindow(opensAt: Date, closesAt: Date, now: Date): SessionWindow {
  const base = {
    opensAt: opensAt.toISOString(),
    closesAt: closesAt.toISOString(),
  };
  if (windowsForcedOpen()) return { open: true, ...base };
  if (now < opensAt) return { open: false, reason: "not_started", ...base };
  if (now > closesAt) return { open: false, reason: "closed", ...base };
  return { open: true, ...base };
}

export function questionWindow(
  session: CatalogSession,
  now: Date = new Date(),
): SessionWindow {
  return buildWindow(
    at(session, session.start),
    new Date(at(session, session.end).getTime() + QUESTION_GRACE_MS),
    now,
  );
}

export function feedbackWindow(
  session: CatalogSession,
  now: Date = new Date(),
): SessionWindow {
  return buildWindow(at(session, session.start), FEEDBACK_CLOSES_AT, now);
}

export function windowClosedMessage(
  window: SessionWindow,
  what: "Questions" | "Feedback",
): string {
  return window.reason === "not_started"
    ? `${what} open once the session starts.`
    : `${what} for this session are closed.`;
}
