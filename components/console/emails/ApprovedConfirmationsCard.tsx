"use client";
import { useEffect, useRef, useState } from "react";
import { AlertTriangle, BadgeCheck, CheckCircle2, Loader2, Mail, Square } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/shadcn/alert-dialog";
import { Button } from "@/components/ui/shadcn/button";
import { Card, CardContent } from "@/components/ui/shadcn/card";

const ENDPOINT = "/api/admin/emails/approved-registrations";
const MAX_NETWORK_RETRIES = 3;
/** The first pass covers everyone; later passes repeat only delegates that hit transient errors. */
const MAX_PASSES = 3;

interface Stats {
  approved: number;
  sent: number;
  pending: number;
  /** Approved registrations without an email address or registration code. */
  missingDetails: number;
}

interface Problem {
  id: string;
  name: string;
  email: string;
  code: string;
  error: string;
}

interface Slice {
  handled: number;
  handledIds: string[];
  sent: number;
  /** No longer pending when reached: delivered elsewhere or no longer eligible. */
  skipped: number;
  /** Will not succeed unchanged — reported and left pending. */
  failures: Problem[];
  /** Transient — repeated in the next pass. */
  retries: Problem[];
  retryAfterMs: number;
  haltReason: string | null;
  cursor: string | null;
  done: boolean;
  pending: number | null;
}

interface RunProgress {
  total: number;
  sent: number;
  failed: number;
  skipped: number;
  /** Delegates waiting for a retry. */
  retrying: number;
  pass: number;
  /** Seconds until the next pass starts; 0 while sending. */
  waitSeconds: number;
}

/** A request the server rejected outright (auth, bad input) — retrying cannot help. */
class FinalRequestError extends Error {}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function fetchStats(): Promise<Stats> {
  const res = await fetch(ENDPOINT, { cache: "no-store" });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? "Could not load confirmation counts");
  return data as Stats;
}

function statsErrorToast(e: unknown) {
  toast.error(e instanceof Error ? e.message : "Could not load confirmation counts");
}

async function callSlice(cursor: string | null, ids: string[] | undefined): Promise<Slice> {
  for (let attempt = 1; ; attempt++) {
    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ cursor, ids }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const message = data.error ?? `Request failed (${res.status})`;
        if (res.status >= 400 && res.status < 500) throw new FinalRequestError(message);
        throw new Error(message);
      }
      return data as Slice;
    } catch (e) {
      // Delegates a lost request was still sending stay claimed and come back as retries, never
      // mailed twice, so repeating the same cursor is safe.
      if (e instanceof FinalRequestError || attempt >= MAX_NETWORK_RETRIES) throw e;
      await sleep(2000 * attempt);
    }
  }
}

/**
 * Sends the standard confirmation email, with each delegate's own QR code, to every approved
 * registration. The run is driven from this page one slice at a time until the server reports
 * nothing left; delivery is recorded per delegate, so a stopped run resumes where it left off.
 */
export default function ApprovedConfirmationsCard({ configured }: { configured: boolean }) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [running, setRunning] = useState(false);
  const [stopping, setStopping] = useState(false);
  const [progress, setProgress] = useState<RunProgress | null>(null);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [error, setError] = useState("");
  const stopRequested = useRef(false);

  useEffect(() => {
    let cancelled = false;
    fetchStats()
      .then((s) => {
        if (!cancelled) setStats(s);
      })
      .catch(statsErrorToast);
    return () => {
      cancelled = true;
    };
  }, []);

  // The run lives in this tab: warn before a reload or close interrupts it.
  useEffect(() => {
    if (!running) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [running]);

  async function startRun() {
    setConfirmOpen(false);
    stopRequested.current = false;
    setStopping(false);
    setRunning(true);
    setError("");
    setProblems([]);

    let run: RunProgress = {
      total: stats?.pending ?? 0,
      sent: 0,
      failed: 0,
      skipped: 0,
      retrying: 0,
      pass: 1,
      waitSeconds: 0,
    };
    const update = (patch: Partial<RunProgress>) => {
      run = { ...run, ...patch };
      // Registrations approved mid-run join it, so the total can grow.
      run.total = Math.max(run.total, run.sent + run.failed + run.skipped + run.retrying);
      setProgress(run);
    };
    update({});

    let failures: Problem[] = [];
    /** In a retry pass: delegates carried over from the previous pass that this pass has not reached. */
    let carried = new Map<string, Problem>();
    let leftovers: Problem[] = [];
    let haltReason = "";
    let stopped = false;
    try {
      for (let pass = 1; ; pass++) {
        const retryIds = pass === 1 ? undefined : [...carried.keys()];
        let cursor: string | null = null;
        let passRetries: Problem[] = [];
        let retryAfterMs = 0;
        update({ pass, waitSeconds: 0, retrying: carried.size });

        for (;;) {
          const slice = await callSlice(cursor, retryIds);
          failures = [...failures, ...slice.failures];
          passRetries = [...passRetries, ...slice.retries];
          retryAfterMs = Math.max(retryAfterMs, slice.retryAfterMs);
          slice.handledIds.forEach((id) => carried.delete(id));
          // The server returns every pending delegate in `_id` order, so a carried delegate it
          // passed over (at or before the cursor, or anywhere once done) is no longer pending.
          let vanished = 0;
          for (const id of [...carried.keys()]) {
            if (slice.done || (slice.cursor !== null && id <= slice.cursor)) {
              carried.delete(id);
              vanished++;
            }
          }
          update({
            sent: run.sent + slice.sent,
            failed: run.failed + slice.failures.length,
            skipped: run.skipped + slice.skipped + vanished,
            retrying: carried.size + passRetries.length,
          });
          setProblems([...failures, ...carried.values(), ...passRetries]);

          if (slice.haltReason) {
            haltReason = slice.haltReason;
            break;
          }
          if (slice.done) break;
          if (stopRequested.current) {
            stopped = true;
            break;
          }
          if (slice.handled === 0)
            throw new Error("The server made no progress. Wait a minute and press Send again.");
          cursor = slice.cursor;
        }

        if (haltReason || stopped) {
          leftovers = [...carried.values(), ...passRetries];
          break;
        }
        if (passRetries.length === 0) break;
        if (pass >= MAX_PASSES) {
          leftovers = passRetries;
          break;
        }

        // Give claims held by lost requests, or Resend's limiter, time to clear.
        for (let left = Math.ceil(retryAfterMs / 1000); left > 0; left--) {
          if (stopRequested.current) break;
          update({ waitSeconds: left });
          await sleep(1000);
        }
        if (stopRequested.current) {
          stopped = true;
          leftovers = passRetries;
          break;
        }
        carried = new Map(passRetries.map((r) => [r.id, r]));
      }

      // Anything still unresolved stays pending in the database for the next click.
      const unsent = [...failures, ...leftovers];
      update({ failed: unsent.length, retrying: 0, waitSeconds: 0 });
      setProblems(unsent);

      if (haltReason) {
        setError(haltReason);
        toast.error(`Sending stopped: ${haltReason}`);
      } else if (stopped) {
        toast.info(`Stopped after ${run.sent} email${run.sent === 1 ? "" : "s"}. Press Send to continue.`);
      } else if (run.sent === 0 && unsent.length === 0) {
        toast.success("Every approved delegate has already received the confirmation email.");
      } else if (unsent.length) {
        toast.warning(
          `Sent ${run.sent} confirmation email${run.sent === 1 ? "" : "s"}; ${unsent.length} not sent — see the list below.`,
        );
      } else {
        toast.success(`Sent ${run.sent} confirmation email${run.sent === 1 ? "" : "s"}.`);
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : "Could not send confirmation emails";
      setError(message);
      toast.error(message);
    } finally {
      setRunning(false);
      setStopping(false);
      await fetchStats().then(setStats, statsErrorToast);
    }
  }

  function requestStop() {
    stopRequested.current = true;
    setStopping(true);
  }

  const settled = progress ? progress.sent + progress.failed + progress.skipped : 0;
  const percent = progress?.total ? Math.min(100, Math.round((settled / progress.total) * 100)) : 0;
  const nothingPending = stats?.pending === 0;

  return (
    <>
      <Card className="mb-6 border-[var(--accent-500)]/25">
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 font-semibold">
              <BadgeCheck className="h-4 w-4 text-[var(--accent-500)]" /> Approved registration
              confirmations
            </div>
            <p className="mt-1 text-xs text-[var(--muted-text)]">
              Send the standard confirmation email with each person&apos;s own QR code to every
              approved registration, including those already emailed at approval. Each delegate
              receives it once; pressing Send again only reaches those still pending.
            </p>
            {stats && (
              <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-[var(--muted-text)]">
                <span>
                  <strong className="text-[var(--foreground)]">{stats.approved}</strong> approved
                </span>
                <span>
                  <strong className="text-[var(--foreground)]">{stats.sent}</strong> received
                </span>
                <span>
                  <strong className="text-[var(--foreground)]">{stats.pending}</strong> pending
                </span>
              </div>
            )}
          </div>
          <div className="flex shrink-0 gap-2">
            {running && (
              <Button variant="outline" onClick={requestStop} disabled={stopping}>
                <Square className="h-4 w-4" />
                {stopping ? "Stopping…" : "Stop"}
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => setConfirmOpen(true)}
              disabled={!configured || running || nothingPending}
            >
              {running ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : nothingPending ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <Mail className="h-4 w-4" />
              )}
              {running
                ? "Sending…"
                : nothingPending
                  ? "All sent"
                  : stats
                    ? `Send to ${stats.pending} pending`
                    : "Send to all approved"}
            </Button>
          </div>
        </CardContent>

        {stats && stats.missingDetails > 0 && (
          <CardContent className="flex gap-2 border-t px-4 py-3 text-xs text-amber-800">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            {stats.missingDetails} approved registration{stats.missingDetails === 1 ? " has" : "s have"} no
            email address or registration code and cannot be emailed.
          </CardContent>
        )}

        {progress && (
          <CardContent className="space-y-2 border-t px-4 py-3 text-xs text-[var(--muted-text)]">
            {progress.total > 0 && (
              <div className="h-2 overflow-hidden rounded-full bg-[var(--surface-100)]">
                <div
                  className="h-full rounded-full bg-[var(--accent-500)] transition-[width]"
                  style={{ width: `${percent}%` }}
                />
              </div>
            )}
            <div className="flex flex-wrap gap-x-5 gap-y-1">
              <span>
                <strong className="text-[var(--foreground)]">{progress.sent}</strong> sent
              </span>
              <span>
                <strong className={progress.failed ? "text-red-600" : "text-[var(--foreground)]"}>
                  {progress.failed}
                </strong>{" "}
                not sent
              </span>
              {progress.retrying > 0 && (
                <span>
                  <strong className="text-[var(--foreground)]">{progress.retrying}</strong> to retry
                </span>
              )}
              {progress.skipped > 0 && (
                <span>
                  <strong className="text-[var(--foreground)]">{progress.skipped}</strong> already
                  handled elsewhere
                </span>
              )}
              {progress.total > 0 && (
                <span>
                  {settled} of {progress.total} ({percent}%)
                </span>
              )}
            </div>
            {running && (
              <div className="font-medium text-amber-800">
                {progress.waitSeconds > 0
                  ? `Retrying ${progress.retrying} delegate${progress.retrying === 1 ? "" : "s"} in ${progress.waitSeconds}s (pass ${progress.pass + 1} of ${MAX_PASSES}). `
                  : progress.pass > 1
                    ? `Retry pass ${progress.pass} of ${MAX_PASSES}. `
                    : ""}
                Keep this page open until sending finishes. Closing it pauses the run.
              </div>
            )}
          </CardContent>
        )}

        {error && (
          <CardContent className="flex gap-2 border-t px-4 py-3 text-xs text-red-700">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            {error}
          </CardContent>
        )}

        {problems.length > 0 && (
          <CardContent className="border-t px-4 py-3 text-xs">
            <div className="mb-1.5 font-semibold text-red-700">
              {running
                ? `${problems.length} delegate${problems.length === 1 ? "" : "s"} not sent yet.`
                : `${problems.length} email${problems.length === 1 ? "" : "s"} not sent. They stay pending: fix the address if needed, then press Send again.`}
            </div>
            <ul className="max-h-48 space-y-1 overflow-y-auto">
              {problems.map((p) => (
                <li key={p.id} className="text-[var(--muted-text)]">
                  <span className="font-medium text-[var(--foreground)]">{p.name}</span> ·{" "}
                  <span className="font-mono">{p.code}</span> · {p.email} — {p.error}
                </li>
              ))}
            </ul>
          </CardContent>
        )}
      </Card>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Send confirmations to {stats ? `${stats.pending} approved delegate${stats.pending === 1 ? "" : "s"}` : "all approved delegates"}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Each approved delegate who has not yet received this email gets the standard
              confirmation with their own QR code — including delegates emailed when they were
              approved. Sending takes under a second per delegate; keep this page open until it
              finishes. Sent emails cannot be recalled.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={startRun}>Send now</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
