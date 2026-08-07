"use client";
import { useState } from "react";
import Link from "next/link";
import { Search, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { Button } from "@/components/ui/shadcn/button";
import { Input } from "@/components/ui/shadcn/input";
import { Label } from "@/components/ui/shadcn/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/shadcn/card";
import { Badge } from "@/components/ui/shadcn/badge";
import GoldenBadge from "@/components/ui/GoldenBadge";
import DelegatePhoto from "@/components/ui/DelegatePhoto";

interface RegStatus {
  registrationCode: string;
  fullName: string;
  email: string;
  category: string;
  feeAmount: number;
  feeTier: string;
  status: string;
  createdAt: string;
  approvedAt?: string;
  rejectedAt?: string;
  reviewNote?: string;
  willSubmitAbstract?: boolean;
  photoUrl?: string;
  qrCode?: string;
}

interface LinkedAbs {
  submissionCode: string;
  title: string;
  status: string;
}

const STATUS_VARIANT: Record<string, "info" | "warning" | "success" | "danger" | "secondary"> = {
  submitted: "info",
  payment_review: "warning",
  approved: "success",
  rejected: "danger",
  resubmitted: "info",
};

const STATUS_LABEL: Record<string, string> = {
  submitted: "Payment Processing",
  payment_review: "Payment Under Review",
  approved: "Approved",
  rejected: "Payment Rejected",
  resubmitted: "Resubmitted",
};

const ABS_STATUS_LABEL: Record<string, string> = {
  submitted: "Submitted",
  under_review: "Under Review",
  accepted: "Accepted",
  rejected: "Not Accepted",
  revision_requested: "Revision Requested",
  resubmitted: "Resubmitted",
};

export default function RegistrationStatusClient() {
  const [code, setCode] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ registration: RegStatus; linkedAbstract: LinkedAbs | null } | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/registrations/status", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ code, email }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Not found");
        return;
      }
      setResult(data);
    } catch {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[80vh] px-4 py-16">
      <div className="max-w-2xl mx-auto text-center mb-8">
        <GoldenBadge>Registration Status</GoldenBadge>
        <h1 className="mt-6 font-display text-3xl md:text-4xl font-black text-[var(--crimson-800)]">
          Check Your Registration
        </h1>
        <p className="mt-3 text-[var(--muted-text)]">Enter your registration code and email to view the payment verification status.</p>
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Lookup</CardTitle>
          <CardDescription>Both fields must match the registration on record.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <Label htmlFor="code">Registration Code</Label>
              <Input
                id="code"
                className="mt-2 font-mono"
                placeholder="APT-REG-2026-XXXXX"
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
              <div className="flex items-center gap-4 min-w-0">
                <DelegatePhoto url={result.registration.photoUrl} name={result.registration.fullName} size={64} />
                <div className="min-w-0">
                  <div className="text-xs uppercase tracking-widest text-[var(--muted-text)]">{result.registration.registrationCode}</div>
                  <CardTitle className="mt-1 text-2xl">{result.registration.fullName}</CardTitle>
                </div>
              </div>
              <Badge variant={STATUS_VARIANT[result.registration.status] ?? "secondary"}>
                {STATUS_LABEL[result.registration.status] ?? result.registration.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div><b>Category:</b> {result.registration.category}</div>
            <div><b>Fee:</b> ₹{result.registration.feeAmount.toLocaleString("en-IN")} ({result.registration.feeTier.replace("_", " ")})</div>
            <div><b>Submitted:</b> {format(new Date(result.registration.createdAt), "d MMM yyyy, h:mm a")}</div>
            {result.registration.approvedAt && (
              <div><b>Approved:</b> {format(new Date(result.registration.approvedAt), "d MMM yyyy, h:mm a")}</div>
            )}
            {result.registration.rejectedAt && (
              <div><b>Rejected:</b> {format(new Date(result.registration.rejectedAt), "d MMM yyyy, h:mm a")}</div>
            )}
            {result.registration.reviewNote && (
              <div className="mt-4 p-4 rounded-lg bg-red-50 border-l-4 border-red-500">
                <div className="text-xs font-semibold uppercase tracking-wider text-red-800 mb-1">Reason for rejection</div>
                <div className="whitespace-pre-line text-red-900">{result.registration.reviewNote}</div>
                <div className="mt-3">
                  <Link href="/registration" className="text-sm font-semibold text-[var(--crimson-800)] hover:underline">Resubmit registration →</Link>
                </div>
              </div>
            )}

            {result.registration.qrCode && (
              <div className="mt-4 p-4 rounded-lg bg-[var(--cream-100)] border border-[var(--gold-500)]/20 flex flex-col items-center gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={result.registration.qrCode}
                  alt="QR code encoding your registration code"
                  width={160}
                  height={160}
                  className="rounded-lg border border-[var(--gold-500)]/20 bg-white p-2"
                />
                <p className="text-xs text-[var(--muted-text)]">Show this at the registration desk</p>
              </div>
            )}

            {/* Linked abstract panel */}
            <div className="mt-6 p-4 rounded-lg bg-[var(--cream-100)] border border-[var(--gold-500)]/20">
              <div className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-text)] mb-2">Abstract</div>
              {result.linkedAbstract ? (
                <div>
                  <div className="font-semibold text-[var(--dark-text)]">{result.linkedAbstract.title}</div>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-xs font-mono">{result.linkedAbstract.submissionCode}</span>
                    <Badge variant="outline">{ABS_STATUS_LABEL[result.linkedAbstract.status] ?? result.linkedAbstract.status}</Badge>
                  </div>
                </div>
              ) : result.registration.willSubmitAbstract ? (
                <div className="text-sm">
                  You indicated you&apos;d submit an abstract but we haven&apos;t received one yet.
                  <Link href="/abstracts" className="ml-1 font-semibold text-[var(--crimson-800)] hover:underline">Submit now →</Link>
                </div>
              ) : (
                <div className="text-sm text-[var(--muted-text)]">
                  No abstract linked to this registration.
                  <Link href="/abstracts" className="ml-1 font-semibold text-[var(--crimson-800)] hover:underline">Submit one →</Link>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
