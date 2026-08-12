"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { CheckCircle2, XCircle, Clock, ShieldCheck, FileText, Users } from "lucide-react";
import PageHeader from "@/components/console/PageHeader";
import RegistrationStatusBadge from "@/components/console/RegistrationStatusBadge";
import StatusBadge from "@/components/console/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/shadcn/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/shadcn/table";

interface RegItem {
  _id: string;
  registrationCode: string;
  fullName: string;
  email: string;
  category: string;
  feeAmount: number;
  status: string;
  createdAt: string;
  paymentMode: string;
  paymentStatus?: string;
}

interface AbstractItem {
  _id: string;
  submissionCode: string;
  title: string;
  presentingAuthor: string;
  status: string;
  createdAt: string;
  assignedReviewers: string[];
}

export default function EditorialDashboard() {
  const [abstracts, setAbstracts] = useState<AbstractItem[]>([]);
  const [pendingPayments, setPendingPayments] = useState<RegItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch("/api/abstracts?limit=100").then((r) => r.json()),
      // Razorpay approves on capture, so the only registrations worth surfacing are stalled ones.
      fetch("/api/registrations?status=submitted").then((r) => r.json()),
    ])
      .then(([abs, regs]) => {
        setAbstracts(abs.items ?? []);
        setPendingPayments(regs.items ?? []);
      })
      .finally(() => setLoading(false));
  }, []);

  const counts = useMemo(() => {
    const byStatus: Record<string, number> = {};
    abstracts.forEach((a) => (byStatus[a.status] = (byStatus[a.status] ?? 0) + 1));
    return {
      byStatus,
      unassigned: abstracts.filter((a) => a.assignedReviewers.length === 0).length,
    };
  }, [abstracts]);

  // Unassigned abstracts are the editorial queue — nothing moves until reviewers are picked.
  const needsAssignment = useMemo(
    () => abstracts.filter((a) => a.assignedReviewers.length === 0).slice(0, 8),
    [abstracts]
  );

  return (
    <div className="p-4 md:p-8">
      <PageHeader title="Editorial Dashboard" description="Route abstracts to reviewers and record final decisions." />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Awaiting assignment" value={counts.unassigned} icon={Users} accent="amber" />
        <StatCard label="Under review" value={counts.byStatus.under_review ?? 0} icon={Clock} />
        <StatCard label="Accepted" value={counts.byStatus.accepted ?? 0} icon={CheckCircle2} accent="emerald" />
        <StatCard label="Rejected" value={counts.byStatus.rejected ?? 0} icon={XCircle} />
      </div>

      <Card className="mb-6">
        <CardHeader><CardTitle>Abstracts awaiting reviewer assignment</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-sm text-[var(--muted-text)]">Loading…</TableCell></TableRow>
              ) : needsAssignment.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-sm text-[var(--muted-text)]">Every abstract has reviewers assigned.</TableCell></TableRow>
              ) : (
                needsAssignment.map((a) => (
                  <TableRow key={a._id}>
                    <TableCell className="font-mono text-xs">{a.submissionCode}</TableCell>
                    <TableCell>
                      <Link href={`/editorial/abstracts/${a._id}`} className="text-[var(--primary-800)] hover:underline font-semibold">
                        {a.title.length > 60 ? a.title.slice(0, 60) + "…" : a.title}
                      </Link>
                    </TableCell>
                    <TableCell className="text-xs">{a.presentingAuthor}</TableCell>
                    <TableCell><StatusBadge status={a.status} /></TableCell>
                    <TableCell className="text-xs text-[var(--muted-text)]">{format(new Date(a.createdAt), "d MMM, HH:mm")}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="mb-4 flex items-start gap-2 p-3 rounded-lg bg-[var(--surface-50)] border border-[var(--accent-500)]/25 text-sm">
        <ShieldCheck className="w-4 h-4 mt-0.5 shrink-0 text-emerald-700" />
        <span className="text-[var(--muted-text)]">
          Payments are verified by Razorpay and registrations are approved <b>automatically</b> on capture. The list below
          is checkouts that never completed — open one and use <b>Sync from Razorpay</b> if a delegate says they paid.
        </span>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[var(--primary-800)]" />
            <CardTitle>Incomplete payments ({pendingPayments.length})</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Fee</TableHead>
                <TableHead>Payment status</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Started</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-sm text-[var(--muted-text)]">Loading…</TableCell></TableRow>
              ) : pendingPayments.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-sm text-[var(--muted-text)]">No incomplete payments — every registration is settled.</TableCell></TableRow>
              ) : (
                pendingPayments.map((r) => (
                  <TableRow key={r._id}>
                    <TableCell className="font-mono text-xs">{r.registrationCode}</TableCell>
                    <TableCell>
                      <Link href={`/editorial/registrations/${r._id}`} className="text-[var(--primary-800)] hover:underline font-semibold">
                        {r.fullName}
                      </Link>
                      <div className="text-xs text-[var(--muted-text)]">{r.email}</div>
                    </TableCell>
                    <TableCell className="text-xs">₹{r.feeAmount.toLocaleString("en-IN")}</TableCell>
                    <TableCell className="text-xs uppercase">{r.paymentStatus ?? "—"}</TableCell>
                    <TableCell><RegistrationStatusBadge status={r.status} paymentStatus={r.paymentStatus} /></TableCell>
                    <TableCell className="text-xs text-[var(--muted-text)]">{format(new Date(r.createdAt), "d MMM, HH:mm")}</TableCell>
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

function StatCard({ label, value, icon: Icon, accent }: { label: string; value: number | string; icon: React.ComponentType<{ className?: string }>; accent?: "amber" | "emerald" }) {
  const color = accent === "emerald" ? "text-emerald-700" : accent === "amber" ? "text-amber-700" : "text-[var(--primary-800)]";
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-text)]">{label}</div>
            <div className={"mt-1 font-display text-3xl font-black " + color}>{value}</div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-[var(--surface-100)] flex items-center justify-center">
            <Icon className={"w-5 h-5 " + color} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
