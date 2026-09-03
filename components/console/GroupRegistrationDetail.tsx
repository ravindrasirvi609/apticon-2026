"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Info, Loader2, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import PageHeader from "@/components/console/PageHeader";
import DelegatePhoto from "@/components/ui/DelegatePhoto";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/shadcn/card";
import { Badge } from "@/components/ui/shadcn/badge";
import { Button } from "@/components/ui/shadcn/button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/shadcn/table";

interface GroupDelegateDoc {
  name: string; designation: string; email: string; phone: string;
  photoUrl?: string; isComplimentary: boolean;
}

interface GroupDoc {
  _id: string;
  groupCode: string;
  coordinatorName: string;
  coordinatorEmail: string;
  coordinatorPhone: string;
  institution: string;
  city?: string;
  state?: string;
  category: string;
  delegates: GroupDelegateDoc[];
  delegateCount: number;
  complimentaryCount: number;
  feeTier: string;
  baseFeeAmount: number;
  feeAmount: number;
  paymentStatus?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  paymentError?: string;
  paidAt?: string;
  status: string;
  reviewedAt?: string;
  reviewNote?: string;
  createdRegistrations: string[];
  createdAt: string;
}

const STATUS_LABEL: Record<string, { label: string; variant: "info" | "warning" | "success" | "danger" | "secondary" }> = {
  submitted:      { label: "Awaiting Payment", variant: "info" },
  payment_review: { label: "Pending Review", variant: "warning" },
  approved:       { label: "Approved", variant: "success" },
  rejected:       { label: "Rejected", variant: "danger" },
};

interface SyncResponse {
  outcome: "captured" | "already_approved" | "updated" | "no_payments";
  paymentStatus?: string;
  paymentError?: string | null;
  delegatesProcessed?: number;
}

interface Props {
  id: string;
  backHref: string;
  registrationDetailBase?: string; // e.g. "/admin/registrations", to link created delegates
}

export default function GroupRegistrationDetail({ id, backHref, registrationDetailBase }: Props) {
  const [group, setGroup] = useState<GroupDoc | null>(null);
  const [syncing, setSyncing] = useState(false);

  async function load() {
    const res = await fetch(`/api/group-registrations/${id}`);
    if (res.ok) {
      const d = await res.json();
      setGroup(d.group);
    }
  }
  useEffect(() => { load(); }, [id]);

  /** Re-reads the payment from Razorpay. Also retries any delegate who missed their email/code/QR last time. */
  async function syncPayment() {
    setSyncing(true);
    try {
      const res = await fetch(`/api/group-registrations/${id}/sync-payment`, { method: "POST" });
      const body = (await res.json()) as SyncResponse & { error?: string };
      if (!res.ok) throw new Error(body.error);

      if (body.outcome === "captured") {
        toast.success(
          body.delegatesProcessed
            ? `Payment confirmed. ${body.delegatesProcessed} delegate(s) emailed their registration code and QR.`
            : "Payment confirmed by Razorpay. Delegates have been emailed."
        );
      } else if (body.outcome === "already_approved") {
        toast.info("Already approved — every delegate already has their registration.");
      } else if (body.outcome === "no_payments") {
        toast.info("Razorpay has no payment attempt for this order yet.");
      } else if (body.paymentError) {
        toast.warning(body.paymentError);
      } else {
        toast.info(`Razorpay reports this payment as "${body.paymentStatus ?? "pending"}". Not approved.`);
      }
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Sync failed");
    } finally {
      setSyncing(false);
    }
  }

  if (!group) return <div className="p-8 text-sm text-[var(--muted-text)]">Loading…</div>;
  const statusInfo = STATUS_LABEL[group.status] ?? { label: group.status, variant: "secondary" as const };
  const missingDelegates = group.status === "approved" && group.createdRegistrations.length < group.delegateCount;

  return (
    <div className="p-4 md:p-8 max-w-6xl">
      <Link href={backHref} className="inline-flex items-center gap-1 text-sm text-[var(--muted-text)] hover:text-[var(--primary-800)] mb-4">
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>

      <PageHeader
        title={group.coordinatorName}
        description={`${group.groupCode} · ${group.institution}`}
        actions={<Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle>Group Summary</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <Field label="Coordinator Email" value={group.coordinatorEmail} />
              <Field label="Coordinator Mobile" value={group.coordinatorPhone} />
              <Field label="Institution" value={group.institution} />
              <Field label="City / State" value={`${group.city ?? "—"}${group.state ? ", " + group.state : ""}`} />
              <Field label="Category" value={group.category} />
              <Field label="Delegates" value={`${group.delegateCount} (${group.complimentaryCount} complimentary)`} />
              <Field label="Fee" value={`₹${group.feeAmount.toLocaleString("en-IN")} (${group.feeTier.replace("_", " ")})`} />
              <Field label="Submitted" value={format(new Date(group.createdAt), "d MMM yyyy, HH:mm")} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Delegates ({group.delegates.length})</CardTitle></CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Delegate</TableHead>
                    <TableHead>Designation</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Mobile</TableHead>
                    <TableHead>Fee</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {group.delegates.map((d, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <DelegatePhoto url={d.photoUrl} name={d.name} size={28} />
                          {registrationDetailBase && group.createdRegistrations[i] ? (
                            <Link
                              href={`${registrationDetailBase}/${group.createdRegistrations[i]}`}
                              className="font-medium text-[var(--primary-800)] hover:underline"
                            >
                              {d.name}
                            </Link>
                          ) : (
                            <span className="font-medium">{d.name}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs">{d.designation}</TableCell>
                      <TableCell className="text-xs">{d.email}</TableCell>
                      <TableCell className="text-xs">{d.phone}</TableCell>
                      <TableCell>
                        {d.isComplimentary ? <Badge variant="success" className="text-[10px]">Complimentary</Badge> : <Badge variant="secondary" className="text-[10px]">Paid share</Badge>}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {group.createdRegistrations.length > 0 && (
            <Card>
              <CardHeader><CardTitle>Created Registrations</CardTitle></CardHeader>
              <CardContent>
                <p className="text-sm text-[var(--muted-text)] mb-2">
                  {group.createdRegistrations.length} individual registration{group.createdRegistrations.length === 1 ? "" : "s"} were created for this group.
                </p>
                {registrationDetailBase && (
                  <div className="flex flex-wrap gap-2">
                    {group.createdRegistrations.map((rid) => (
                      <Link key={rid} href={`${registrationDetailBase}/${rid}`} className="text-xs font-mono text-[var(--primary-800)] hover:underline">
                        {rid.slice(-8)} →
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Payment</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <Field label="Payment status" value={group.paymentStatus ?? "pending"} />
              <Field label="Razorpay Order ID" value={group.razorpayOrderId ?? "—"} />
              <Field label="Paid at" value={group.paidAt ? format(new Date(group.paidAt), "d MMM yyyy, HH:mm") : "—"} />
              {group.paymentError && (
                <div className="p-3 rounded bg-amber-50 border border-amber-200 text-sm">
                  <div className="font-semibold text-amber-800 flex items-center gap-1.5">
                    <Info className="w-4 h-4" /> Gateway note
                  </div>
                  <div className="mt-1 text-amber-900 whitespace-pre-line">{group.paymentError}</div>
                </div>
              )}
              {missingDelegates && (
                <div className="p-3 rounded bg-amber-50 border border-amber-200 text-sm">
                  <div className="font-semibold text-amber-800">
                    {group.createdRegistrations.length} of {group.delegateCount} delegates have a registration
                  </div>
                  <div className="mt-1 text-amber-900">
                    The rest are missing their confirmation email, code and QR — click Sync to retry them.
                  </div>
                </div>
              )}
              <Button variant="outline" className="w-full" onClick={syncPayment} disabled={syncing}>
                {syncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
                Sync from Razorpay
              </Button>
              <p className="text-xs text-[var(--muted-text)]">
                Use this if the coordinator says they paid but the status here hasn&rsquo;t caught up, or if some
                delegates never received their email. It re-reads the payment from Razorpay and retries any
                delegate still missing a registration.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Registration Status</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {group.status === "approved" && (
                <div className="p-3 rounded bg-emerald-50 border border-emerald-200 text-sm">
                  <div className="font-semibold text-emerald-800">Approved</div>
                  {group.reviewedAt && <div className="text-xs text-emerald-700">{format(new Date(group.reviewedAt), "d MMM yyyy, HH:mm")}</div>}
                </div>
              )}
              {group.status === "rejected" && (
                <div className="p-3 rounded bg-red-50 border border-red-200 text-sm">
                  <div className="font-semibold text-red-800">Rejected</div>
                  {group.reviewedAt && <div className="text-xs text-red-700">{format(new Date(group.reviewedAt), "d MMM yyyy, HH:mm")}</div>}
                  {group.reviewNote && <div className="mt-2 whitespace-pre-line">{group.reviewNote}</div>}
                  <p className="mt-2 text-xs text-red-700">Remember to process the refund via the Razorpay dashboard.</p>
                </div>
              )}
              {group.status === "submitted" && (
                <p className="text-sm text-[var(--muted-text)]">Awaiting payment — nothing to review yet.</p>
              )}
              {group.status === "payment_review" && <p className="text-sm text-[var(--muted-text)]">Legacy payment-review record. New group registrations are confirmed automatically after successful payment.</p>}
            </CardContent>
          </Card>
        </div>
      </div>
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
