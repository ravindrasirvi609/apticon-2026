"use client";
import { useEffect, useState } from "react";
import { Award, BadgeCheck, Package, UserCheck, Users } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import PageHeader from "@/components/console/PageHeader";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/shadcn/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/shadcn/table";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/shadcn/tabs";
import { Input } from "@/components/ui/shadcn/input";
import { Button } from "@/components/ui/shadcn/button";

interface DashboardStats {
  totalRegistered: number;
  checkedIn: number;
  idCardIssued: number;
  kitDistributed: number;
  certificatesDistributed: number;
  breakfast: Record<string, number>;
  lunch: Record<string, number>;
  dinner: Record<string, number>;
}

interface ReportItem {
  registration: {
    registrationCode: string;
    fullName: string;
    email: string;
    phone: string;
    institution: string;
  } | null;
  day: number;
  device: string;
  at: string;
  by: string;
}

interface ReportData {
  total: number;
  page: number;
  limit: number;
  items: ReportItem[];
}

const REPORT_TABS: { value: string; label: string; dayScoped: boolean }[] = [
  { value: "checked-in", label: "Checked In", dayScoped: false },
  { value: "id-card", label: "ID Card", dayScoped: false },
  { value: "breakfast", label: "Breakfast", dayScoped: true },
  { value: "lunch", label: "Lunch", dayScoped: true },
  { value: "dinner", label: "Dinner", dayScoped: true },
  { value: "kit", label: "Kit", dayScoped: false },
  { value: "certificate", label: "Certificate", dayScoped: false },
];

export default function CheckinClient() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activeTab, setActiveTab] = useState("checked-in");
  const [day, setDay] = useState(1);
  const [page, setPage] = useState(1);
  const [report, setReport] = useState<ReportData | null>(null);
  const [reportLoading, setReportLoading] = useState(true);

  const activeTabDef =
    REPORT_TABS.find((t) => t.value === activeTab) ?? REPORT_TABS[0];

  useEffect(() => {
    fetch("/api/admin/checkin/stats")
      .then((r) => r.json())
      .then(setStats)
      .catch(() => toast.error("Failed to load check-in stats"));
  }, []);

  useEffect(() => {
    setReportLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "25" });
    if (activeTabDef.dayScoped) params.set("day", String(day));
    fetch(`/api/admin/checkin/reports/${activeTab}?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setReport(data);
      })
      .catch((e) =>
        toast.error(e instanceof Error ? e.message : "Failed to load report"),
      )
      .finally(() => setReportLoading(false));
  }, [activeTab, day, page, activeTabDef.dayScoped]);

  function selectTab(value: string) {
    setActiveTab(value);
    setPage(1);
  }

  return (
    <div className="p-4 md:p-8">
      <PageHeader
        title="Check-in Activity"
        description="Live attendee check-in, ID card, meal, kit & certificate distribution recorded by the staff mobile app."
      />

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <StatCard
          label="Total Registered"
          value={stats?.totalRegistered ?? "—"}
          icon={Users}
        />
        <StatCard
          label="Checked In"
          value={stats?.checkedIn ?? 0}
          icon={UserCheck}
          accent="emerald"
        />
        <StatCard
          label="ID Cards Issued"
          value={stats?.idCardIssued ?? 0}
          icon={BadgeCheck}
        />
        <StatCard
          label="Kit Distributed"
          value={stats?.kitDistributed ?? 0}
          icon={Package}
        />
        <StatCard
          label="Certificates Issued"
          value={stats?.certificatesDistributed ?? 0}
          icon={Award}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <MealByDayCard
          title="Breakfast by Day"
          counts={stats?.breakfast}
          total={stats?.checkedIn}
        />
        <MealByDayCard
          title="Lunch by Day"
          counts={stats?.lunch}
          total={stats?.checkedIn}
        />
        <MealByDayCard
          title="Dinner by Day"
          counts={stats?.dinner}
          total={stats?.checkedIn}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={selectTab}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <TabsList className="flex-wrap h-auto">
                {REPORT_TABS.map((t) => (
                  <TabsTrigger key={t.value} value={t.value}>
                    {t.label}
                  </TabsTrigger>
                ))}
              </TabsList>
              {activeTabDef.dayScoped && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-[var(--muted-text)]">Day</span>
                  <Input
                    type="number"
                    min={1}
                    className="w-20"
                    value={day}
                    onChange={(e) => {
                      setDay(Math.max(1, Number(e.target.value) || 1));
                      setPage(1);
                    }}
                  />
                </div>
              )}
            </div>

            <TabsContent value={activeTab}>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Registration Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Institution</TableHead>
                    {activeTabDef.dayScoped && <TableHead>Day</TableHead>}
                    <TableHead>When</TableHead>
                    <TableHead>By</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportLoading ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center py-8 text-sm text-[var(--muted-text)]"
                      >
                        Loading…
                      </TableCell>
                    </TableRow>
                  ) : !report || report.items.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center py-8 text-sm text-[var(--muted-text)]"
                      >
                        No records yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    report.items.map((item, i) => (
                      <TableRow
                        key={`${item.registration?.registrationCode ?? "deleted-registration"}-${i}`}
                      >
                        <TableCell className="font-mono text-xs">
                          {item.registration?.registrationCode ??
                            "Deleted registration"}
                        </TableCell>
                        <TableCell>
                          {item.registration ? (
                            <>
                              <div className="text-sm font-medium">
                                {item.registration.fullName}
                              </div>
                              <div className="text-xs text-[var(--muted-text)]">
                                {item.registration.email}
                              </div>
                            </>
                          ) : (
                            <div className="text-sm text-[var(--muted-text)]">
                              Registration record unavailable
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-sm">
                          {item.registration?.institution ?? "—"}
                        </TableCell>
                        {activeTabDef.dayScoped && (
                          <TableCell className="text-sm">{item.day}</TableCell>
                        )}
                        <TableCell className="text-xs text-[var(--muted-text)]">
                          {format(new Date(item.at), "d MMM, HH:mm")}
                        </TableCell>
                        <TableCell className="text-sm">{item.by}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              {report && report.total > report.limit && (
                <div className="flex items-center justify-between mt-4">
                  <span className="text-xs text-[var(--muted-text)]">
                    {(page - 1) * report.limit + 1}–
                    {Math.min(page * report.limit, report.total)} of{" "}
                    {report.total}
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => p - 1)}
                    >
                      Prev
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page * report.limit >= report.total}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: number | string;
  icon: React.ComponentType<{ className?: string }>;
  accent?: "emerald";
}) {
  const color =
    accent === "emerald" ? "text-emerald-700" : "text-[var(--primary-800)]";
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-text)]">
              {label}
            </div>
            <div className={"mt-1 font-display text-3xl font-black " + color}>
              {value}
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-[var(--surface-100)] flex items-center justify-center">
            <Icon className={"w-5 h-5 " + color} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function MealByDayCard({
  title,
  counts,
  total,
}: {
  title: string;
  counts?: Record<string, number>;
  total?: number;
}) {
  const days = Object.keys(counts ?? {}).sort((a, b) => Number(a) - Number(b));
  const max = Math.max(1, total ?? 1, ...days.map((d) => counts?.[d] ?? 0));
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {days.map((d) => (
            <div key={d}>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-[var(--dark-text)]">Day {d}</span>
                <span className="font-semibold">{counts?.[d] ?? 0}</span>
              </div>
              <div className="h-1.5 bg-[var(--surface-100)] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[var(--primary-800)] rounded-full"
                  style={{
                    width: `${Math.min(100, ((counts?.[d] ?? 0) / max) * 100)}%`,
                  }}
                />
              </div>
            </div>
          ))}
          {days.length === 0 && (
            <p className="text-sm text-[var(--muted-text)]">No data yet.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
