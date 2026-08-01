"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { FileText, Users, CheckCircle2, Clock, ClipboardCheck, IndianRupee } from "lucide-react";
import PageHeader from "@/components/console/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/shadcn/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/shadcn/table";
import StatusBadge from "@/components/console/StatusBadge";
import RegistrationStatusBadge from "@/components/console/RegistrationStatusBadge";
import { format } from "date-fns";

interface Stats {
  totals: { abstracts: number; registrations: number; users: number; activeReviewers: number; activeEditorial: number; reviews: number; revenue: number };
  abstractsByStatus: Record<string, number>;
  registrationsByStatus: Record<string, number>;
  paymentsByStatus: Record<string, number>;
  byTheme: { theme: string; count: number }[];
  recentAbstracts: { id: string; submissionCode: string; title: string; presentingAuthor: string; status: string; createdAt: string }[];
  recentRegistrations: { id: string; registrationCode: string; fullName: string; email: string; status: string; paymentStatus?: string | null; feeAmount: number; createdAt: string }[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {});
  }, []);

  return (
    <div className="p-4 md:p-8">
      <PageHeader title="Dashboard" description="Snapshot of registrations and abstract review pipeline." />

      {/* Row 1 — registration metrics. Payments are confirmed by Razorpay, so "Awaiting Payment"
          is incomplete checkouts rather than a queue anyone has to work through. */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <StatCard label="Registrations" value={stats?.totals.registrations ?? "—"} icon={ClipboardCheck} />
        <StatCard
          label="Awaiting Payment"
          value={stats?.registrationsByStatus.submitted ?? 0}
          icon={Clock}
          accent="amber"
          sub={stats?.paymentsByStatus.failed ? `${stats.paymentsByStatus.failed} failed` : undefined}
        />
        <StatCard label="Approved · Paid" value={stats?.registrationsByStatus.approved ?? 0} icon={CheckCircle2} accent="emerald" />
        <StatCard label="Revenue" value={stats ? "₹" + (stats.totals.revenue ?? 0).toLocaleString("en-IN") : "—"} icon={IndianRupee} />
      </div>

      {/* Row 2 — abstract metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Abstracts"       value={stats?.totals.abstracts ?? "—"} icon={FileText} />
        <StatCard label="Under Review"    value={stats?.abstractsByStatus.under_review ?? 0} icon={Clock} accent="amber" />
        <StatCard label="Accepted"        value={stats?.abstractsByStatus.accepted ?? 0} icon={CheckCircle2} accent="emerald" />
        <StatCard label="Active Reviewers" value={stats?.totals.activeReviewers ?? 0} icon={Users} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader><CardTitle>Recent Registrations</CardTitle></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>When</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(stats?.recentRegistrations ?? []).map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-mono text-xs">{r.registrationCode}</TableCell>
                    <TableCell>
                      <Link href={`/admin/registrations/${r.id}`} className="text-[var(--crimson-800)] hover:underline">{r.fullName}</Link>
                      <div className="text-xs text-[var(--muted-text)]">{r.email}</div>
                    </TableCell>
                    <TableCell><RegistrationStatusBadge status={r.status} paymentStatus={r.paymentStatus ?? undefined} /></TableCell>
                    <TableCell className="text-xs text-[var(--muted-text)]">{format(new Date(r.createdAt), "d MMM, HH:mm")}</TableCell>
                  </TableRow>
                ))}
                {stats && stats.recentRegistrations.length === 0 && (
                  <TableRow><TableCell colSpan={4} className="text-center text-sm text-[var(--muted-text)] py-6">No registrations yet.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Recent Abstracts</CardTitle></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>When</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(stats?.recentAbstracts ?? []).map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-mono text-xs">{r.submissionCode}</TableCell>
                    <TableCell>
                      <Link href={`/admin/abstracts/${r.id}`} className="text-[var(--crimson-800)] hover:underline">
                        {r.title.length > 40 ? r.title.slice(0, 40) + "…" : r.title}
                      </Link>
                    </TableCell>
                    <TableCell><StatusBadge status={r.status} /></TableCell>
                    <TableCell className="text-xs text-[var(--muted-text)]">{format(new Date(r.createdAt), "d MMM, HH:mm")}</TableCell>
                  </TableRow>
                ))}
                {stats && stats.recentAbstracts.length === 0 && (
                  <TableRow><TableCell colSpan={4} className="text-center text-sm text-[var(--muted-text)] py-6">No abstracts yet.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Abstracts by Theme</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {(stats?.byTheme ?? []).map((t) => (
              <div key={t.theme}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-[var(--dark-text)]">{t.theme}</span>
                  <span className="font-semibold">{t.count}</span>
                </div>
                <div className="h-1.5 bg-[var(--cream-100)] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[var(--crimson-800)] rounded-full"
                    style={{ width: `${Math.min(100, (t.count / Math.max(1, stats?.totals.abstracts ?? 1)) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
            {stats && stats.byTheme.length === 0 && <p className="text-sm text-[var(--muted-text)]">No data yet.</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, accent, sub }: { label: string; value: number | string; icon: React.ComponentType<{ className?: string }>; accent?: "amber" | "emerald"; sub?: string }) {
  const color = accent === "emerald" ? "text-emerald-700" : accent === "amber" ? "text-amber-700" : "text-[var(--crimson-800)]";
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-text)]">{label}</div>
            <div className={"mt-1 font-display text-3xl font-black " + color}>{value}</div>
            {sub && <div className="mt-0.5 text-xs text-red-700">{sub}</div>}
          </div>
          <div className="w-10 h-10 rounded-lg bg-[var(--cream-100)] flex items-center justify-center">
            <Icon className={"w-5 h-5 " + color} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
