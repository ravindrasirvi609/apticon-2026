"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Clock, Loader2, Search, Send } from "lucide-react";
import { toast } from "sonner";
import GoldenBadge from "@/components/ui/GoldenBadge";
import { Button } from "@/components/ui/shadcn/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/shadcn/card";
import { Input } from "@/components/ui/shadcn/input";
import { Label } from "@/components/ui/shadcn/label";
import { Textarea } from "@/components/ui/shadcn/textarea";
import {
  MOST_VALUABLE_MAX,
  RATING_KEYS,
  RATING_QUESTIONS,
  RECOMMEND_OPTIONS,
  SUGGESTIONS_MAX,
  type RatingKey,
  type RecommendValue,
} from "@/lib/event-feedback-shared";
import CertificateStep from "./CertificateStep";
import RatingField from "./RatingField";

interface Props {
  initiallyOpen: boolean;
  /** ISO timestamp the form goes live. */
  opensAt: string;
}

type Step = "identify" | "form" | "certificate";

interface Delegate {
  code: string;
  name: string;
  institution: string;
}

function countdown(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  return {
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  };
}

export default function FeedbackClient({ initiallyOpen, opensAt }: Props) {
  const opensAtMs = new Date(opensAt).getTime();
  // Tick only while waiting, so the page flips to the form by itself when 12:00 arrives.
  const [now, setNow] = useState(() => Date.now());
  const open = initiallyOpen || now >= opensAtMs;
  useEffect(() => {
    if (open) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [open]);

  const [step, setStep] = useState<Step>("identify");
  const [code, setCode] = useState("");
  const [email, setEmail] = useState("");
  const [delegate, setDelegate] = useState<Delegate | null>(null);
  const [justSubmitted, setJustSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);

  const [ratings, setRatings] = useState<Partial<Record<RatingKey, number>>>({});
  const [wouldRecommend, setWouldRecommend] = useState<RecommendValue | "">("");
  const [mostValuable, setMostValuable] = useState("");
  const [suggestions, setSuggestions] = useState("");
  const [showErrors, setShowErrors] = useState(false);

  async function identify(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await fetch("/api/event-feedback/lookup", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ code, email }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error ?? "Could not verify your registration");
        return;
      }
      setDelegate(data.registration);
      setJustSubmitted(false);
      setStep(data.submitted ? "certificate" : "form");
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const missing = RATING_KEYS.some((k) => !ratings[k]) || !wouldRecommend;
    if (missing) {
      setShowErrors(true);
      toast.error("Please answer all the required questions.");
      // Bring the first unanswered question into view once the error styling has rendered.
      requestAnimationFrame(() =>
        document
          .querySelector("[data-invalid='true']")
          ?.scrollIntoView({ behavior: "smooth", block: "center" }),
      );
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/event-feedback", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          code,
          email,
          ratings,
          wouldRecommend,
          mostValuable,
          suggestions,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error ?? "Could not submit your feedback");
        return;
      }
      setJustSubmitted(true);
      setStep("certificate");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  const cd = countdown(opensAtMs - now);

  return (
    <div className="min-h-[80vh] px-4 py-16">
      <div className="mx-auto mb-8 max-w-2xl text-center">
        <GoldenBadge>Feedback &amp; Certificate</GoldenBadge>
        <h1 className="mt-6 font-display text-3xl font-black text-[var(--primary-800)] md:text-4xl">
          Tell us about APTICON 2026
        </h1>
        <p className="mt-3 text-[var(--muted-text)]">
          Share your feedback to unlock and download your participation certificate.
        </p>
      </div>

      {/* ── Not live yet ── */}
      {!open && (
        <Card className="mx-auto max-w-2xl text-center">
          <CardContent className="pt-6">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-700">
              <Clock size={28} />
            </div>
            <h2 className="font-display text-xl font-bold text-[var(--primary-800)]">
              The feedback form opens on the last day of the convention
            </h2>
            <p className="mt-2 text-sm text-[var(--muted-text)]">
              {format(new Date(opensAt), "EEEE, d MMMM yyyy 'at' h:mm a")} IST
            </p>
            <div className="mt-6 grid grid-cols-4 gap-3">
              {(
                [
                  ["Days", cd.days],
                  ["Hours", cd.hours],
                  ["Minutes", cd.minutes],
                  ["Seconds", cd.seconds],
                ] as const
              ).map(([label, value]) => (
                <div key={label} className="rounded-xl bg-[var(--surface-100)] py-3">
                  <div className="font-display text-3xl font-black text-[var(--primary-800)] tabular-nums">
                    {String(value).padStart(2, "0")}
                  </div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-text)]">
                    {label}
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-6 text-sm text-[var(--muted-text)]">
              Keep your registration code and registered email handy.
            </p>
          </CardContent>
        </Card>
      )}

      {/* ── Step 1: identify ── */}
      {open && step === "identify" && (
        <Card className="mx-auto max-w-2xl">
          <CardHeader>
            <CardTitle>Find your registration</CardTitle>
            <CardDescription>
              Only confirmed delegates can submit feedback and receive a certificate. Both
              fields must match your registration.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={identify} className="space-y-4">
              <div>
                <Label htmlFor="fb-code">Registration Code</Label>
                <Input
                  id="fb-code"
                  className="mt-2 font-mono"
                  placeholder="AM1001"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  required
                />
              </div>
              <div>
                <Label htmlFor="fb-email">Registered email</Label>
                <Input
                  id="fb-email"
                  type="email"
                  className="mt-2"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={busy}>
                {busy ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Search className="h-4 w-4" /> Continue
                  </>
                )}
              </Button>
              <p className="text-center text-xs text-[var(--muted-text)]">
                Forgot your code?{" "}
                <Link
                  href="/registration/status"
                  className="font-semibold text-[var(--primary-800)] hover:underline"
                >
                  Check registration status
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      )}

      {/* ── Step 2: the form ── */}
      {open && step === "form" && delegate && (
        <form onSubmit={submit} className="mx-auto max-w-3xl space-y-6" noValidate>
          <Card>
            <CardContent className="flex flex-wrap items-center justify-between gap-2 pt-6 text-sm">
              <div>
                <div className="font-semibold text-[var(--dark-text)]">{delegate.name}</div>
                <div className="text-xs text-[var(--muted-text)]">{delegate.institution}</div>
              </div>
              <div className="font-mono text-xs text-[var(--muted-text)]">{delegate.code}</div>
            </CardContent>
          </Card>

          <section className="space-y-3">
            <h2 className="font-display text-lg font-bold text-[var(--dark-text)]">
              Rate your experience
            </h2>
            {RATING_QUESTIONS.map((q) => (
              <RatingField
                key={q.key}
                label={q.label}
                value={ratings[q.key] ?? 0}
                error={showErrors && !ratings[q.key]}
                onChange={(v) => setRatings((r) => ({ ...r, [q.key]: v }))}
              />
            ))}
          </section>

          <section>
            <div
              data-invalid={showErrors && !wouldRecommend ? "true" : undefined}
              className={`scroll-mt-28 rounded-xl border p-4 ${
                showErrors && !wouldRecommend
                  ? "border-red-300 bg-red-50/50"
                  : "border-[var(--accent-500)]/20 bg-white"
              }`}
            >
              <div className="mb-3 text-sm font-semibold text-[var(--dark-text)]">
                Would you attend APTICON again and recommend it to colleagues?{" "}
                <span className="text-red-500">*</span>
              </div>
              <div role="radiogroup" className="flex flex-wrap gap-2">
                {RECOMMEND_OPTIONS.map((o) => (
                  <button
                    key={o.value}
                    type="button"
                    role="radio"
                    aria-checked={wouldRecommend === o.value}
                    onClick={() => setWouldRecommend(o.value)}
                    className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                      wouldRecommend === o.value
                        ? "border-[var(--primary-800)] bg-[var(--primary-800)] text-white"
                        : "border-[var(--accent-500)]/30 bg-white text-[var(--dark-text)] hover:bg-[var(--surface-100)]"
                    }`}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
              {showErrors && !wouldRecommend && (
                <p role="alert" className="mt-2 text-xs font-semibold text-red-700">
                  Please choose one option.
                </p>
              )}
            </div>
          </section>

          <section className="space-y-4">
            <div>
              <Label htmlFor="fb-valuable">
                What did you find most valuable?{" "}
                <span className="font-normal text-[var(--muted-text)]">(optional)</span>
              </Label>
              <Textarea
                id="fb-valuable"
                className="mt-2"
                rows={3}
                maxLength={MOST_VALUABLE_MAX}
                value={mostValuable}
                onChange={(e) => setMostValuable(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="fb-suggest">
                Suggestions to make the next APTICON better{" "}
                <span className="font-normal text-[var(--muted-text)]">(optional)</span>
              </Label>
              <Textarea
                id="fb-suggest"
                className="mt-2"
                rows={4}
                maxLength={SUGGESTIONS_MAX}
                value={suggestions}
                onChange={(e) => setSuggestions(e.target.value)}
              />
            </div>
          </section>

          <Button type="submit" size="lg" className="w-full" disabled={busy}>
            {busy ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            Submit feedback &amp; get my certificate
          </Button>
        </form>
      )}

      {/* ── Step 3: certificate ── */}
      {open && step === "certificate" && delegate && (
        <CertificateStep
          code={code}
          email={email}
          name={delegate.name}
          justSubmitted={justSubmitted}
        />
      )}
    </div>
  );
}
