"use client";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import PageHeader from "@/components/console/PageHeader";
import { Card, CardContent } from "@/components/ui/shadcn/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/shadcn/table";
import { Button } from "@/components/ui/shadcn/button";
import { Badge } from "@/components/ui/shadcn/badge";

interface AuditRow {
  _id: string;
  actor: { name?: string; email?: string; role?: string } | string | null;
  actorRole: string;
  action: string;
  resourceType: string;
  resourceId: string | null;
  details: unknown;
  ip: string;
  createdAt: string;
}

const RESOURCE_TYPES = ["", "user", "abstract", "review", "auth"];
const ACTOR_ROLES = ["", "super_admin", "reviewer", "public", "system"];

export default function AuditClient() {
  const [items, setItems] = useState<AuditRow[]>([]);
  const [resourceType, setResourceType] = useState("");
  const [actorRole, setActorRole] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (resourceType) params.set("resourceType", resourceType);
    if (actorRole) params.set("actorRole", actorRole);
    fetch(`/api/audit?${params.toString()}`)
      .then((r) => r.json())
      .then((d) => setItems(d.items ?? []))
      .finally(() => setLoading(false));
  }, [resourceType, actorRole]);

  return (
    <div className="p-4 md:p-8">
      <PageHeader title="Audit Log" description="Every action taken across the platform." />

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex flex-wrap gap-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-text)] self-center">Resource:</div>
              {RESOURCE_TYPES.map((s) => (
                <Button key={s || "all-res"} variant={resourceType === s ? "default" : "outline"} size="sm" onClick={() => setResourceType(s)}>
                  {s || "All"}
                </Button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-text)] self-center">Actor:</div>
              {ACTOR_ROLES.map((s) => (
                <Button key={s || "all-act"} variant={actorRole === s ? "default" : "outline"} size="sm" onClick={() => setActorRole(s)}>
                  {s ? s.replace("_", " ") : "All"}
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
                <TableHead>When</TableHead>
                <TableHead>Actor</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Resource</TableHead>
                <TableHead>IP</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-sm text-[var(--muted-text)]">Loading…</TableCell></TableRow>
              ) : items.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-sm text-[var(--muted-text)]">No matching entries.</TableCell></TableRow>
              ) : (
                items.map((row) => {
                  const actorName = row.actor && typeof row.actor === "object" && "name" in row.actor
                    ? (row.actor as { name?: string }).name
                    : null;
                  return (
                    <TableRow key={row._id}>
                      <TableCell className="text-xs whitespace-nowrap">{format(new Date(row.createdAt), "d MMM yyyy, HH:mm:ss")}</TableCell>
                      <TableCell className="text-sm">
                        <div className="font-semibold">{actorName ?? "—"}</div>
                        <Badge variant="outline" className="text-[10px] mt-0.5">{row.actorRole}</Badge>
                      </TableCell>
                      <TableCell className="text-sm font-mono">{row.action}</TableCell>
                      <TableCell className="text-sm">
                        <div>{row.resourceType}</div>
                        {row.resourceId && <div className="text-[10px] font-mono text-[var(--muted-text)]">{row.resourceId.slice(-8)}</div>}
                      </TableCell>
                      <TableCell className="text-xs font-mono text-[var(--muted-text)]">{row.ip}</TableCell>
                      <TableCell className="text-xs max-w-md">
                        {row.details ? (
                          <details>
                            <summary className="cursor-pointer text-[var(--crimson-800)] hover:underline">view</summary>
                            <pre className="mt-2 p-2 bg-[var(--cream-50)] rounded text-[10px] overflow-x-auto whitespace-pre-wrap break-all">
                              {JSON.stringify(row.details, null, 2)}
                            </pre>
                          </details>
                        ) : "—"}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
