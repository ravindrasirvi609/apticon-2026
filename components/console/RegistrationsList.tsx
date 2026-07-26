"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { format } from "date-fns";
import PageHeader from "@/components/console/PageHeader";
import RegistrationStatusBadge from "@/components/console/RegistrationStatusBadge";
import { Card, CardContent } from "@/components/ui/shadcn/card";
import { Input } from "@/components/ui/shadcn/input";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/shadcn/table";
import { Button } from "@/components/ui/shadcn/button";
import { Badge } from "@/components/ui/shadcn/badge";

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
}

const STATUSES = ["", "payment_review", "approved", "rejected"] as const;

const STATUS_LABEL: Record<string, string> = {
  "":               "All",
  payment_review:   "Pending",
  approved:         "Approved",
  rejected:         "Rejected",
};

interface Props {
  detailBase: string; // e.g. "/admin/registrations" or "/approver/registrations"
  title?: string;
  description?: string;
}

export default function RegistrationsList({ detailBase, title = "Registrations", description = "All delegate registrations." }: Props) {
  const [items, setItems] = useState<RegItem[]>([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("payment_review");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (q) params.set("q", q);
    fetch(`/api/registrations?${params.toString()}`)
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
      <PageHeader title={title} description={description} />

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-text)]" />
              <Input placeholder="Search name, code, email, transaction, institution…" className="pl-9" value={q} onChange={(e) => setQ(e.target.value)} />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {STATUSES.map((s) => (
                <Button
                  key={s || "all"}
                  variant={status === s ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatus(s)}
                >
                  {STATUS_LABEL[s] ?? s}
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
                      <Link href={`${detailBase}/${r._id}`} className="text-[var(--crimson-800)] hover:underline font-semibold">
                        {r.fullName}
                      </Link>
                      <div className="text-xs text-[var(--muted-text)]">{r.email}</div>
                    </TableCell>
                    <TableCell className="text-xs">{r.institution}</TableCell>
                    <TableCell className="text-xs">{r.category}</TableCell>
                    <TableCell className="text-xs">
                      <div>₹{r.feeAmount.toLocaleString("en-IN")}</div>
                      <div className="text-[10px] uppercase tracking-wider text-[var(--muted-text)]">{r.feeTier.replace("_", " ")}</div>
                    </TableCell>
                    <TableCell className="text-xs uppercase">{r.paymentMode.replace("_", "/")}</TableCell>
                    <TableCell>
                      {r.linkedAbstract
                        ? <Badge variant="success" className="text-[10px]">Linked</Badge>
                        : <Badge variant="secondary" className="text-[10px]">—</Badge>}
                    </TableCell>
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
