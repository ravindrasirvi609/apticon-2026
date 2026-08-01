"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Search, Download, Loader2 } from "lucide-react";
import { format } from "date-fns";
import PageHeader from "@/components/console/PageHeader";
import StatusBadge from "@/components/console/StatusBadge";
import { Card, CardContent } from "@/components/ui/shadcn/card";
import { Input } from "@/components/ui/shadcn/input";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/shadcn/table";
import { Button } from "@/components/ui/shadcn/button";
import { toast } from "sonner";

interface AbstractItem {
  _id: string;
  submissionCode: string;
  title: string;
  presentingAuthor: string;
  email: string;
  theme: string;
  type: string;
  status: string;
  createdAt: string;
  assignedReviewers: string[];
}

const STATUSES = ["", "submitted", "under_review", "accepted", "rejected", "revision_requested"] as const;

interface Props {
  detailBase: string; // e.g. "/admin/abstracts" or "/editorial/abstracts"
  title?: string;
  description?: string;
}

export default function AbstractsList({
  detailBase,
  title = "Abstracts",
  description = "All submissions across the review pipeline.",
}: Props) {
  const [items, setItems] = useState<AbstractItem[]>([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  async function downloadWord() {
    if (downloading) return;
    setDownloading(true);
    try {
      const res = await fetch("/api/abstracts/export-word");
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Download failed" }));
        toast.error(err.error || "Failed to generate Word file");
        return;
      }
      const blob = await res.blob();
      // Pull filename from Content-Disposition if present
      const cd = res.headers.get("Content-Disposition") || "";
      const match = /filename="?([^"]+)"?/i.exec(cd);
      const filename = match?.[1] || `APTICON-2026-Abstracts-${new Date().toISOString().slice(0, 10)}.docx`;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success("Abstract book downloaded");
    } catch (e) {
      toast.error("Failed to download Word file");
      console.error(e);
    } finally {
      setDownloading(false);
    }
  }

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (q) params.set("q", q);
    fetch(`/api/abstracts?${params.toString()}`)
      .then((r) => r.json())
      .then((d) => setItems(d.items ?? []))
      .finally(() => setLoading(false));
  }, [q, status]);

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    items.forEach((i) => (c[i.status] = (c[i.status] ?? 0) + 1));
    return c;
  }, [items]);

  return (
    <div className="p-4 md:p-8">
      <PageHeader
        title={title}
        description={description}
        actions={
          <Button
            onClick={downloadWord}
            disabled={downloading || items.length === 0}
            className="bg-[var(--crimson-800)] hover:bg-[var(--crimson-900)] text-white"
          >
            {downloading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Preparing…
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Download Word
              </>
            )}
          </Button>
        }
      />

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-text)]" />
              <Input placeholder="Search title, code, email, author…" className="pl-9" value={q} onChange={(e) => setQ(e.target.value)} />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {STATUSES.map((s) => (
                <Button
                  key={s || "all"}
                  variant={status === s ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatus(s)}
                >
                  {s ? s.replace("_", " ") : "All"}
                  {counts[s] !== undefined && s !== "" && (
                    <span className="ml-1 text-xs opacity-70">({counts[s]})</span>
                  )}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Theme</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Reviewers</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={8} className="text-center text-sm py-8 text-[var(--muted-text)]">Loading…</TableCell></TableRow>
              ) : items.length === 0 ? (
                <TableRow><TableCell colSpan={8} className="text-center text-sm py-8 text-[var(--muted-text)]">No abstracts match your filters.</TableCell></TableRow>
              ) : (
                items.map((a) => (
                  <TableRow key={a._id}>
                    <TableCell className="font-mono text-xs">{a.submissionCode}</TableCell>
                    <TableCell>
                      <Link href={`${detailBase}/${a._id}`} className="text-[var(--crimson-800)] hover:underline">
                        {a.title.length > 60 ? a.title.slice(0, 60) + "…" : a.title}
                      </Link>
                    </TableCell>
                    <TableCell className="text-xs">{a.presentingAuthor}</TableCell>
                    <TableCell className="text-xs">{a.theme}</TableCell>
                    <TableCell className="text-xs capitalize">{a.type}</TableCell>
                    <TableCell className="text-xs">{a.assignedReviewers.length}</TableCell>
                    <TableCell><StatusBadge status={a.status} /></TableCell>
                    <TableCell className="text-xs text-[var(--muted-text)]">{format(new Date(a.createdAt), "d MMM, HH:mm")}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
