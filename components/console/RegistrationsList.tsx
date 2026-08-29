"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { format } from "date-fns";
import PageHeader from "@/components/console/PageHeader";
import RegistrationStatusBadge from "@/components/console/RegistrationStatusBadge";
import DelegatePhoto from "@/components/ui/DelegatePhoto";
import { Card, CardContent } from "@/components/ui/shadcn/card";
import { Input } from "@/components/ui/shadcn/input";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/shadcn/table";
import { Button } from "@/components/ui/shadcn/button";
import { Badge } from "@/components/ui/shadcn/badge";
import ExportButtons from "@/components/console/ExportButtons";

interface RegItem {
  _id: string;
  registrationCode: string;
  fullName: string;
  email: string;
  institution: string;
  category: string;
  feeAmount: number;
  feeTier: string;
  status: string;
  createdAt: string;
  linkedAbstract?: string | null;
  paymentMode: string;
  transactionNumber: string;
  paymentStatus?: string;
  razorpayPaymentId?: string;
  paidAt?: string;
  photoUrl?: string;
}

const STATUSES = ["", "submitted", "approved", "rejected"] as const;

const STATUS_LABEL: Record<string, string> = {
  "":               "All",
  submitted:        "Awaiting Payment",
  approved:         "Approved",
  rejected:         "Rejected",
  payment_review:   "Legacy Review",
};

interface Props {
  detailBase: string; // e.g. "/admin/registrations" or "/editorial/registrations"
  title?: string;
  description?: string;
}

export default function RegistrationsList({ detailBase, title = "Registrations", description = "All delegate registrations." }: Props) {
  const [items, setItems] = useState<RegItem[]>([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("");
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (q) params.set("q", q);
    fetch(`/api/registrations?${params.toString()}`)
      .then((r) => r.json())
      .then((d) => {
        setItems(d.items ?? []);
        setCounts(d.counts ?? {});
      })
      .finally(() => setLoading(false));
  }, [q, status]);

  // The legacy manual-review chip only earns its space while such records still exist.
  const chips = useMemo(
    () => (counts.payment_review ? [...STATUSES, "payment_review"] : [...STATUSES]),
    [counts.payment_review]
  );

  return (
    <div className="p-4 md:p-8">
      <PageHeader title={title} description={description} actions={<ExportButtons endpoint="/api/registrations/export" query={new URLSearchParams({ ...(q ? { q } : {}), ...(status ? { status } : {}) }).toString()} label="Registrations" />} />

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-text)]" />
              <Input placeholder="Search name, code, email, transaction, institution…" className="pl-9" value={q} onChange={(e) => setQ(e.target.value)} />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {chips.map((s) => (
                <Button
                  key={s || "all"}
                  variant={status === s ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatus(s)}
                >
                  {STATUS_LABEL[s] ?? s}
                  <span className="ml-1 text-xs opacity-70">({counts[s] ?? 0})</span>
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
                <TableHead>Name</TableHead>
                <TableHead>Institution</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Fee</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Abstract?</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={9} className="text-center text-sm py-8 text-[var(--muted-text)]">Loading…</TableCell></TableRow>
              ) : items.length === 0 ? (
                <TableRow><TableCell colSpan={9} className="text-center text-sm py-8 text-[var(--muted-text)]">No registrations match your filters.</TableCell></TableRow>
              ) : (
                items.map((r) => (
                  <TableRow key={r._id}>
                    <TableCell className="font-mono text-xs">{r.registrationCode}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <DelegatePhoto url={r.photoUrl} name={r.fullName} size={32} />
                        <div className="min-w-0">
                          <Link href={`${detailBase}/${r._id}`} className="text-[var(--primary-800)] hover:underline font-semibold">
                            {r.fullName}
                          </Link>
                          <div className="text-xs text-[var(--muted-text)]">{r.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs">{r.institution}</TableCell>
                    <TableCell className="text-xs">{r.category}</TableCell>
                    <TableCell className="text-xs">
                      <div>₹{r.feeAmount.toLocaleString("en-IN")}</div>
                      <div className="text-[10px] uppercase tracking-wider text-[var(--muted-text)]">{r.feeTier.replace("_", " ")}</div>
                    </TableCell>
                    <TableCell className="text-xs">
                      <div className="uppercase">{r.paymentMode === "razorpay" ? "Razorpay" : r.paymentMode.replace("_", "/")}</div>
                      {r.paymentStatus && (
                        <div className="text-[10px] uppercase tracking-wider text-[var(--muted-text)]">{r.paymentStatus}</div>
                      )}
                    </TableCell>
                    <TableCell>
                      {r.linkedAbstract
                        ? <Badge variant="success" className="text-[10px]">Linked</Badge>
                        : <Badge variant="secondary" className="text-[10px]">—</Badge>}
                    </TableCell>
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
