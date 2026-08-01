"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Search, Mail, Loader2, UsersRound } from "lucide-react";
import { toast } from "sonner";
import PageHeader from "@/components/console/PageHeader";
import RegistrationStatusBadge from "@/components/console/RegistrationStatusBadge";
import StatusBadge from "@/components/console/StatusBadge";
import DelegatePhoto from "@/components/ui/DelegatePhoto";
import { Button } from "@/components/ui/shadcn/button";
import { Card, CardContent } from "@/components/ui/shadcn/card";
import { Input } from "@/components/ui/shadcn/input";
import { Badge } from "@/components/ui/shadcn/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/shadcn/table";
import { Checkbox } from "@/components/ui/shadcn/checkbox";

interface DelegateRow {
  email: string;
  name: string;
  institution?: string;
  photoUrl?: string;
  registration: {
    id: string;
    code: string;
    status: string;
    paymentStatus?: string;
    feeAmount: number;
    createdAt: string;
  } | null;
  abstracts: {
    id: string;
    submissionCode: string;
    title: string;
    status: string;
    createdAt: string;
  }[];
}

const FILTERS = [
  { key: "all",             label: "All" },
  { key: "both",            label: "Registered + Abstract" },
  { key: "registered_only", label: "Registered · No Abstract" },
  { key: "abstract_only",   label: "Abstract · Not Registered" },
  { key: "approved",        label: "Payment Approved" },
] as const;

type FilterKey = (typeof FILTERS)[number]["key"];

export default function DelegatesClient() {
  const [rows, setRows] = useState<DelegateRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterKey>("all");
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [sending, setSending] = useState(false);

  async function load() {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("filter", filter);
    if (q) params.set("q", q);
    const res = await fetch(`/api/admin/delegates?${params.toString()}`);
    if (res.ok) {
      const data = await res.json();
      setRows(data.rows ?? []);
      setSelected(new Set());
    }
    setLoading(false);
  }

  useEffect(() => { load(); }, [filter, q]);

  async function nudge(kind: "register" | "abstract") {
    if (selected.size === 0) {
      toast.error("Select at least one delegate.");
      return;
    }
    setSending(true);
    try {
      const res = await fetch("/api/admin/nudge", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ emails: [...selected], kind }),
      });
      const b = await res.json();
      if (!res.ok) throw new Error(b.error);
      toast.success(`Sent ${b.sent}${b.skipped ? ` · skipped ${b.skipped}` : ""}`);
      setSelected(new Set());
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setSending(false);
    }
  }

  const counts = useMemo(() => {
    return {
      total: rows.length,
      both: rows.filter((r) => r.registration && r.abstracts.length > 0).length,
      regOnly: rows.filter((r) => r.registration && r.abstracts.length === 0).length,
      absOnly: rows.filter((r) => !r.registration && r.abstracts.length > 0).length,
      approved: rows.filter((r) => r.registration?.status === "approved").length,
    };
  }, [rows]);

  const allChecked = rows.length > 0 && rows.every((r) => selected.has(r.email));

  function toggleAll() {
    if (allChecked) setSelected(new Set());
    else setSelected(new Set(rows.map((r) => r.email)));
  }

  function toggleOne(email: string) {
    const next = new Set(selected);
    if (next.has(email)) next.delete(email);
    else next.add(email);
    setSelected(next);
  }

  return (
    <div className="p-4 md:p-8">
      <PageHeader
        title="Delegates"
        description="One row per email — see who is registered, who has submitted abstracts, and where the gaps are."
        actions={<Badge variant="secondary"><UsersRound className="w-3 h-3 mr-1" />{counts.total} delegates</Badge>}
      />

      {/* Counts */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard label="Registered + Abstract" value={counts.both} />
        <MetricCard label="Registered · No Abstract" value={counts.regOnly} />
        <MetricCard label="Abstract · Not Registered" value={counts.absOnly} />
        <MetricCard label="Payment Approved" value={counts.approved} />
      </div>

      {/* Controls */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-text)]" />
              <Input placeholder="Search name, email, code, institution…" className="pl-9" value={q} onChange={(e) => setQ(e.target.value)} />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {FILTERS.map((f) => (
                <Button
                  key={f.key}
                  variant={filter === f.key ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter(f.key)}
                >
                  {f.label}
                </Button>
              ))}
            </div>
          </div>

          {selected.size > 0 && (
            <div className="mt-4 flex items-center justify-between gap-2 p-3 rounded-lg bg-[var(--cream-100)] border border-[var(--gold-500)]/25">
              <div className="text-sm font-semibold">{selected.size} selected</div>
              <div className="flex items-center gap-2 flex-wrap">
                <Button size="sm" variant="outline" onClick={() => nudge("register")} disabled={sending}>
                  {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                  Nudge to register
                </Button>
                <Button size="sm" variant="outline" onClick={() => nudge("abstract")} disabled={sending}>
                  {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                  Nudge to submit abstract
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setSelected(new Set())}>Clear</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8"><Checkbox checked={allChecked} onCheckedChange={toggleAll} /></TableHead>
                <TableHead>Name / Email</TableHead>
                <TableHead>Institution</TableHead>
                <TableHead>Registration</TableHead>
                <TableHead>Abstracts</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} className="text-center text-sm py-8 text-[var(--muted-text)]">Loading…</TableCell></TableRow>
              ) : rows.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center text-sm py-8 text-[var(--muted-text)]">No delegates match.</TableCell></TableRow>
              ) : (
                rows.map((r) => (
                  <TableRow key={r.email}>
                    <TableCell>
                      <Checkbox checked={selected.has(r.email)} onCheckedChange={() => toggleOne(r.email)} />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <DelegatePhoto url={r.photoUrl} name={r.name} size={32} />
                        <div className="min-w-0">
                          <div className="font-semibold text-sm">{r.name}</div>
                          <div className="text-xs text-[var(--muted-text)]">{r.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs">{r.institution ?? "—"}</TableCell>
                    <TableCell>
                      {r.registration ? (
                        <div>
                          <Link href={`/admin/registrations/${r.registration.id}`} className="text-xs font-mono text-[var(--crimson-800)] hover:underline">
                            {r.registration.code}
                          </Link>
                          <div className="mt-1"><RegistrationStatusBadge status={r.registration.status} paymentStatus={r.registration.paymentStatus} /></div>
                          <div className="text-[10px] text-[var(--muted-text)] mt-0.5">₹{r.registration.feeAmount.toLocaleString("en-IN")}</div>
                        </div>
                      ) : (
                        <Badge variant="danger">Not registered</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {r.abstracts.length === 0 ? (
                        <Badge variant="secondary">None</Badge>
                      ) : (
                        <div className="space-y-1">
                          {r.abstracts.map((a) => (
                            <div key={a.id}>
                              <Link href={`/admin/abstracts/${a.id}`} className="text-xs text-[var(--crimson-800)] hover:underline">
                                {a.submissionCode} — {a.title.length > 40 ? a.title.slice(0, 40) + "…" : a.title}
                              </Link>
                              <div className="mt-0.5"><StatusBadge status={a.status} /></div>
                            </div>
                          ))}
                        </div>
                      )}
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

function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-text)]">{label}</div>
        <div className="mt-1 font-display text-3xl font-black text-[var(--crimson-800)]">{value}</div>
      </CardContent>
    </Card>
  );
}
