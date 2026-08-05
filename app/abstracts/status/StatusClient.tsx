"use client";
import { useState } from "react";
import { Search, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { Button } from "@/components/ui/shadcn/button";
import { Input } from "@/components/ui/shadcn/input";
import { Label } from "@/components/ui/shadcn/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/shadcn/card";
import { Badge } from "@/components/ui/shadcn/badge";
import GoldenBadge from "@/components/ui/GoldenBadge";

interface AbstractStatus {
  submissionCode: string;
  title: string;
  presentingAuthor: string;
  status: string;
  theme: string;
  type: string;
  createdAt: string;
  finalDecision?: string;
  finalDecisionAt?: string;
  finalDecisionNote?: string;
  abstractCode?: string;
  presentationType?: string;
}

const STATUS_VARIANT: Record<string, "info" | "warning" | "success" | "danger" | "secondary"> = {
  submitted: "info",
  under_review: "warning",
  accepted: "success",
  rejected: "danger",
  revision_requested: "warning",
  resubmitted: "info",
};

const STATUS_LABEL: Record<string, string> = {
  submitted: "Submitted",
  under_review: "Under Review",
  accepted: "Accepted",
  rejected: "Not Accepted",
  revision_requested: "Revision Requested",
  resubmitted: "Resubmitted",
};

export default function StatusClient() {
  const [code, setCode] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AbstractStatus | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/abstracts/status", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ code, email }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Not found");
        return;
      }
      setResult(data.abstract);
    } catch {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[80vh] px-4 py-16">
      <div className="max-w-2xl mx-auto text-center mb-8">
        <GoldenBadge>Submission Status</GoldenBadge>
        <h1 className="mt-6 font-display text-3xl md:text-4xl font-black text-[var(--crimson-800)]">
          Check Your Abstract Status
        </h1>
        <p className="mt-3 text-[var(--muted-text)]">Enter your submission code and email to view the current status.</p>
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Lookup</CardTitle>
          <CardDescription>Both fields must match the submission on record.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <Label htmlFor="code">Submission Code</Label>
              <Input
                id="code"
                className="mt-2 font-mono"
                placeholder="APT-2026-XXXXX"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                required
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" className="mt-2" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Search className="w-4 h-4" /> Look up</>}
            </Button>
          </form>
        </CardContent>
      </Card>

      {result && (
        <Card className="max-w-2xl mx-auto mt-8">
          <CardHeader>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs uppercase tracking-widest text-[var(--muted-text)]">{result.submissionCode}</div>
                <CardTitle className="mt-1 text-2xl">{result.title}</CardTitle>
              </div>
              <Badge variant={STATUS_VARIANT[result.status] ?? "secondary"}>
                {STATUS_LABEL[result.status] ?? result.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div><b>Presenting author:</b> {result.presentingAuthor}</div>
            <div><b>Theme:</b> {result.theme}</div>
            <div><b>Type:</b> {result.type}</div>
            <div><b>Submitted:</b> {format(new Date(result.createdAt), "d MMM yyyy, h:mm a")}</div>
            {result.abstractCode && (
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                <b>Abstract Code ({result.presentationType}):</b>{" "}
                <span className="font-mono font-bold">{result.abstractCode}</span>
              </div>
            )}
            {result.finalDecisionAt && (
              <div><b>Decision recorded:</b> {format(new Date(result.finalDecisionAt), "d MMM yyyy, h:mm a")}</div>
            )}
            {result.finalDecisionNote && (
              <div className="mt-4 p-4 rounded-lg bg-[var(--cream-100)] border-l-4 border-[var(--gold-500)]">
                <div className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-text)] mb-1">Committee note</div>
                <div className="whitespace-pre-line">{result.finalDecisionNote}</div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
