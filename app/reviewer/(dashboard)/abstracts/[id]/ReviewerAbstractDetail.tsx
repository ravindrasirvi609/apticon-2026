"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, FileText, ExternalLink, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import PageHeader from "@/components/console/PageHeader";
import StatusBadge from "@/components/console/StatusBadge";
import { Button } from "@/components/ui/shadcn/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/shadcn/card";
import { Badge } from "@/components/ui/shadcn/badge";
import { Textarea } from "@/components/ui/shadcn/textarea";
import { Label } from "@/components/ui/shadcn/label";
import { Checkbox } from "@/components/ui/shadcn/checkbox";

interface AbstractDoc {
  _id: string;
  submissionCode: string;
  title: string;
  theme: string;
  type: string;
  abstract: string;
  keywords: string[];
  fileUrl?: string;
  graphicalAbstractUrl?: string;
  status: string;
  finalDecision?: string;
  createdAt: string;
}

interface ReviewDoc {
  _id: string;
  reviewer: { _id: string; name: string; email: string } | string;
  verdict: "accept" | "reject" | "revise";
  presentationType?: "oral" | "poster";
  comments: string;
  commentsPrivate?: string;
  submittedAt: string;
}

export default function ReviewerAbstractDetail({ id }: { id: string }) {
  const [data, setData] = useState<{ abstract: AbstractDoc; reviews: ReviewDoc[] } | null>(null);
  const [me, setMe] = useState<{ uid: string } | null>(null);

  const [accept, setAccept] = useState(false);
  const [verdict, setVerdict] = useState<"reject" | "revise">("revise");
  const [presentationType, setPresentationType] = useState<"oral" | "poster" | null>(null);
  const [comments, setComments] = useState("");
  const [commentsPrivate, setCommentsPrivate] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    const [res, meRes] = await Promise.all([
      fetch(`/api/abstracts/${id}`),
      fetch("/api/auth/me"),
    ]);
    if (res.ok) {
      const d = await res.json();
      setData(d);
    }
    if (meRes.ok) {
      const m = await meRes.json();
      if (m.user) setMe({ uid: m.user.uid });
    }
  }

  useEffect(() => { load(); }, [id]);

  // Prefill from existing review if any
  useEffect(() => {
    if (!data || !me) return;
    const mine = data.reviews.find((r) => (typeof r.reviewer === "object" ? r.reviewer._id : r.reviewer) === me.uid);
    if (mine) {
      if (mine.verdict === "accept") {
        setAccept(true);
        setPresentationType(mine.presentationType ?? null);
      } else {
        setAccept(false);
        setVerdict(mine.verdict);
      }
      setComments(mine.comments);
      setCommentsPrivate(mine.commentsPrivate ?? "");
    }
  }, [data, me]);

  async function submit() {
    if (comments.trim().length < 20) return toast.error("Comments must be at least 20 characters.");
    if (accept && !presentationType) return toast.error("Select Oral or Poster to accept this abstract.");
    setSaving(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          abstractId: id,
          verdict: accept ? "accept" : verdict,
          presentationType: accept ? presentationType : undefined,
          comments,
          commentsPrivate: commentsPrivate || undefined,
        }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error);
      toast.success(accept ? "Abstract accepted." : "Review submitted.");
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setSaving(false);
    }
  }

  if (!data) return <div className="p-8 text-sm text-[var(--muted-text)]">Loading…</div>;
  const a = data.abstract;
  const mine = me ? data.reviews.find((r) => (typeof r.reviewer === "object" ? r.reviewer._id : r.reviewer) === me.uid) : null;

  return (
    <div className="p-4 md:p-8 max-w-5xl">
      <Link href="/reviewer" className="inline-flex items-center gap-1 text-sm text-[var(--muted-text)] hover:text-[var(--primary-800)] mb-4">
        <ArrowLeft className="w-4 h-4" /> Back to dashboard
      </Link>

      <PageHeader
        title={a.title}
        description={`${a.submissionCode} · Submitted ${format(new Date(a.createdAt), "d MMM yyyy")}`}
        actions={<div className="flex items-center gap-2"><StatusBadge status={a.status} /><Badge variant="secondary" className="capitalize">{a.type}</Badge></div>}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle>Abstract</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                <div><span className="text-xs uppercase tracking-wider text-[var(--muted-text)]">Theme</span><div>{a.theme}</div></div>
                <div className="col-span-2">
                  <span className="text-xs uppercase tracking-wider text-[var(--muted-text)]">Keywords</span>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {(a.keywords ?? []).map((k) => <Badge key={k} variant="outline">{k}</Badge>)}
                  </div>
                </div>
              </div>
              <p className="text-sm whitespace-pre-line leading-relaxed">{a.abstract}</p>
              {a.graphicalAbstractUrl && (
                <div className="mt-4">
                  <span className="text-xs uppercase tracking-wider text-[var(--muted-text)]">Graphical Abstract</span>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={a.graphicalAbstractUrl}
                    alt="Graphical abstract"
                    className="mt-2 max-w-full rounded-lg border border-[var(--accent-500)]/30"
                  />
                </div>
              )}
              {a.fileUrl && (
                <div className="mt-4">
                  <a href={a.fileUrl} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm">
                      <FileText className="w-4 h-4" /> Open attached file <ExternalLink className="w-3 h-3 opacity-70" />
                    </Button>
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>{a.finalDecision ? "Decision recorded" : mine ? "Update your review" : "Submit your review"}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {a.finalDecision ? (
                <p className="text-sm text-[var(--muted-text)]">
                  This abstract has already been finalized ({a.finalDecision.replace("_", " ")}) — no further review can be submitted.
                </p>
              ) : (
                <>
                  <div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <Checkbox checked={accept} onCheckedChange={(v) => setAccept(v === true)} />
                      <span className="text-sm font-semibold">Accept this abstract</span>
                    </label>
                    <p className="mt-1 text-xs text-[var(--muted-text)]">
                      Checking this finalizes the abstract as accepted immediately — no further confirmation from admin or editorial is needed.
                    </p>
                  </div>

                  {accept ? (
                    <div>
                      <Label>Presentation type *</Label>
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        {(["oral", "poster"] as const).map((v) => (
                          <button
                            key={v}
                            type="button"
                            onClick={() => setPresentationType(v)}
                            className={`px-3 py-2 rounded-lg border text-sm font-semibold capitalize ${
                              presentationType === v
                                ? "bg-emerald-600 text-white border-emerald-600"
                                : "bg-white border-[var(--accent-500)]/30"
                            }`}
                          >
                            {v}
                          </button>
                        ))}
                      </div>
                      <p className="mt-2 text-xs text-[var(--muted-text)]">An Abstract Code will be generated based on this choice and cannot be changed afterwards.</p>
                    </div>
                  ) : (
                    <div>
                      <Label>Recommendation</Label>
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        {(["revise", "reject"] as const).map((v) => (
                          <button
                            key={v}
                            type="button"
                            onClick={() => setVerdict(v)}
                            className={`px-3 py-2 rounded-lg border text-sm font-semibold capitalize ${
                              verdict === v
                                ? v === "reject" ? "bg-red-600 text-white border-red-600" : "bg-amber-500 text-white border-amber-500"
                                : "bg-white border-[var(--accent-500)]/30"
                            }`}
                          >
                            {v}
                          </button>
                        ))}
                      </div>
                      <p className="mt-2 text-xs text-[var(--muted-text)]">This is a recommendation only — admin/editorial will be emailed to make the final decision.</p>
                    </div>
                  )}

                  <div>
                    <Label htmlFor="comments">Public comments (shared with author) *</Label>
                    <Textarea id="comments" className="mt-2" rows={6} value={comments} onChange={(e) => setComments(e.target.value)} placeholder="Constructive feedback for the author…" />
                    <div className="text-xs text-[var(--muted-text)] mt-1">{comments.length} / 4000</div>
                  </div>

                  <div>
                    <Label htmlFor="private">Private note to admin (optional)</Label>
                    <Textarea id="private" className="mt-2" rows={3} value={commentsPrivate} onChange={(e) => setCommentsPrivate(e.target.value)} placeholder="Only visible to the super admin" />
                  </div>

                  <Button onClick={submit} disabled={saving} size="lg" className="w-full">
                    {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                    {accept ? "Accept abstract" : mine ? "Update review" : "Submit review"}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Other reviews</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {data.reviews.filter((r) => (typeof r.reviewer === "object" ? r.reviewer._id : r.reviewer) !== me?.uid).length === 0 && (
                <p className="text-sm text-[var(--muted-text)]">No other reviews yet.</p>
              )}
              {data.reviews
                .filter((r) => (typeof r.reviewer === "object" ? r.reviewer._id : r.reviewer) !== me?.uid)
                .map((r) => {
                  const rev = typeof r.reviewer === "object" ? r.reviewer : { name: "Reviewer" };
                  return (
                    <div key={r._id} className="p-3 rounded-lg border border-[var(--accent-500)]/20 text-sm">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold">{rev.name}</span>
                        <Badge variant={r.verdict === "accept" ? "success" : r.verdict === "reject" ? "danger" : "warning"}>
                          {r.verdict}
                        </Badge>
                      </div>
                      <div className="text-xs text-[var(--muted-text)] mb-2">{format(new Date(r.submittedAt), "d MMM yyyy")}</div>
                      <div className="whitespace-pre-line">{r.comments}</div>
                    </div>
                  );
                })}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
