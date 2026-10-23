"use client";
import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { Award, Eye, Search, Star } from "lucide-react";
import { toast } from "sonner";
import PageHeader from "@/components/console/PageHeader";
import ExportButtons from "@/components/console/ExportButtons";
import { Badge } from "@/components/ui/shadcn/badge";
import { Button } from "@/components/ui/shadcn/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/shadcn/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/shadcn/dialog";
import { Input } from "@/components/ui/shadcn/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/shadcn/table";
import {
  RATING_QUESTIONS,
  RECOMMEND_OPTIONS,
  type EventFeedbackRatings,
  type RecommendValue,
} from "@/lib/event-feedback-shared";

interface FeedbackItem {
  id: string;
  registrationCode: string;
  name: string;
  email: string;
  institution: string;
  ratings: EventFeedbackRatings;
  wouldRecommend: RecommendValue;
  mostValuable: string;
  suggestions: string;
  certificateDownloads: number;
  lastCertificateAt: string | null;
  createdAt: string;
}

interface Summary {
  submissions: number;
  confirmedDelegates: number;
  averages: Record<string, number | null>;
  recommend: Record<RecommendValue, number>;
  certificateDownloads: number;
  certificateHolders: number;
}

const RECOMMEND_BADGE: Record<RecommendValue, "success" | "warning" | "danger"> = {
  yes: "success",
  maybe: "warning",
  no: "danger",
};

export default function EventFeedbackClient() {
  const [items, setItems] = useState<FeedbackItem[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [viewing, setViewing] = useState<FeedbackItem | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/event-feedback")
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error ?? "Could not load feedback");
        if (!cancelled) {
          setItems(data.items ?? []);
          setSummary(data.summary ?? null);
        }
      })
      .catch((e) => {
        if (!cancelled) toast.error(e instanceof Error ? e.message : "Could not load feedback");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return items;
    return items.filter(
      (f) =>
        f.name.toLowerCase().includes(needle) ||
        f.email.includes(needle) ||
        f.registrationCode.toLowerCase().includes(needle) ||
        f.institution.toLowerCase().includes(needle),
    );
  }, [items, q]);

  const responseRate =
    summary && summary.confirmedDelegates > 0
      ? Math.round((summary.submissions / summary.confirmedDelegates) * 100)
      : 0;

  return (
    <div className="p-4 md:p-8">
      <PageHeader
        title="Event Feedback"
        description="End-of-convention feedback. Submitting it unlocks each delegate's participation certificate."
        actions={
          <ExportButtons
            endpoint="/api/admin/event-feedback/export"
            query=""
            label="Event feedback"
          />
        }
      />

      {summary && (
        <>
          <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Metric label="Feedback received" value={summary.submissions} />
            <Metric
              label="Response rate"
              value={`${responseRate}%`}
              hint={`of ${summary.confirmedDelegates} confirmed delegates`}
            />
            <Metric
              label="Certificates downloaded"
              value={summary.certificateDownloads}
              hint={`${summary.certificateHolders} delegates`}
            />
            <Metric
              label="Would attend again"
              value={
                summary.submissions
                  ? `${Math.round((summary.recommend.yes / summary.submissions) * 100)}%`
                  : "—"
              }
              hint={`${summary.recommend.maybe} maybe · ${summary.recommend.no} no`}
            />
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Average ratings (out of 5)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {RATING_QUESTIONS.map((question) => {
                const avg = summary.averages[question.key];
                return (
                  <div key={question.key} className="flex items-center gap-3 text-sm">
                    <div className="w-56 shrink-0 truncate sm:w-72">{question.label}</div>
                    <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-[var(--surface-200)]">
                      <div
                        className="h-full rounded-full bg-[var(--accent-500)]"
                        style={{ width: `${avg ? (avg / 5) * 100 : 0}%` }}
                      />
                    </div>
                    <div className="w-10 text-right font-bold tabular-nums">
                      {avg ?? "—"}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </>
      )}

      <Card className="mb-4">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-text)]" />
            <Input
              placeholder="Search name, email, code, institution…"
              className="pl-9"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Delegate</TableHead>
                <TableHead>Overall</TableHead>
                <TableHead>Attend again?</TableHead>
                <TableHead>Certificate</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead className="text-right">View</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-sm text-[var(--muted-text)]">
                    Loading…
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-sm text-[var(--muted-text)]">
                    {items.length === 0
                      ? "No feedback has been submitted yet."
                      : "No feedback matches your search."}
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((f) => (
                  <TableRow key={f.id}>
                    <TableCell>
                      <div className="text-sm font-semibold">{f.name}</div>
                      <div className="text-xs text-[var(--muted-text)]">
                        {f.registrationCode} · {f.email}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1 text-sm font-semibold">
                        <Star className="h-3.5 w-3.5 fill-[var(--accent-400)] text-[var(--accent-500)]" />
                        {f.ratings.overall}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={RECOMMEND_BADGE[f.wouldRecommend]}>
                        {RECOMMEND_OPTIONS.find((o) => o.value === f.wouldRecommend)?.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs">
                      {f.certificateDownloads > 0 ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700">
                          <Award className="h-3.5 w-3.5" />
                          {f.certificateDownloads} download{f.certificateDownloads > 1 ? "s" : ""}
                        </span>
                      ) : (
                        <span className="text-[var(--muted-text)]">Not downloaded</span>
                      )}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-xs text-[var(--muted-text)]">
                      {format(new Date(f.createdAt), "d MMM, h:mm a")}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="ghost" onClick={() => setViewing(f)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {viewing && (
        <Dialog open onOpenChange={(open) => !open && setViewing(null)}>
          <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{viewing.name}</DialogTitle>
              <DialogDescription>
                {viewing.registrationCode} · {viewing.email}
                {viewing.institution ? ` · ${viewing.institution}` : ""}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 text-sm">
              <ul className="space-y-1.5">
                {RATING_QUESTIONS.map((question) => (
                  <li key={question.key} className="flex items-center justify-between gap-3">
                    <span>{question.label}</span>
                    <span className="font-bold tabular-nums">{viewing.ratings[question.key]} / 5</span>
                  </li>
                ))}
              </ul>
              <TextBlock title="Most valuable" text={viewing.mostValuable} />
              <TextBlock title="Suggestions" text={viewing.suggestions} />
              <div className="text-xs text-[var(--muted-text)]">
                Submitted {format(new Date(viewing.createdAt), "d MMM yyyy, h:mm a")}
                {viewing.lastCertificateAt &&
                  ` · last certificate download ${format(new Date(viewing.lastCertificateAt), "d MMM, h:mm a")}`}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function Metric({
  label,
  value,
  hint,
}: {
  label: string;
  value: number | string;
  hint?: string;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-text)]">
          {label}
        </div>
        <div className="mt-1 font-display text-3xl font-black text-[var(--primary-800)]">
          {value}
        </div>
        {hint && <div className="mt-0.5 text-xs text-[var(--muted-text)]">{hint}</div>}
      </CardContent>
    </Card>
  );
}

function TextBlock({ title, text }: { title: string; text: string }) {
  return (
    <div>
      <div className="mb-1 text-xs uppercase tracking-wider text-[var(--muted-text)]">{title}</div>
      <p className="whitespace-pre-line rounded-lg border border-[var(--accent-500)]/20 bg-[var(--surface-50)] p-3">
        {text || <span className="text-[var(--muted-text)]">—</span>}
      </p>
    </div>
  );
}
