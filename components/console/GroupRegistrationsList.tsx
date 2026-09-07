"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { format } from "date-fns";
import PageHeader from "@/components/console/PageHeader";
import { Card, CardContent } from "@/components/ui/shadcn/card";
import { Input } from "@/components/ui/shadcn/input";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/shadcn/table";
import { Button } from "@/components/ui/shadcn/button";
import { Badge } from "@/components/ui/shadcn/badge";

interface GroupItem {
  _id: string;
  groupCode: string;
  coordinatorName: string;
  coordinatorEmail: string;
  institution: string;
  category: string;
  delegateCount: number;
  complimentaryCount: number;
  feeAmount: number;
  feeTier: string;
  status: string;
  paymentStatus?: string;
  createdAt: string;
}

const STATUSES = [
  "",
  "submitted",
  "payment_review",
  "approved",
  "rejected",
] as const;

const STATUS_LABEL: Record<
  string,
  {
    label: string;
    variant: "info" | "warning" | "success" | "danger" | "secondary";
  }
> = {
  "": { label: "All", variant: "secondary" },
  submitted: { label: "Awaiting Payment", variant: "info" },
  payment_review: { label: "Pending Review", variant: "warning" },
  approved: { label: "Approved", variant: "success" },
  rejected: { label: "Rejected", variant: "danger" },
};

interface Props {
  detailBase: string; // e.g. "/admin/group-registrations"
  title?: string;
  description?: string;
}

export default function GroupRegistrationsList({
  detailBase,
  title = "Group Registrations",
  description = "Bulk institutional bookings awaiting review or already decided.",
}: Props) {
  const [items, setItems] = useState<GroupItem[]>([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("");
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (q) params.set("q", q);
    fetch(`/api/group-registrations?${params.toString()}`)
      .then((r) => r.json())
      .then((d) => {
        setItems(d.items ?? []);
        setCounts(d.counts ?? {});
      })
      .finally(() => setLoading(false));
  }, [q, status]);

  return (
    <div className="p-4 md:p-8">
      <PageHeader title={title} description={description} />

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-text)]" />
              <Input
                placeholder="Search coordinator, group code, email, institution…"
                className="pl-9"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {STATUSES.map((s) => (
                <Button
                  key={s || "all"}
                  variant={status === s ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatus(s)}
                >
                  {STATUS_LABEL[s]?.label ?? s}
                  <span className="ml-1 text-xs opacity-70">
                    ({counts[s] ?? 0})
                  </span>
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
                <TableHead>Group Code</TableHead>
                <TableHead>Coordinator</TableHead>
                <TableHead>Institution</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Delegates</TableHead>
                <TableHead>Fee</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center text-sm py-8 text-[var(--muted-text)]"
                  >
                    Loading…
                  </TableCell>
                </TableRow>
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center text-sm py-8 text-[var(--muted-text)]"
                  >
                    No group registrations match your filters.
                  </TableCell>
                </TableRow>
              ) : (
                items.map((g) => (
                  <TableRow key={g._id}>
                    <TableCell className="font-mono text-xs">
                      {g.groupCode}
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`${detailBase}/${g._id}`}
                        className="text-[var(--primary-800)] hover:underline font-semibold"
                      >
                        {g.coordinatorName}
                      </Link>
                      <div className="text-xs text-[var(--muted-text)]">
                        {g.coordinatorEmail}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs">{g.institution}</TableCell>
                    <TableCell className="text-xs">{g.category}</TableCell>
                    <TableCell className="text-xs">
                      {g.delegateCount}{" "}
                      <span className="text-[var(--muted-text)]">
                        ({g.complimentaryCount} free)
                      </span>
                    </TableCell>
                    <TableCell className="text-xs">
                      <div>₹{g.feeAmount.toLocaleString("en-IN")}</div>
                      <div className="text-[10px] uppercase tracking-wider text-[var(--muted-text)]">
                        {g.feeTier.replace("_", " ")}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={STATUS_LABEL[g.status]?.variant ?? "secondary"}
                      >
                        {STATUS_LABEL[g.status]?.label ?? g.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-[var(--muted-text)]">
                      {format(new Date(g.createdAt), "d MMM, HH:mm")}
                    </TableCell>
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
