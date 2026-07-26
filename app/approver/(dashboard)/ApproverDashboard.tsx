"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { ClipboardCheck, CheckCircle2, XCircle, Clock } from "lucide-react";
import PageHeader from "@/components/console/PageHeader";
import RegistrationStatusBadge from "@/components/console/RegistrationStatusBadge";
import { Card, CardContent } from "@/components/ui/shadcn/card";
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
  transactionNumber: string;
}

export default function ApproverDashboard() {
  const [items, setItems] = useState<RegItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch("/api/registrations?status=payment_review")
      .then((r) => r.json())
      .then((d) => setItems(d.items ?? []))
      .finally(() => setLoading(false));
  }, []);

  const counts = useMemo(() => {
    const pending = items.length;
    return { pending };
  }, [items]);

  return (
    <div className="p-4 md:p-8">
      <PageHeader title="Approver Dashboard" description="Registrations awaiting payment verification." />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Awaiting review" value={counts.pending} icon={Clock} />
        <StatCard label="Today" value={items.filter((r) => new Date(r.createdAt) >= startOfToday()).length} icon={ClipboardCheck} />
        <StatCard label="Approved (all time)" value="—" icon={CheckCircle2} muted />
        <StatCard label="Rejected (all time)" value="—" icon={XCircle} muted />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Fee</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Transaction #</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={8} className="text-center py-8 text-sm text-[var(--muted-text)]">Loading…</TableCell></TableRow>
              ) : items.length === 0 ? (
                <TableRow><TableCell colSpan={8} className="text-center py-8 text-sm text-[var(--muted-text)]">Nothing to review right now.</TableCell></TableRow>
              ) : (
                items.map((r) => (
                  <TableRow key={r._id}>
                    <TableCell className="font-mono text-xs">{r.registrationCode}</TableCell>
                    <TableCell>
                      <Link href={`/approver/registrations/${r._id}`} className="text-[var(--crimson-800)] hover:underline font-semibold">
                        {r.fullName}
                      </Link>
                      <div className="text-xs text-[var(--muted-text)]">{r.email}</div>
                    </TableCell>
                    <TableCell className="text-xs">{r.category}</TableCell>
                    <TableCell className="text-xs">₹{r.feeAmount.toLocaleString("en-IN")}</TableCell>
                    <TableCell className="text-xs uppercase">{r.paymentMode.replace("_", "/")}</TableCell>
                    <TableCell className="text-xs font-mono">{r.transactionNumber}</TableCell>
                    <TableCell><RegistrationStatusBadge status={r.status} /></TableCell>
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

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function StatCard({ label, value, icon: Icon, muted }: { label: string; value: number | string; icon: React.ComponentType<{ className?: string }>; muted?: boolean }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-text)]">{label}</div>
            <div className={"mt-1 font-display text-3xl font-black " + (muted ? "text-[var(--muted-text)]" : "text-[var(--crimson-800)]")}>{value}</div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-[var(--cream-100)] flex items-center justify-center">
            <Icon className="w-5 h-5 text-[var(--crimson-800)]" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
