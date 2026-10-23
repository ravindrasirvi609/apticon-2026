"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { AlertTriangle, CheckCircle2, Loader2, Pause, Play } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/shadcn/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/shadcn/dialog";
import type { CampaignProgress } from "./types";

export type FirstAction = "send" | "retry_failed";

interface Props {
  campaignId: string;
  subject: string;
  /** What the first request does: continue the queue, or requeue failed recipients first. */
  firstAction: FirstAction;
  onClose: () => void;
}

const MAX_NETWORK_RETRIES = 3;

/**
 * Drives a campaign: repeatedly asks the server to mail the next slice until nothing is left.
 * All state lives in the database, so closing the tab only pauses the run — History offers Resume.
 */
export default function SendProgressDialog({
  campaignId,
  subject,
  firstAction,
  onClose,
}: Props) {
  const [progress, setProgress] = useState<CampaignProgress | null>(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");
  const pauseRequested = useRef(false);
  const started = useRef(false);
  const loop = useRef<Promise<void> | null>(null);

  const call = useCallback(
    async (body: Record<string, unknown>): Promise<CampaignProgress> => {
      for (let attempt = 0; ; attempt++) {
        try {
          const res = await fetch(`/api/admin/emails/campaigns/${campaignId}/send`, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(body),
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok) throw new Error(data.error ?? `Request failed (${res.status})`);
          return data as CampaignProgress;
        } catch (e) {
          // Rows claimed by a request we never heard back from are reclaimed by the server later,
          // so a plain retry is safe.
          if (attempt >= MAX_NETWORK_RETRIES - 1) throw e;
          await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)));
        }
      }
    },
    [campaignId],
  );

  const run = useCallback(
    (first: Record<string, unknown>) => {
      pauseRequested.current = false;
      setRunning(true);
      setError("");
      const task = (async () => {
        let body = first;
        try {
          for (;;) {
            const p = await call(body);
            setProgress(p);
            body = { action: "send" };
            if (p.status !== "sending" || p.pending === 0 || p.haltReason) break;
            if (pauseRequested.current) break;
          }
        } catch (e) {
          setError(e instanceof Error ? e.message : "Sending was interrupted");
        } finally {
          setRunning(false);
        }
      })();
      loop.current = task;
      return task;
    },
    [call],
  );

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    run({ action: firstAction });
  }, [run, firstAction]);

  // Leaving mid-run only pauses it (resumable), but warn so it isn't an accident.
  useEffect(() => {
    if (!running) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [running]);

  async function cancelCampaign() {
    if (
      !window.confirm(
        "Stop this campaign? Emails already sent stay sent; the rest will not be sent.",
      )
    )
      return;
    // Let the in-flight slice land first so the cancel isn't racing a status write.
    pauseRequested.current = true;
    await loop.current;
    try {
      setProgress(await call({ action: "cancel" }));
      toast.success("Campaign cancelled");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not cancel");
    }
  }

  const done = progress ? progress.sent + progress.failed : 0;
  const total = progress?.total ?? 0;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  const finished =
    progress !== null && progress.status !== "sending" && !running;
  const halted = Boolean(progress?.haltReason);
  const paused = !running && !finished && !halted && !error && progress !== null;

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        // Block closing mid-send via overlay click / Esc; the explicit buttons handle it.
        if (!open && !running) onClose();
      }}
    >
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {finished
              ? progress?.status === "cancelled"
                ? "Campaign cancelled"
                : "Campaign finished"
              : "Sending emails"}
          </DialogTitle>
          <DialogDescription className="truncate">{subject}</DialogDescription>
        </DialogHeader>

        <div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-[var(--surface-200)]">
            <div
              className="h-full rounded-full bg-[var(--primary-800)] transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-[var(--muted-text)]">
            <span>
              {done} of {total} processed
            </span>
            <span>{pct}%</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 text-center">
          <Stat label="Sent" value={progress?.sent ?? 0} tone="text-emerald-700" />
          <Stat
            label="Remaining"
            value={(progress?.pending ?? 0) + (progress?.cancelled ?? 0)}
            tone="text-[var(--dark-text)]"
          />
          <Stat label="Failed" value={progress?.failed ?? 0} tone="text-red-700" />
        </div>

        {halted && (
          <div className="flex gap-2 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
            <div>
              <div className="font-semibold">Sending stopped</div>
              {progress?.haltReason}
            </div>
          </div>
        )}
        {error && (
          <div className="flex gap-2 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-800">
            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
            <div>
              <div className="font-semibold">Connection problem</div>
              {error}. Nothing is lost — press Resume to continue.
            </div>
          </div>
        )}
        {finished && progress?.status === "completed" && progress.failed === 0 && (
          <div className="flex items-center gap-2 text-sm font-semibold text-emerald-700">
            <CheckCircle2 className="w-4 h-4" /> All emails were handed to Resend for delivery.
          </div>
        )}
        {finished && progress && progress.failed > 0 && (
          <p className="text-sm text-[var(--muted-text)]">
            {progress.failed} could not be sent. See the History tab for the reason on each
            address, and retry them from there.
          </p>
        )}

        <div className="flex flex-wrap justify-end gap-2">
          {running && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => (pauseRequested.current = true)}
            >
              <Pause className="w-4 h-4" /> Pause
            </Button>
          )}
          {(paused || error || halted) && !finished && (
            <Button
              size="sm"
              onClick={() =>
                run({ action: "send", resume: halted || Boolean(error) })
              }
            >
              <Play className="w-4 h-4" /> Resume
            </Button>
          )}
          {!finished && progress?.status === "sending" && (
            <Button variant="ghost" size="sm" onClick={cancelCampaign}>
              Cancel campaign
            </Button>
          )}
          <Button
            variant={finished ? "default" : "outline"}
            size="sm"
            disabled={running}
            onClick={onClose}
          >
            {running ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {finished ? "Done" : "Close"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: string;
}) {
  return (
    <div className="rounded-lg bg-[var(--surface-100)] py-3">
      <div className={`text-2xl font-black ${tone}`}>{value}</div>
      <div className="text-[11px] uppercase tracking-wider text-[var(--muted-text)]">
        {label}
      </div>
    </div>
  );
}
