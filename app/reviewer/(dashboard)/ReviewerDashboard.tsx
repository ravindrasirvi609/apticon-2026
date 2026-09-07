"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { FileText, ClipboardCheck } from "lucide-react";
import PageHeader from "@/components/console/PageHeader";
import StatusBadge from "@/components/console/StatusBadge";
import { Card, CardContent } from "@/components/ui/shadcn/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/shadcn/table";
import { Badge } from "@/components/ui/shadcn/badge";

interface Assigned {
  _id: string;
  submissionCode: string;
  title: string;
  theme: string;
  type: string;
  status: string;
  createdAt: string;
}

export default function ReviewerDashboard() {
  const [items, setItems] = useState<Assigned[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/abstracts")
      .then((r) => r.json())
      .then((d) => setItems(d.items ?? []))
      .finally(() => setLoading(false));
  }, []);

  const pending = useMemo(
    () =>
      items.filter((i) => i.status !== "accepted" && i.status !== "rejected")
        .length,
    [items],
  );

  return (
    <div className="p-4 md:p-8">
      <PageHeader
        title="My Dashboard"
        description="Abstracts assigned to you for review."
      />

      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-xs uppercase tracking-wider text-[var(--muted-text)]">
              Total assigned
            </div>
            <div className="font-display text-3xl font-black text-[var(--primary-800)]">
              {items.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-xs uppercase tracking-wider text-[var(--muted-text)]">
              Awaiting your review
            </div>
            <div className="font-display text-3xl font-black text-[var(--primary-800)]">
              {pending}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Theme</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Assigned on</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-sm text-[var(--muted-text)]"
                  >
                    Loading…
                  </TableCell>
                </TableRow>
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-sm text-[var(--muted-text)]"
                  >
                    Nothing assigned yet.
                  </TableCell>
                </TableRow>
              ) : (
                items.map((a) => (
                  <TableRow key={a._id}>
                    <TableCell className="font-mono text-xs">
                      {a.submissionCode}
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/reviewer/abstracts/${a._id}`}
                        className="text-[var(--primary-800)] hover:underline"
                      >
                        {a.title.length > 60
                          ? a.title.slice(0, 60) + "…"
                          : a.title}
                      </Link>
                    </TableCell>
                    <TableCell className="text-xs">{a.theme}</TableCell>
                    <TableCell className="text-xs capitalize">
                      {a.type}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={a.status} />
                    </TableCell>
                    <TableCell className="text-xs text-[var(--muted-text)]">
                      {format(new Date(a.createdAt), "d MMM")}
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
