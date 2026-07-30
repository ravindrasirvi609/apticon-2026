"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ExternalLink, FileText, Loader2, CheckCircle2, XCircle, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import PageHeader from "@/components/console/PageHeader";
import RegistrationStatusBadge from "@/components/console/RegistrationStatusBadge";
import StatusBadge from "@/components/console/StatusBadge";
import { Button } from "@/components/ui/shadcn/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/shadcn/card";
import { Badge } from "@/components/ui/shadcn/badge";
import { Textarea } from "@/components/ui/shadcn/textarea";
import { Label } from "@/components/ui/shadcn/label";
import { Input } from "@/components/ui/shadcn/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/shadcn/dialog";

interface RegDoc {
  _id: string;
  registrationCode: string;
  fullName: string;
  designation: string;
  institution: string;
  city?: string;
  state?: string;
  email: string;
  phone: string;
  category: string;
  feeTier: string;
  feeAmount: number;
  willSubmitAbstract: boolean;
  paymentMode: string;
  transactionNumber: string;
  paymentProofUrl: string;
  paymentProofName: string;
  paymentStatus?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  paymentMethod?: string;
  paidAt?: string;
  status: string;
  approvedAt?: string;
  rejectedAt?: string;
  reviewNote?: string;
  internalNote?: string;
  linkedAbstract?: string | null;
  remarks?: string;
  createdAt: string;
}

interface LinkedAbs {
  _id: string;
  submissionCode: string;
  title: string;
  status: string;
  theme: string;
  type: string;
  createdAt: string;
  finalDecision?: string;
}

interface Props {
  id: string;
  backHref: string;
  isAdmin: boolean;
  abstractDetailBase?: string; // e.g. "/admin/abstracts"
}

const IMAGE_EXT = /\.(jpe?g|png|webp|gif)(\?|$)/i;

export default function RegistrationDetail({ id, backHref, isAdmin, abstractDetailBase }: Props) {
  const [data, setData] = useState<{ registration: RegDoc; linkedAbstract: LinkedAbs | null } | null>(null);
  const [decisionOpen, setDecisionOpen] = useState<null | "approve" | "reject">(null);
  const [note, setNote] = useState("");
  const [internalNote, setInternalNote] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    const res = await fetch(`/api/registrations/${id}`);
    if (res.ok) {
      const d = await res.json();
      setData(d);
      setInternalNote(d.registration.internalNote ?? "");
    }
  }
  useEffect(() => { load(); }, [id]);

  async function submitDecision() {
    if (!decisionOpen) return;
    setSaving(true);
    try {
      const path = decisionOpen === "approve" ? "approve" : "reject";
      const payload = decisionOpen === "approve"
        ? (isAdmin ? { internalNote: internalNote || undefined } : {})
        : { reason: note, internalNote: isAdmin ? (internalNote || undefined) : undefined };

      if (decisionOpen === "reject" && note.trim().length < 4) {
        toast.error("Provide a reason (min 4 chars).");
        setSaving(false);
        return;
      }
      const res = await fetch(`/api/registrations/${id}/${path}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error);
      toast.success(decisionOpen === "approve" ? "Registration approved. Confirmation emailed." : "Rejected. Delegate notified.");
      setDecisionOpen(null);
      setNote("");
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setSaving(false);
    }
  }

  if (!data) return <div className="p-8 text-sm text-[var(--muted-text)]">Loading…</div>;
  const r = data.registration;
  const isImage = IMAGE_EXT.test(r.paymentProofUrl) || IMAGE_EXT.test(r.paymentProofName);

  return (
    <div className="p-4 md:p-8 max-w-6xl">
      <Link href={backHref} className="inline-flex items-center gap-1 text-sm text-[var(--muted-text)] hover:text-[var(--crimson-800)] mb-4">
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>

      <PageHeader
        title={r.fullName}
        description={`${r.registrationCode} · ${r.designation} · ${r.institution}`}
        actions={<RegistrationStatusBadge status={r.status} />}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: personal + payment */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle>Delegate Information</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <Field label="Email"        value={r.email} />
              <Field label="Mobile"       value={r.phone} />
              <Field label="Designation"  value={r.designation} />
              <Field label="Institution"  value={r.institution} />
              <Field label="City / State" value={`${r.city ?? "—"}${r.state ? ", " + r.state : ""}`} />
              <Field label="Category"     value={r.category} />
              <Field label="Fee"          value={`₹${r.feeAmount.toLocaleString("en-IN")} (${r.feeTier.replace("_", " ")})`} />
              <Field label="Submitted"    value={format(new Date(r.createdAt), "d MMM yyyy, HH:mm")} />
              <Field label="Registration wanted abstract?" value={r.willSubmitAbstract ? "Yes" : "No"} />
              {r.remarks && (
                <div className="sm:col-span-2 mt-2 p-3 rounded bg-[var(--cream-50)] border border-[var(--gold-500)]/15">
                  <div className="text-xs uppercase tracking-wider text-[var(--muted-text)] mb-1">Delegate remarks</div>
                  <div className="whitespace-pre-line">{r.remarks}</div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Payment</CardTitle>
                <Badge variant="outline" className="uppercase">{r.paymentMode.replace("_", " / ")}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <Field label={r.paymentMode === "razorpay" ? "Razorpay Payment ID" : "Transaction Number"} value={r.razorpayPaymentId ?? r.transactionNumber ?? "—"} mono />
                <Field label={r.paymentMode === "razorpay" ? "Payment status" : "Proof file name"} value={r.paymentMode === "razorpay" ? (r.paymentStatus ?? "pending") : r.paymentProofName} />
                {r.paymentMode === "razorpay" && <Field label="Razorpay Order ID" value={r.razorpayOrderId ?? "—"} mono />}
                {r.paymentMode === "razorpay" && <Field label="Payment method" value={r.paymentMethod ?? "—"} />}
              </div>

              {r.paymentMode !== "razorpay" && <div className="rounded-lg border border-[var(--gold-500)]/25 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2 bg-[var(--cream-50)] border-b border-[var(--gold-500)]/20">
                  <div className="flex items-center gap-2 text-sm font-semibold text-[var(--dark-text)]">
                    {isImage ? <ImageIcon className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                    Payment Proof
                  </div>
                  <a href={r.paymentProofUrl} target="_blank" rel="noopener noreferrer">
                    <Button size="sm" variant="outline">Open in new tab <ExternalLink className="w-3 h-3 opacity-70" /></Button>
                  </a>
                </div>
                <div className="bg-black/5">
                  {isImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={r.paymentProofUrl} alt="Payment proof" className="w-full max-h-[520px] object-contain bg-white" />
                  ) : (
                    <div className="p-8 text-center text-sm text-[var(--muted-text)]">
                      PDF preview not embedded. Click &ldquo;Open in new tab&rdquo; to view.
                    </div>
                  )}
                </div>
              </div>}
            </CardContent>
          </Card>

          {isAdmin && (
            <Card>
              <CardHeader><CardTitle>Internal Note (Admin only)</CardTitle></CardHeader>
              <CardContent>
                <Label htmlFor="int">Not visible to delegate</Label>
                <Textarea id="int" className="mt-2" rows={3} value={internalNote} onChange={(e) => setInternalNote(e.target.value)} placeholder="Notes for future reference…" />
                <p className="mt-2 text-xs text-[var(--muted-text)]">Saved when you approve or reject the registration.</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right: decision + linked abstract */}
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Verification</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {r.status === "approved" && (
                <div className="p-3 rounded bg-emerald-50 border border-emerald-200 text-sm">
                  <div className="font-semibold text-emerald-800">Approved</div>
                  {r.approvedAt && <div className="text-xs text-emerald-700">{format(new Date(r.approvedAt), "d MMM yyyy, HH:mm")}</div>}
                </div>
              )}
              {r.status === "rejected" && (
                <div className="p-3 rounded bg-red-50 border border-red-200 text-sm">
                  <div className="font-semibold text-red-800">Rejected</div>
                  {r.rejectedAt && <div className="text-xs text-red-700">{format(new Date(r.rejectedAt), "d MMM yyyy, HH:mm")}</div>}
                  {r.reviewNote && <div className="mt-2 whitespace-pre-line">{r.reviewNote}</div>}
                </div>
              )}
              <div className="grid grid-cols-1 gap-2">
                <Button variant="default" onClick={() => setDecisionOpen("approve")}>
                  <CheckCircle2 className="w-4 h-4" /> Approve payment
                </Button>
                <Button variant="destructive" onClick={() => setDecisionOpen("reject")}>
                  <XCircle className="w-4 h-4" /> Reject with reason
                </Button>
              </div>
              <p className="text-xs text-[var(--muted-text)]">
                Approval sends the delegate a confirmation email with next-step guidance. Rejection sends a resubmission email with your reason.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Linked Abstract</CardTitle></CardHeader>
            <CardContent>
              {data.linkedAbstract ? (
                <div>
                  <div className="text-xs font-mono text-[var(--muted-text)]">{data.linkedAbstract.submissionCode}</div>
                  <div className="mt-1 font-semibold text-[var(--dark-text)]">{data.linkedAbstract.title}</div>
                  <div className="mt-2 flex items-center gap-2 flex-wrap">
                    <StatusBadge status={data.linkedAbstract.status} />
                    <Badge variant="outline" className="capitalize">{data.linkedAbstract.type}</Badge>
                    <Badge variant="secondary" className="text-[10px]">{data.linkedAbstract.theme}</Badge>
                  </div>
                  {abstractDetailBase && (
                    <Link href={`${abstractDetailBase}/${data.linkedAbstract._id}`} className="mt-3 inline-block text-sm font-semibold text-[var(--crimson-800)] hover:underline">Open abstract →</Link>
                  )}
                </div>
              ) : r.willSubmitAbstract ? (
                <div className="text-sm">
                  <div className="text-amber-700 font-semibold">Not submitted yet</div>
                  <div className="text-[var(--muted-text)] mt-1">The delegate indicated they'd submit an abstract but we haven't received one for <b>{r.email}</b>.</div>
                </div>
              ) : (
                <p className="text-sm text-[var(--muted-text)]">This delegate did not indicate they'd submit an abstract.</p>
              )}
              {isAdmin && (
                <div className="mt-4 pt-3 border-t border-[var(--gold-500)]/20">
                  <ManualLinkControl id={id} currentAbstractId={data.linkedAbstract?._id ?? null} onLinked={load} />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={decisionOpen !== null} onOpenChange={(v) => !v && setDecisionOpen(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{decisionOpen === "approve" ? "Approve payment" : "Reject payment"}</DialogTitle>
            <DialogDescription>
              {decisionOpen === "approve"
                ? "The delegate will receive a confirmation email."
                : "The delegate will receive an email with your reason and a resubmission link."}
            </DialogDescription>
          </DialogHeader>
          {decisionOpen === "reject" && (
            <div>
              <Label htmlFor="reason">Reason (visible to delegate) *</Label>
              <Textarea id="reason" className="mt-2" rows={4} value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Transaction number could not be traced. Please share a clearer receipt including the UTR." />
            </div>
          )}
          {decisionOpen === "approve" && isAdmin && (
            <div>
              <Label htmlFor="intNote">Internal note (admin only)</Label>
              <Textarea id="intNote" className="mt-2" rows={3} value={internalNote} onChange={(e) => setInternalNote(e.target.value)} />
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDecisionOpen(null)}>Cancel</Button>
            <Button
              variant={decisionOpen === "reject" ? "destructive" : "default"}
              onClick={submitDecision}
              disabled={saving}
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {decisionOpen === "approve" ? "Approve & notify" : "Reject & notify"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wider text-[var(--muted-text)]">{label}</div>
      <div className={"text-sm " + (mono ? "font-mono" : "")}>{value}</div>
    </div>
  );
}

function ManualLinkControl({ id, currentAbstractId, onLinked }: { id: string; currentAbstractId: string | null; onLinked: () => void }) {
  const [value, setValue] = useState<string>(currentAbstractId ?? "");
  const [saving, setSaving] = useState(false);

  async function save(next: string | null) {
    setSaving(true);
    try {
      const res = await fetch(`/api/registrations/${id}/link`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ abstractId: next }),
      });
      const b = await res.json();
      if (!res.ok) throw new Error(b.error);
      toast.success(next ? "Linked." : "Unlinked.");
      onLinked();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="text-xs uppercase tracking-wider text-[var(--muted-text)] mb-2">Manual link (admin)</div>
      <div className="flex items-center gap-2">
        <Input
          placeholder="Abstract ObjectId (24 chars)"
          value={value}
          onChange={(e) => setValue(e.target.value.trim())}
          className="font-mono text-xs"
        />
        <Button size="sm" variant="outline" onClick={() => save(value || null)} disabled={saving || (value.length > 0 && value.length !== 24)}>
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
        </Button>
        {currentAbstractId && (
          <Button size="sm" variant="ghost" onClick={() => save(null)} disabled={saving}>Unlink</Button>
        )}
      </div>
    </div>
  );
}
