"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ExternalLink, FileText, Loader2, Users, CheckCircle2, XCircle, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import PageHeader from "@/components/console/PageHeader";
import StatusBadge from "@/components/console/StatusBadge";
import RegistrationStatusBadge from "@/components/console/RegistrationStatusBadge";
import { Button } from "@/components/ui/shadcn/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/shadcn/card";
import { Badge } from "@/components/ui/shadcn/badge";
import { Textarea } from "@/components/ui/shadcn/textarea";
import { Label } from "@/components/ui/shadcn/label";
import { Checkbox } from "@/components/ui/shadcn/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/shadcn/dialog";

interface AbstractDoc {
  _id: string;
  submissionCode: string;
  title: string;
  coAuthors?: { name: string; institution: string }[];
  presentingAuthor: string;
  institution: string;
  email: string;
  phone: string;
  aptiMemberId?: string;
  theme: string;
  type: string;
  abstract: string;
  preferredPresentationType?: string;
  keywords: string[];
  fileUrl?: string;
  fileName?: string;
  graphicalAbstractUrl?: string;
  status: string;
  assignedReviewers: string[];
  finalDecision?: string;
  finalDecisionAt?: string;
  finalDecisionNote?: string;
  presentationType?: string;
  abstractCode?: string;
  linkedRegistration?: string;
  createdAt: string;
}

interface ReviewerLite { _id: string; name: string; email: string; expertise?: string[] }

interface ReviewDoc {
  _id: string;
  reviewer: { _id: string; name: string; email: string } | string;
  verdict: string;
  presentationType?: string;
  comments: string;
  commentsPrivate?: string;
  submittedAt: string;
}

interface LinkedRegLite {
  _id?: string;
  registrationCode?: string;
  fullName?: string;
  email?: string;
  status?: string;
  paymentStatus?: string;
  feeAmount?: number;
  feeTier?: string;
  createdAt?: string;
  approvedAt?: string;
}

interface Props {
  id: string;
  backHref: string;              // e.g. "/admin/abstracts"
  registrationDetailBase: string; // e.g. "/admin/registrations"
}

export default function AbstractDetail({ id, backHref, registrationDetailBase }: Props) {
  const [data, setData] = useState<{ abstract: AbstractDoc; reviews: ReviewDoc[]; reviewers: ReviewerLite[]; linkedRegistration: LinkedRegLite | null } | null>(null);
  const [allReviewers, setAllReviewers] = useState<ReviewerLite[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [assignOpen, setAssignOpen] = useState(false);
  const [decisionOpen, setDecisionOpen] = useState<null | "accepted" | "rejected" | "revision_requested">(null);
  const [decisionNote, setDecisionNote] = useState("");
  const [presentationType, setPresentationType] = useState<"oral" | "poster" | null>(null);
  const [saving, setSaving] = useState(false);

  async function load() {
    const [res, uRes] = await Promise.all([
      fetch(`/api/abstracts/${id}`),
      fetch("/api/users?role=reviewer"),
    ]);
    if (res.ok) {
      const d = await res.json();
      setData(d);
      setSelected(new Set(d.abstract.assignedReviewers as string[]));
    }
    if (uRes.ok) {
      const u = await uRes.json();
      setAllReviewers(u.users.filter((x: { role: string; isActive: boolean }) => x.role === "reviewer" && x.isActive).map((x: { id: string; name: string; email: string; expertise: string[] }) => ({
        _id: x.id, name: x.name, email: x.email, expertise: x.expertise,
      })));
    }
  }

  useEffect(() => { load(); }, [id]);

  async function saveAssignment() {
    setSaving(true);
    try {
      const res = await fetch(`/api/abstracts/${id}/assign`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ reviewerIds: [...selected] }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error);
      toast.success("Reviewers assigned. Notification emails sent.");
      setAssignOpen(false);
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to assign");
    } finally {
      setSaving(false);
    }
  }

  async function saveDecision() {
    if (!decisionOpen) return;
    if (decisionOpen === "accepted" && !presentationType) {
      toast.error("Select Oral or Poster before accepting.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/abstracts/${id}/decision`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          decision: decisionOpen,
          note: decisionNote || undefined,
          presentationType: decisionOpen === "accepted" ? presentationType : undefined,
        }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error);
      toast.success("Decision recorded. Notification email sent to author.");
      setDecisionOpen(null);
      setDecisionNote("");
      setPresentationType(null);
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to record decision");
    } finally {
      setSaving(false);
    }
  }

  if (!data) return <div className="p-8 text-sm text-[var(--muted-text)]">Loading…</div>;
  const a = data.abstract;

  return (
    <div className="p-4 md:p-8 max-w-6xl">
      <Link href={backHref} className="inline-flex items-center gap-1 text-sm text-[var(--muted-text)] hover:text-[var(--primary-800)] mb-4">
        <ArrowLeft className="w-4 h-4" /> Back to list
      </Link>

      <PageHeader
        title={a.title}
        description={`${a.submissionCode} · Submitted ${format(new Date(a.createdAt), "d MMM yyyy, HH:mm")}`}
        actions={
          <div className="flex items-center gap-2">
            <StatusBadge status={a.status} />
            <Badge variant="secondary" className="capitalize">{a.type}</Badge>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle>Abstract</CardTitle></CardHeader>
            <CardContent>
              <div className="mb-4 flex flex-wrap gap-1">
                {(a.keywords ?? []).map((k) => <Badge key={k} variant="outline">{k}</Badge>)}
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
                      <FileText className="w-4 h-4" />
                      Open attached file
                      <ExternalLink className="w-3 h-3 opacity-70" />
                    </Button>
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Reviews ({data.reviews.length})</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {data.reviews.length === 0 && <p className="text-sm text-[var(--muted-text)]">No reviews submitted yet.</p>}
              {data.reviews.map((r) => {
                const rev = typeof r.reviewer === "object" ? r.reviewer : { name: r.reviewer, email: "" };
                return (
                  <div key={r._id} className="rounded-lg border border-[var(--accent-500)]/20 p-4">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <div className="font-semibold text-sm">{rev.name}</div>
                        <div className="text-xs text-[var(--muted-text)]">{format(new Date(r.submittedAt), "d MMM yyyy, HH:mm")}</div>
                      </div>
                      <Badge variant={r.verdict === "accept" ? "success" : r.verdict === "reject" ? "danger" : "warning"}>
                        {r.verdict}
                        {r.presentationType ? ` · ${r.presentationType}` : ""}
                      </Badge>
                    </div>
                    <div className="text-sm whitespace-pre-line">{r.comments}</div>
                    {r.commentsPrivate && (
                      <div className="mt-3 p-3 rounded bg-amber-50 border border-amber-200 text-sm">
                        <div className="text-xs font-semibold uppercase text-amber-800 mb-1">Private note to admin</div>
                        <div className="whitespace-pre-line">{r.commentsPrivate}</div>
                      </div>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Right: metadata + actions */}
        <div className="space-y-6">
          {/* Linked registration panel — shown to admin and editorial */}
          <Card>
            <CardHeader><CardTitle>Registration</CardTitle></CardHeader>
            <CardContent>
              {data.linkedRegistration && data.linkedRegistration.registrationCode ? (
                <div className="space-y-2 text-sm">
                  <div>
                    <Link href={`${registrationDetailBase}/${data.linkedRegistration._id}`} className="font-mono text-xs text-[var(--primary-800)] hover:underline">
                      {data.linkedRegistration.registrationCode}
                    </Link>
                  </div>
                  <div className="font-semibold">{data.linkedRegistration.fullName}</div>
                  <div className="text-xs text-[var(--muted-text)]">{data.linkedRegistration.email}</div>
                  <div>{data.linkedRegistration.status && <RegistrationStatusBadge status={data.linkedRegistration.status} paymentStatus={data.linkedRegistration.paymentStatus} />}</div>
                  <div className="text-xs text-[var(--muted-text)]">
                    {data.linkedRegistration.feeAmount ? `₹${data.linkedRegistration.feeAmount.toLocaleString("en-IN")} · ${data.linkedRegistration.feeTier?.replace("_", " ")}` : ""}
                  </div>
                  {!a.linkedRegistration && (
                    <div className="mt-2 text-xs text-amber-700">
                      Auto-matched by email — not yet formally linked. Open the registration to confirm.
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-sm text-amber-700">
                  <div className="font-semibold">Not registered</div>
                  <div className="text-[var(--muted-text)] mt-1">No registration found for <b>{a.email}</b>. Presenting authors must be registered delegates.</div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Submission Details</CardTitle></CardHeader>
            <CardContent className="text-sm space-y-2">
              <Field label="Presenting author" value={a.presentingAuthor} />
              <Field label="Institution" value={a.institution} />
              <div>
                <div className="text-xs uppercase tracking-wider text-[var(--muted-text)]">Co-authors</div>
                {a.coAuthors && a.coAuthors.length > 0 ? (
                  <ul className="text-sm mt-0.5 space-y-0.5">
                    {a.coAuthors.map((c, i) => (
                      <li key={i}>{c.name} — {c.institution}</li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-sm">None</div>
                )}
              </div>
              <Field label="Email" value={a.email} />
              <Field label="Phone" value={a.phone} />
              <Field label="APTI Membership ID" value={a.aptiMemberId || "—"} />
              <Field label="Theme" value={a.theme} />
              <Field
                label="Presentation preference"
                value={a.preferredPresentationType ? a.preferredPresentationType[0].toUpperCase() + a.preferredPresentationType.slice(1) : "—"}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Reviewers</CardTitle>
              <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline"><Users className="w-4 h-4" />Assign</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Assign reviewers</DialogTitle>
                  </DialogHeader>
                  <div className="max-h-96 overflow-y-auto space-y-2">
                    {allReviewers.map((r) => (
                      <label key={r._id} className="flex items-center gap-3 p-3 rounded-lg border border-[var(--accent-500)]/20 cursor-pointer hover:bg-[var(--surface-50)]">
                        <Checkbox
                          checked={selected.has(r._id)}
                          onCheckedChange={(v) => {
                            const next = new Set(selected);
                            if (v) next.add(r._id); else next.delete(r._id);
                            setSelected(next);
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold">{r.name}</div>
                          <div className="text-xs text-[var(--muted-text)]">{r.email}</div>
                          {r.expertise && r.expertise.length > 0 && (
                            <div className="mt-1 flex flex-wrap gap-1">
                              {r.expertise.slice(0, 3).map((e) => <Badge key={e} variant="outline" className="text-[10px]">{e}</Badge>)}
                            </div>
                          )}
                        </div>
                      </label>
                    ))}
                    {allReviewers.length === 0 && <p className="text-sm text-[var(--muted-text)] p-4 text-center">No active reviewers. Create one in Users.</p>}
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setAssignOpen(false)}>Cancel</Button>
                    <Button onClick={saveAssignment} disabled={saving}>
                      {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                      Save assignment
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {data.reviewers.length === 0 && <p className="text-sm text-[var(--muted-text)]">Not yet assigned.</p>}
              <div className="space-y-2">
                {data.reviewers.map((r) => (
                  <div key={r._id} className="text-sm">
                    <div className="font-semibold">{r.name}</div>
                    <div className="text-xs text-[var(--muted-text)]">{r.email}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Final Decision</CardTitle></CardHeader>
            <CardContent>
              {a.finalDecision ? (
                <div className="space-y-2">
                  <StatusBadge status={a.status} />
                  {a.abstractCode && (
                    <div className="text-sm">
                      <span className="text-xs uppercase tracking-wider text-[var(--muted-text)]">Abstract Code ({a.presentationType})</span>
                      <div className="font-mono font-bold text-[var(--primary-800)]">{a.abstractCode}</div>
                    </div>
                  )}
                  {a.finalDecisionAt && (
                    <div className="text-xs text-[var(--muted-text)]">Recorded {format(new Date(a.finalDecisionAt), "d MMM yyyy, HH:mm")}</div>
                  )}
                  {a.finalDecisionNote && (
                    <div className="text-sm p-3 rounded bg-[var(--surface-100)] border-l-2 border-[var(--accent-500)] whitespace-pre-line">
                      {a.finalDecisionNote}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-[var(--muted-text)]">No decision recorded yet.</p>
              )}
              <div className="mt-4 grid grid-cols-1 gap-2">
                <Button
                  variant="default"
                  onClick={() => {
                    setDecisionOpen("accepted");
                    setPresentationType((a.preferredPresentationType as "oral" | "poster" | undefined) ?? null);
                  }}
                >
                  <CheckCircle2 className="w-4 h-4" /> Accept
                </Button>
                <Button variant="outline" onClick={() => setDecisionOpen("revision_requested")}>
                  <RotateCcw className="w-4 h-4" /> Request revision
                </Button>
                <Button variant="destructive" onClick={() => setDecisionOpen("rejected")}>
                  <XCircle className="w-4 h-4" /> Reject
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Decision dialog */}
      <Dialog
        open={decisionOpen !== null}
        onOpenChange={(v) => {
          if (!v) {
            setDecisionOpen(null);
            setPresentationType(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm decision: {decisionOpen?.replace("_", " ")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-[var(--muted-text)]">The author will receive an email with your note (if provided). This action is recorded in the audit log.</p>
            {decisionOpen === "accepted" && (
              <div>
                <Label>Presentation type *</Label>
                {a.preferredPresentationType && (
                  <p className="mt-1 text-xs text-[var(--muted-text)]">
                    Author preferred <span className="font-semibold capitalize">{a.preferredPresentationType}</span> — confirm or change it below.
                  </p>
                )}
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
            )}
            <div>
              <Label htmlFor="note">Note to author (optional)</Label>
              <Textarea id="note" className="mt-2" rows={5} value={decisionNote} onChange={(e) => setDecisionNote(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setDecisionOpen(null); setPresentationType(null); }}>Cancel</Button>
            <Button onClick={saveDecision} disabled={saving || (decisionOpen === "accepted" && !presentationType)}>
              {saving && <Loader2 className="w-4 h-4 animate-spin" />} Record decision
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wider text-[var(--muted-text)]">{label}</div>
      <div className="text-sm">{value}</div>
    </div>
  );
}
