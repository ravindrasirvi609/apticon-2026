"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Search, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import PageHeader from "@/components/console/PageHeader";
import RegistrationStatusBadge from "@/components/console/RegistrationStatusBadge";
import DelegatePhoto from "@/components/ui/DelegatePhoto";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/shadcn/alert-dialog";
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
  "": "All",
  submitted: "Awaiting Payment",
  approved: "Approved",
  rejected: "Rejected",
  payment_review: "Legacy Review",
};

interface Props {
  detailBase: string; // e.g. "/admin/registrations" or "/editorial/registrations"
  title?: string;
  description?: string;
  canDelete?: boolean;
}

export default function RegistrationsList({
  detailBase,
  title = "Registrations",
  description = "All delegate registrations.",
  canDelete = false,
}: Props) {
  const [items, setItems] = useState<RegItem[]>([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("");
  const [state, setState] = useState("");
  const [category, setCategory] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [institution, setInstitution] = useState("");
  const [city, setCity] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [stateCounts, setStateCounts] = useState<Record<string, number>>({});
  const [categories, setCategories] = useState<string[]>([]);
  const [institutions, setInstitutions] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (state) params.set("state", state);
    if (category) params.set("category", category);
    if (paymentStatus) params.set("paymentStatus", paymentStatus);
    if (institution) params.set("institution", institution);
    if (city) params.set("city", city);
    if (q) params.set("q", q);
    params.set("page", String(page));
    params.set("limit", String(limit));
    fetch(`/api/registrations?${params.toString()}`)
      .then((r) => r.json())
      .then((d) => {
        setItems(d.items ?? []);
        setCounts(d.counts ?? {});
        setStateCounts(d.stateCounts ?? {});
        setCategories(d.categories ?? []);
        setInstitutions(d.institutions ?? []);
        setCities(d.cities ?? []);
        setTotal(d.total ?? 0);
        setTotalPages(d.totalPages ?? 1);
      })
      .finally(() => setLoading(false));
  }, [q, status, state, category, paymentStatus, institution, city, page, limit]);

  const updateFilter = (setter: (value: string) => void, value: string) => {
    setter(value);
    setPage(1);
  };

  const deleteRegistration = async (r: RegItem) => {
    try {
      const res = await fetch(`/api/registrations/${r._id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success(`Deleted registration ${r.registrationCode}`);
        setItems((prev) => prev.filter((item) => item._id !== r._id));
        setTotal((t) => Math.max(0, t - 1));
      } else {
        const body = await res.json().catch(() => ({}));
        toast.error(body.error || "Failed to delete registration");
      }
    } catch {
      toast.error("Failed to delete registration");
    }
  };

  const exportQuery = new URLSearchParams({
    ...(q ? { q } : {}),
    ...(status ? { status } : {}),
    ...(state ? { state } : {}),
    ...(category ? { category } : {}),
    ...(paymentStatus ? { paymentStatus } : {}),
    ...(institution ? { institution } : {}),
    ...(city ? { city } : {}),
  }).toString();

  // The legacy manual-review chip only earns its space while such records still exist.
  const chips = useMemo(
    () =>
      counts.payment_review ? [...STATUSES, "payment_review"] : [...STATUSES],
    [counts.payment_review],
  );

  return (
    <div className="p-4 md:p-8">
      <PageHeader
        title={title}
        description={description}
        actions={
          <ExportButtons
            endpoint="/api/registrations/export"
            query={exportQuery}
            label="Registrations"
          />
        }
      />

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-text)]" />
              <Input
                placeholder="Search name, code, email, transaction, institution…"
                className="pl-9"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
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
                  <span className="ml-1 text-xs opacity-70">
                    ({counts[s] ?? 0})
                  </span>
                </Button>
              ))}
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <select className="h-9 rounded-md border bg-white px-3 text-sm" value={state} onChange={(e) => updateFilter(setState, e.target.value)}>
              <option value="">All states</option>
              {Object.entries(stateCounts).map(([name, count]) => <option key={name} value={name}>{name} ({count})</option>)}
            </select>
            <select className="h-9 rounded-md border bg-white px-3 text-sm" value={category} onChange={(e) => updateFilter(setCategory, e.target.value)}>
              <option value="">All categories</option>
              {categories.map((name) => <option key={name} value={name}>{name}</option>)}
            </select>
            <select className="h-9 rounded-md border bg-white px-3 text-sm" value={paymentStatus} onChange={(e) => updateFilter(setPaymentStatus, e.target.value)}>
              <option value="">All payment statuses</option>
              {['pending', 'authorized', 'captured', 'failed', 'refunded'].map((name) => <option key={name} value={name}>{name}</option>)}
            </select>
            <select className="h-9 rounded-md border bg-white px-3 text-sm" value={institution} onChange={(e) => updateFilter(setInstitution, e.target.value)}>
              <option value="">All institutions</option>
              {institutions.map((name) => <option key={name} value={name}>{name}</option>)}
            </select>
            <select className="h-9 rounded-md border bg-white px-3 text-sm" value={city} onChange={(e) => updateFilter(setCity, e.target.value)}>
              <option value="">All cities</option>
              {cities.map((name) => <option key={name} value={name}>{name}</option>)}
            </select>
            {(state || category || paymentStatus || institution || city) && <Button variant="ghost" size="sm" onClick={() => { setState(""); setCategory(""); setPaymentStatus(""); setInstitution(""); setCity(""); setPage(1); }}>Clear filters</Button>}
          </div>
          <div className="mt-4 flex flex-wrap gap-2 text-xs text-[var(--muted-text)]">
            {Object.entries(stateCounts).slice(0, 8).map(([name, count]) => <Badge key={name} variant="secondary">{name}: {count}</Badge>)}
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
                {canDelete && <TableHead className="text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={canDelete ? 10 : 9}
                    className="text-center text-sm py-8 text-[var(--muted-text)]"
                  >
                    Loading…
                  </TableCell>
                </TableRow>
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={canDelete ? 10 : 9}
                    className="text-center text-sm py-8 text-[var(--muted-text)]"
                  >
                    No registrations match your filters.
                  </TableCell>
                </TableRow>
              ) : (
                items.map((r) => (
                  <TableRow key={r._id}>
                    <TableCell className="font-mono text-xs">
                      {r.registrationCode}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <DelegatePhoto
                          url={r.photoUrl}
                          name={r.fullName}
                          size={32}
                        />
                        <div className="min-w-0">
                          <Link
                            href={`${detailBase}/${r._id}`}
                            className="text-[var(--primary-800)] hover:underline font-semibold"
                          >
                            {r.fullName}
                          </Link>
                          <div className="text-xs text-[var(--muted-text)]">
                            {r.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs">{r.institution}</TableCell>
                    <TableCell className="text-xs">{r.category}</TableCell>
                    <TableCell className="text-xs">
                      <div>₹{r.feeAmount.toLocaleString("en-IN")}</div>
                      <div className="text-[10px] uppercase tracking-wider text-[var(--muted-text)]">
                        {r.feeTier.replace("_", " ")}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs">
                      <div className="uppercase">
                        {r.paymentMode === "razorpay"
                          ? "Razorpay"
                          : r.paymentMode.replace("_", "/")}
                      </div>
                      {r.paymentStatus && (
                        <div className="text-[10px] uppercase tracking-wider text-[var(--muted-text)]">
                          {r.paymentStatus}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {r.linkedAbstract ? (
                        <Badge variant="success" className="text-[10px]">
                          Linked
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-[10px]">
                          —
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <RegistrationStatusBadge
                        status={r.status}
                        paymentStatus={r.paymentStatus}
                      />
                    </TableCell>
                    <TableCell className="text-xs text-[var(--muted-text)]">
                      {format(new Date(r.createdAt), "d MMM, HH:mm")}
                    </TableCell>
                    {canDelete && (
                      <TableCell className="text-right">
                        {r.paymentStatus !== "captured" && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Delete registration?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete{" "}
                                  <strong>{r.registrationCode}</strong> (
                                  {r.fullName})? Payment for this
                                  registration was never confirmed. This
                                  action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-red-600 hover:bg-red-700"
                                  onClick={() => deleteRegistration(r)}
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-[var(--muted-text)]">
        <span>Showing {total === 0 ? 0 : (page - 1) * limit + 1}-{Math.min(page * limit, total)} of {total} registrations</span>
        <div className="flex items-center gap-2">
          <select className="h-8 rounded-md border bg-white px-2 text-sm" value={limit} onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}>
            {[25, 50, 100].map((size) => <option key={size} value={size}>{size} per page</option>)}
          </select>
          <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
          <span>Page {page} of {totalPages}</span>
          <Button size="sm" variant="outline" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
        </div>
      </div>
    </div>
  );
}
