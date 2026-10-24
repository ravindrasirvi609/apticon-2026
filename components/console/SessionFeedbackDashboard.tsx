"use client";

import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { MessageCircleQuestion, MessageSquareText, RefreshCw, Star } from "lucide-react";
import { toast } from "sonner";
import PageHeader from "@/components/console/PageHeader";
import { Badge } from "@/components/ui/shadcn/badge";
import { Button } from "@/components/ui/shadcn/button";
import { Card, CardContent } from "@/components/ui/shadcn/card";
import { Input } from "@/components/ui/shadcn/input";

interface SessionSummary {
  id: string;
  day: number;
  title: string;
  questions: number;
  feedback: number;
  averageRating: number | null;
}

interface SessionEntry {
  id: string;
  sessionId: string;
  sessionTitle: string;
  sessionDay: number | null;
  delegateName: string;
  registrationCode: string;
  institution: string;
  createdAt?: string;
  updatedAt?: string;
  text?: string;
  comment?: string;
  rating?: number;
  status?: string;
  isAnonymous?: boolean;
}

type View = "questions" | "feedback";

export default function SessionFeedbackDashboard() {
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [questions, setQuestions] = useState<SessionEntry[]>([]);
  const [feedback, setFeedback] = useState<SessionEntry[]>([]);
  const [view, setView] = useState<View>("questions");
  const [sessionId, setSessionId] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function load(isRefresh = false) {
    if (isRefresh) setRefreshing(true);
    try {
      const response = await fetch("/api/staff/session-feedback", { cache: "no-store" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error ?? "Could not load session feedback");
      setSessions(data.sessions ?? []);
      setQuestions(data.questions ?? []);
      setFeedback(data.feedback ?? []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not load session feedback");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    let cancelled = false;
    fetch("/api/staff/session-feedback", { cache: "no-store" })
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error ?? "Could not load session feedback");
        if (!cancelled) {
          setSessions(data.sessions ?? []);
          setQuestions(data.questions ?? []);
          setFeedback(data.feedback ?? []);
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) toast.error(error instanceof Error ? error.message : "Could not load session feedback");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const source = view === "questions" ? questions : feedback;
  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return source.filter((item) => {
      if (sessionId !== "all" && item.sessionId !== sessionId) return false;
      return !needle || [
        item.delegateName,
        item.registrationCode,
        item.institution,
        item.text,
        item.comment,
        item.sessionTitle,
      ].some((value) => value?.toLowerCase().includes(needle));
    });
  }, [source, sessionId, search]);

  return (
    <div className="p-4 md:p-8">
      <PageHeader
        title="Session Q&A & Feedback"
        description="Questions delegates asked during sessions and their session ratings and comments."
        actions={
          <Button variant="outline" onClick={() => void load(true)} disabled={refreshing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Metric label="Questions" value={questions.length} icon={<MessageCircleQuestion className="h-4 w-4" />} />
        <Metric label="Questions pending" value={questions.filter((item) => item.status === "pending").length} icon={<MessageCircleQuestion className="h-4 w-4" />} />
        <Metric label="Feedback entries" value={feedback.length} icon={<MessageSquareText className="h-4 w-4" />} />
        <Metric
          label="Overall session rating"
          value={feedback.length ? `${(feedback.reduce((sum, item) => sum + (item.rating ?? 0), 0) / feedback.length).toFixed(2)} / 5` : "—"}
          icon={<Star className="h-4 w-4" />}
        />
      </div>

      <Card className="mb-5">
        <CardContent className="p-4 md:p-5">
          <div className="mb-4 flex flex-wrap gap-2">
            {(["questions", "feedback"] as const).map((tab) => (
              <Button key={tab} variant={view === tab ? "default" : "outline"} onClick={() => setView(tab)}>
                {tab === "questions" ? <MessageCircleQuestion className="mr-2 h-4 w-4" /> : <MessageSquareText className="mr-2 h-4 w-4" />}
                {tab === "questions" ? `Questions (${questions.length})` : `Feedback (${feedback.length})`}
              </Button>
            ))}
          </div>
          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(240px,0.7fr)]">
            <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search delegate, institution, or text…" />
            <select
              value={sessionId}
              onChange={(event) => setSessionId(event.target.value)}
              className="h-10 rounded-md border border-[var(--surface-300)] bg-white px-3 text-sm"
              aria-label="Filter by session"
            >
              <option value="all">All sessions</option>
              {sessions.map((session) => (
                <option key={session.id} value={session.id}>
                  Day {session.day} · {session.title} ({view === "questions" ? session.questions : session.feedback})
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {sessionId === "all" && sessions.some((item) => item.questions || item.feedback) && (
        <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {sessions.filter((item) => item.questions || item.feedback).map((session) => (
            <button key={session.id} onClick={() => setSessionId(session.id)} className="text-left">
              <Card className="h-full transition-colors hover:border-[var(--accent-500)]">
                <CardContent className="p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-text)]">Day {session.day}</p>
                  <p className="mt-1 font-semibold">{session.title}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Badge variant="secondary">{session.questions} questions</Badge>
                    <Badge variant="secondary">{session.feedback} feedback</Badge>
                    {session.averageRating !== null && <Badge variant="outline">★ {session.averageRating} / 5</Badge>}
                  </div>
                </CardContent>
              </Card>
            </button>
          ))}
        </div>
      )}

      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-semibold">{view === "questions" ? "Delegate questions" : "Session feedback"}</h2>
        <span className="text-sm text-[var(--muted-text)]">{loading ? "Loading…" : `${filtered.length} entries`}</span>
      </div>
      <div className="space-y-3">
        {!loading && filtered.length === 0 && (
          <Card><CardContent className="p-8 text-center text-sm text-[var(--muted-text)]">No {view} found for this filter.</CardContent></Card>
        )}
        {filtered.map((item) => (
          <Card key={item.id}>
            <CardContent className="p-4 md:p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold">{view === "questions" ? item.text : <span>{"★".repeat(item.rating ?? 0)}{"☆".repeat(5 - (item.rating ?? 0))} <span className="ml-1">{item.rating}/5</span></span>}</p>
                  {view === "feedback" && item.comment && <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">{item.comment}</p>}
                </div>
                <div className="flex shrink-0 gap-2">
                  {view === "questions" && <Badge variant={item.status === "pending" ? "warning" : "secondary"}>{item.status}</Badge>}
                  {view === "questions" && item.isAnonymous && <Badge variant="outline">Anonymous to delegates</Badge>}
                </div>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-[var(--surface-200)] pt-3 text-xs text-[var(--muted-text)]">
                <span className="font-medium text-[var(--dark-text)]">{item.delegateName}</span>
                {item.registrationCode && <span>· {item.registrationCode}</span>}
                {item.institution && <span>· {item.institution}</span>}
                <span className="ml-auto">{item.sessionDay ? `Day ${item.sessionDay} · ` : ""}{item.sessionTitle}</span>
                <span>{(item.createdAt ?? item.updatedAt) ? format(new Date(item.createdAt ?? item.updatedAt!), "dd MMM yyyy, h:mm a") : ""}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function Metric({ label, value, icon }: { label: string; value: string | number; icon: React.ReactNode }) {
  return (
    <Card><CardContent className="flex items-center gap-3 p-4">
      <span className="rounded-lg bg-[var(--accent-500)]/10 p-2 text-[var(--accent-700)]">{icon}</span>
      <div><p className="text-xs text-[var(--muted-text)]">{label}</p><p className="text-xl font-bold">{value}</p></div>
    </CardContent></Card>
  );
}
