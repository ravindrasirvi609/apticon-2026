"use client";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Search, Loader2, Upload, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/shadcn/button";
import { Input } from "@/components/ui/shadcn/input";
import { Textarea } from "@/components/ui/shadcn/textarea";
import { Label } from "@/components/ui/shadcn/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/shadcn/card";
import GoldenBadge from "@/components/ui/GoldenBadge";
import {
  ABSTRACT_FILE_MIME,
  IMAGE_MIME,
  uploadPublicFile,
} from "@/lib/upload-client";

interface AbstractRecord {
  submissionCode: string;
  title: string;
  presentingAuthor: string;
  status: string;
  abstract: string;
  fileName?: string;
  graphicalAbstractName?: string;
  finalDecisionNote?: string;
}

export default function ReviseClient() {
  const params = useSearchParams();
  const [code, setCode] = useState(params.get("code") ?? "");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [record, setRecord] = useState<AbstractRecord | null>(null);

  const [abstractText, setAbstractText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [graphicalAbstractFile, setGraphicalAbstractFile] =
    useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function lookup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setRecord(null);
    setDone(false);
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
      setRecord(data.abstract);
      setAbstractText(data.abstract.abstract ?? "");
    } catch {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  }

  async function submitRevision() {
    if (!record) return;
    if (abstractText.trim().length < 100) {
      toast.error("Abstract must be at least 100 characters.");
      return;
    }
    if (!graphicalAbstractFile && !record.graphicalAbstractName) {
      toast.error("Please attach your graphical abstract (JPG, PNG or WebP).");
      return;
    }
    setSubmitting(true);
    try {
      let fileKey: string | undefined;
      let fileName: string | undefined;
      if (file) {
        const result = await uploadPublicFile(
          file,
          "abstract",
          ABSTRACT_FILE_MIME,
          10 * 1024 * 1024,
        );
        if (!result) return;
        fileKey = result.key;
        fileName = file.name;
      }

      let graphicalAbstractKey: string | undefined;
      let graphicalAbstractName: string | undefined;
      if (graphicalAbstractFile) {
        const gaResult = await uploadPublicFile(
          graphicalAbstractFile,
          "graphicalAbstract",
          IMAGE_MIME,
          5 * 1024 * 1024,
        );
        if (!gaResult) return;
        graphicalAbstractKey = gaResult.key;
        graphicalAbstractName = graphicalAbstractFile.name;
      }

      const res = await fetch("/api/abstracts/revise", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          code,
          email,
          abstract: abstractText,
          fileKey,
          fileName,
          graphicalAbstractKey,
          graphicalAbstractName,
        }),
      });
      const body = await res.json();
      if (!res.ok) {
        toast.error(body.error ?? "Resubmission failed. Please try again.");
        return;
      }
      setDone(true);
      toast.success("Revised abstract resubmitted.");
    } catch {
      toast.error("Network error");
    } finally {
      setSubmitting(false);
    }
  }

  const wordCount = abstractText.trim().split(/\s+/).filter(Boolean).length;
  const errCls = "text-xs text-red-600 mt-1";

  return (
    <div className="min-h-[80vh] px-4 py-16">
      <div className="max-w-2xl mx-auto text-center mb-8">
        <GoldenBadge>Revise Submission</GoldenBadge>
        <h1 className="mt-6 font-display text-3xl md:text-4xl font-black text-[var(--primary-800)]">
          Revise Your Abstract
        </h1>
        <p className="mt-3 text-[var(--muted-text)]">
          Enter your submission code and email to update and resubmit your
          abstract.
        </p>
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Lookup</CardTitle>
          <CardDescription>
            Both fields must match the submission on record.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={lookup} className="space-y-4">
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
              <Input
                id="email"
                type="email"
                className="mt-2"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Search className="w-4 h-4" /> Look up
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {record && done && (
        <Card className="max-w-2xl mx-auto mt-8">
          <CardContent className="pt-8 pb-8 text-center">
            <div className="mx-auto w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
              <CheckCircle className="w-7 h-7 text-emerald-700" />
            </div>
            <h2 className="font-display text-2xl font-bold text-[var(--primary-800)] mb-2">
              Revision Submitted
            </h2>
            <p className="text-sm text-[var(--muted-text)]">
              Your revised abstract for{" "}
              <span className="font-mono">{record.submissionCode}</span> has
              been received and is back under review. A confirmation email has
              been sent.
            </p>
            <div className="mt-6">
              <Link
                href="/abstracts/status"
                className="text-sm font-semibold text-[var(--primary-800)] hover:underline"
              >
                Check submission status →
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {record && !done && record.status !== "revision_requested" && (
        <Card className="max-w-2xl mx-auto mt-8">
          <CardContent className="pt-8 pb-8 text-center">
            <p className="text-sm text-[var(--muted-text)]">
              This submission is not currently open for revision (status:{" "}
              <b>{record.status.replace("_", " ")}</b>).
            </p>
            <div className="mt-4">
              <Link
                href="/abstracts/status"
                className="text-sm font-semibold text-[var(--primary-800)] hover:underline"
              >
                Check submission status →
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {record && !done && record.status === "revision_requested" && (
        <Card className="max-w-2xl mx-auto mt-8">
          <CardHeader>
            <CardTitle>{record.title}</CardTitle>
            <CardDescription className="font-mono">
              {record.submissionCode}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {record.finalDecisionNote && (
              <div className="p-4 rounded-lg bg-[var(--surface-100)] border-l-4 border-[var(--accent-500)]">
                <div className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-text)] mb-1">
                  Committee note
                </div>
                <div className="whitespace-pre-line text-sm">
                  {record.finalDecisionNote}
                </div>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="abstractText">Abstract Body *</Label>
                <span
                  className={`text-xs ${wordCount > 300 ? "text-red-600" : "text-[var(--muted-text)]"}`}
                >
                  {wordCount} / 300 words
                </span>
              </div>
              <Textarea
                id="abstractText"
                className="mt-2 min-h-[220px]"
                value={abstractText}
                onChange={(e) => setAbstractText(e.target.value)}
              />
              {abstractText.trim().length < 100 && (
                <p className={errCls}>
                  Abstract must be at least 100 characters.
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="graphicalAbstractFile">
                Graphical Abstract *{" "}
                <span className="text-xs font-normal text-[var(--muted-text)]">
                  (required unless an existing one is kept; JPG/PNG/WebP, max 5
                  MB)
                </span>
              </Label>
              <div className="mt-2 flex items-center gap-3">
                <label className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-lg border border-dashed border-[var(--accent-500)]/40 bg-white cursor-pointer hover:border-[var(--primary-800)]/40 transition-colors">
                  <Upload className="w-4 h-4 text-[var(--muted-text)]" />
                  <span className="text-sm text-[var(--dark-text)] truncate">
                    {graphicalAbstractFile
                      ? graphicalAbstractFile.name
                      : record.graphicalAbstractName ||
                        "No image uploaded yet — choose one..."}
                  </span>
                  <input
                    id="graphicalAbstractFile"
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp"
                    className="hidden"
                    onChange={(e) =>
                      setGraphicalAbstractFile(e.target.files?.[0] ?? null)
                    }
                  />
                </label>
                {graphicalAbstractFile && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setGraphicalAbstractFile(null)}
                  >
                    Remove
                  </Button>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="file">
                Abstract File{" "}
                <span className="text-xs font-normal text-[var(--muted-text)]">
                  (optional — DOC or DOCX, leave blank to keep the existing one)
                </span>
              </Label>
              <div className="mt-2 flex items-center gap-3">
                <label className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-lg border border-dashed border-[var(--accent-500)]/40 bg-white cursor-pointer hover:border-[var(--primary-800)]/40 transition-colors">
                  <Upload className="w-4 h-4 text-[var(--muted-text)]" />
                  <span className="text-sm text-[var(--dark-text)] truncate">
                    {file ? file.name : record.fileName || "No file on record"}
                  </span>
                  <input
                    id="file"
                    type="file"
                    accept=".doc,.docx"
                    className="hidden"
                    onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  />
                </label>
                {file && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setFile(null)}
                  >
                    Remove
                  </Button>
                )}
              </div>
            </div>

            <Button
              onClick={submitRevision}
              size="lg"
              className="w-full"
              disabled={submitting}
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Submit Revision
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
