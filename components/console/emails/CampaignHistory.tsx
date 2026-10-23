"use client";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Eye, Loader2, Paperclip, RefreshCw, RotateCcw, Play } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/shadcn/badge";
import { Button } from "@/components/ui/shadcn/button";
import { Card, CardContent } from "@/components/ui/shadcn/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/shadcn/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/shadcn/table";
import {
  formatBytes,
  type CampaignCounts,
  type CampaignRow,
  type CampaignStatus,
} from "./types";
import type { FirstAction } from "./SendProgressDialog";

interface Props {
  /** Bumped by the parent after a send so the list reloads. */
  refreshKey: number;
  onRun: (campaign: { id: string; subject: string }, action: FirstAction) => void;
}

const STATUS_BADGE: Record<
  CampaignStatus,
  { label: string; variant: "info" | "success" | "secondary" }
> = {
  sending: { label: "In progress", variant: "info" },
  completed: { label: "Completed", variant: "success" },
  cancelled: { label: "Cancelled", variant: "secondary" },
};

interface CampaignDetail {
  id: string;
  subject: string;
  headline: string;
  body: string;
  bodyFormat: "text" | "html";
  replyTo: string;
  status: CampaignStatus;
  haltReason: string;
  attachments: { filename: string; size: number; url: string }[];
  createdByName: string;
  createdAt: string;
  counts: CampaignCounts;
  failures: { email: string; name: string; error: string; attempts: number }[];
  failuresTruncated: boolean;
}

export default function CampaignHistory({ refreshKey, onRun }: Props) {
  const [rows, setRows] = useState<CampaignRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailId, setDetailId] = useState<string | null>(null);

  const [reloadTick, setReloadTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/emails/campaigns")
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error ?? "Could not load campaigns");
        if (!cancelled) setRows(data.campaigns ?? []);
      })
      .catch((e) => {
        if (!cancelled)
          toast.error(e instanceof Error ? e.message : "Could not load campaigns");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [refreshKey, reloadTick]);

  function refresh() {
    setLoading(true);
    setReloadTick((t) => t + 1);
  }

  return (
    <>
      <div className="flex justify-end mb-3">
        <Button variant="outline" size="sm" onClick={refresh} disabled={loading}>
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Subject</TableHead>
                <TableHead>Sent</TableHead>
                <TableHead>Delivery</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && rows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center text-sm py-8 text-[var(--muted-text)]"
                  >
                    Loading…
                  </TableCell>
                </TableRow>
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center text-sm py-8 text-[var(--muted-text)]"
                  >
                    No emails have been sent yet.
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((c) => {
                  const badge = STATUS_BADGE[c.status];
                  const canResume = c.status === "sending" && c.counts.pending > 0;
                  const canRetry = c.status !== "cancelled" && c.counts.failed > 0;
                  return (
                    <TableRow key={c.id}>
                      <TableCell className="max-w-xs">
                        <div className="font-semibold text-sm truncate">
                          {c.subject}
                        </div>
                        <div className="mt-1 flex items-center gap-2">
                          <Badge variant={badge.variant}>{badge.label}</Badge>
                          {c.attachments.length > 0 && (
                            <span className="inline-flex items-center gap-1 text-xs text-[var(--muted-text)]">
                              <Paperclip className="w-3 h-3" />
                              {c.attachments.length}
                            </span>
                          )}
                        </div>
                        {c.haltReason && (
                          <div className="mt-1 text-xs text-amber-700">
                            {c.haltReason}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-xs whitespace-nowrap">
                        <div>{format(new Date(c.createdAt), "d MMM yyyy, h:mm a")}</div>
                        <div className="text-[var(--muted-text)]">
                          by {c.createdByName || "—"}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs">
                        <div className="font-semibold text-emerald-700">
                          {c.counts.sent} / {c.counts.total} sent
                        </div>
                        {c.counts.failed > 0 && (
                          <div className="text-red-700">{c.counts.failed} failed</div>
                        )}
                        {c.counts.pending > 0 && (
                          <div className="text-[var(--muted-text)]">
                            {c.counts.pending} waiting
                          </div>
                        )}
                        {c.counts.cancelled > 0 && (
                          <div className="text-[var(--muted-text)]">
                            {c.counts.cancelled} cancelled
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap justify-end gap-2">
                          {canResume && (
                            <Button
                              size="sm"
                              onClick={() => onRun(c, "send")}
                            >
                              <Play className="w-4 h-4" /> Resume
                            </Button>
                          )}
                          {canRetry && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => onRun(c, "retry_failed")}
                            >
                              <RotateCcw className="w-4 h-4" /> Retry failed
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setDetailId(c.id)}
                          >
                            <Eye className="w-4 h-4" /> Details
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {detailId && (
        <CampaignDetailDialog id={detailId} onClose={() => setDetailId(null)} />
      )}
    </>
  );
}

function CampaignDetailDialog({
  id,
  onClose,
}: {
  id: string;
  onClose: () => void;
}) {
  const [detail, setDetail] = useState<CampaignDetail | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/admin/emails/campaigns/${id}`)
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error ?? "Could not load campaign");
        if (!cancelled) setDetail(data);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Could not load campaign");
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{detail?.subject ?? "Campaign"}</DialogTitle>
          <DialogDescription>
            {detail
              ? `${format(new Date(detail.createdAt), "d MMM yyyy, h:mm a")} · by ${detail.createdByName || "—"}`
              : "Loading…"}
          </DialogDescription>
        </DialogHeader>

        {error && <p className="text-sm text-red-700">{error}</p>}
        {!detail && !error && (
          <div className="flex justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
        )}

        {detail && (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-4 gap-2 text-center">
              {(
                [
                  ["Recipients", detail.counts.total, ""],
                  ["Sent", detail.counts.sent, "text-emerald-700"],
                  ["Failed", detail.counts.failed, "text-red-700"],
                  ["Waiting", detail.counts.pending + detail.counts.cancelled, ""],
                ] as const
              ).map(([label, value, tone]) => (
                <div key={label} className="rounded-lg bg-[var(--surface-100)] py-2">
                  <div className={`text-xl font-black ${tone}`}>{value}</div>
                  <div className="text-[10px] uppercase tracking-wider text-[var(--muted-text)]">
                    {label}
                  </div>
                </div>
              ))}
            </div>

            {detail.replyTo && (
              <div>
                <span className="text-xs uppercase tracking-wider text-[var(--muted-text)]">
                  Reply-to
                </span>{" "}
                {detail.replyTo}
              </div>
            )}

            {detail.attachments.length > 0 && (
              <div>
                <div className="text-xs uppercase tracking-wider text-[var(--muted-text)] mb-1">
                  Attachments
                </div>
                <ul className="space-y-1">
                  {detail.attachments.map((a) => (
                    <li key={a.url}>
                      <a
                        href={a.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[var(--primary-800)] hover:underline"
                      >
                        {a.filename}
                      </a>{" "}
                      <span className="text-xs text-[var(--muted-text)]">
                        ({formatBytes(a.size)})
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div>
              <div className="text-xs uppercase tracking-wider text-[var(--muted-text)] mb-1">
                Message ({detail.bodyFormat === "html" ? "HTML" : "simple text"})
              </div>
              <pre className="max-h-48 overflow-auto whitespace-pre-wrap rounded-lg bg-[var(--surface-50)] border border-[var(--accent-500)]/20 p-3 font-mono text-xs">
                {detail.body}
              </pre>
            </div>

            {detail.failures.length > 0 && (
              <div>
                <div className="text-xs uppercase tracking-wider text-red-700 mb-1">
                  Failed recipients
                </div>
                <ul className="divide-y divide-[var(--surface-200)] rounded-lg border border-red-200">
                  {detail.failures.map((f) => (
                    <li key={f.email} className="px-3 py-2">
                      <div className="font-semibold">
                        {f.email}
                        {f.name ? (
                          <span className="font-normal text-[var(--muted-text)]">
                            {" "}
                            · {f.name}
                          </span>
                        ) : null}
                      </div>
                      <div className="text-xs text-red-700">{f.error || "Unknown error"}</div>
                    </li>
                  ))}
                </ul>
                {detail.failuresTruncated && (
                  <p className="mt-1 text-xs text-[var(--muted-text)]">
                    Showing the first {detail.failures.length} failures.
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
