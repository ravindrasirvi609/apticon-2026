"use client";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import type { MessageValue } from "./MessageEditor";

interface Props {
  message: MessageValue;
  /** Real recipients offered for "Preview as"; sample data is always available. */
  recipientOptions: string[];
}

/**
 * Renders the email through the same server code that sends it, inside a script-less sandboxed
 * iframe so admin-authored HTML cannot touch the console page.
 */
export default function EmailPreview({ message, recipientOptions }: Props) {
  const [previewAs, setPreviewAs] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [state, setState] = useState<
    | { kind: "idle" }
    | { kind: "loading" }
    | { kind: "error"; message: string }
    | { kind: "ready"; subject: string; html: string }
  >({ kind: "idle" });

  const { subject, headline, body, bodyFormat } = message;
  // A recipient removed from the selection must not stay selected as the preview persona.
  const effectivePreviewAs = recipientOptions.includes(previewAs) ? previewAs : "";

  const empty = !body.trim();

  useEffect(() => {
    if (empty) return;
    let cancelled = false;
    const t = setTimeout(async () => {
      // Keep showing the last good render while the next one loads.
      setState((s) => (s.kind === "ready" ? s : { kind: "loading" }));
      setRefreshing(true);
      try {
        const res = await fetch("/api/admin/emails/preview", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            subject,
            headline,
            body,
            bodyFormat,
            recipientEmail: effectivePreviewAs || undefined,
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (!res.ok) setState({ kind: "error", message: data.error ?? "Preview failed" });
        else setState({ kind: "ready", subject: data.subject, html: data.html });
      } catch {
        if (!cancelled) setState({ kind: "error", message: "Preview failed" });
      } finally {
        if (!cancelled) setRefreshing(false);
      }
    }, 500);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [empty, subject, headline, body, bodyFormat, effectivePreviewAs]);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <div className="text-xs font-medium">
          Preview{" "}
          {refreshing && (
            <Loader2 className="inline w-3 h-3 animate-spin ml-1" />
          )}
        </div>
        <label className="flex items-center gap-2 text-xs text-[var(--muted-text)]">
          Preview as
          <select
            value={effectivePreviewAs}
            onChange={(e) => setPreviewAs(e.target.value)}
            className="h-8 max-w-[16rem] rounded-md border border-[var(--accent-500)]/30 bg-white px-2 text-xs text-[var(--dark-text)]"
          >
            <option value="">Sample data</option>
            {recipientOptions.map((e) => (
              <option key={e} value={e}>
                {e}
              </option>
            ))}
          </select>
        </label>
      </div>

      {(empty || state.kind === "idle") && (
        <div className="rounded-lg border border-dashed border-[var(--accent-500)]/30 py-12 text-center text-sm text-[var(--muted-text)]">
          Write a message to see how it will look.
        </div>
      )}
      {!empty && state.kind === "error" && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-3 text-sm text-red-800">
          {state.message}
        </div>
      )}
      {!empty && state.kind === "ready" && (
        <div className="rounded-lg border border-[var(--accent-500)]/25 overflow-hidden">
          <div className="border-b border-[var(--accent-500)]/25 bg-[var(--surface-50)] px-3 py-2 text-sm">
            <span className="text-xs uppercase tracking-wider text-[var(--muted-text)] mr-2">
              Subject
            </span>
            <span className="font-semibold">{state.subject || "(empty)"}</span>
          </div>
          <iframe
            title="Email preview"
            sandbox=""
            srcDoc={state.html}
            className="w-full h-[560px] bg-white"
          />
        </div>
      )}
    </div>
  );
}
