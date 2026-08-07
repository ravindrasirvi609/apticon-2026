"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle, Upload, Loader2, FileText, Search, Microscope, Users, Sparkles } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import GoldenBadge from "@/components/ui/GoldenBadge";
import CulturalDivider from "@/components/ui/CulturalDivider";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { Button } from "@/components/ui/shadcn/button";
import { Input } from "@/components/ui/shadcn/input";
import { Textarea } from "@/components/ui/shadcn/textarea";
import { Label } from "@/components/ui/shadcn/label";
import { Card, CardContent } from "@/components/ui/shadcn/card";
import { ABSTRACT_THEMES, EVENT } from "@/lib/constants";
import { staggerContainer, fadeUp } from "@/lib/animations";
import AptiMembershipIdField from "@/components/ui/AptiMembershipIdField";

interface AbstractForm {
  title: string;
  authors: string;
  presentingAuthor: string;
  institution: string;
  email: string;
  phone: string;
  aptiMemberId: string;
  theme: string;
  type: "review" | "research";
  keywords: string;
  background: string;
  objectives: string;
  methods: string;
  results: string;
  conclusions: string;
}

const IMPORTANT_DATES = [
  { event: "Abstract Submission Opens",   date: "10 August 2026",     done: true },
  { event: "Last Date for Submission",    date: "30 September 2026", done: false },
  { event: "Acceptance Notification",    date: "10 October 2026",   done: false },
  { event: "Revised Abstract Deadline",  date: "18 October 2026",   done: false },
  { event: "Conference Dates",            date: "24–25 October 2026",done: false },
];

const GUIDELINES = [
  "Abstract must be in English, typed in Times New Roman 12pt.",
  "Word limit: 250–300 words (excluding title and authors).",
  "Structure: Background, Objectives, Methods, Results, Conclusions.",
  "Do not include figures, tables, or references in the abstract.",
  "Presenting author must be listed first in the author list.",
];

const SUBMISSION_NOTES = [
  "The presenting author must be a member of APTI — your Membership ID is verified against the official APTI registry before submission is accepted.",
  "Abstracts must be submitted online only through this website. No other form of submission will be accepted.",
  "Only registered delegates will be allowed to present the abstracts during APTICON.",
  `All queries related to the abstract submission should be done through e-mail: ${EVENT.contact}`,
  "Poster/Oral acceptance letters and presentation schedule will be displayed on the APTICON website; no personal communication will be made in this regard.",
];

const REJECTED_CATEGORIES = [
  "Review articles",
  "Papers without methodology and results",
  "Papers describing simple laboratory experiments",
];

const ALLOWED_MIME: Record<string, "application/pdf" | "application/msword" | "application/vnd.openxmlformats-officedocument.wordprocessingml.document"> = {
  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

export default function AbstractsClient() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<AbstractForm>();
  const [background, objectives, methods, results, conclusions] = watch(["background", "objectives", "methods", "results", "conclusions"]);
  const combinedAbstractText = [background, objectives, methods, results, conclusions].filter(Boolean).join(" ");
  const wordCount = combinedAbstractText.trim().split(/\s+/).filter(Boolean).length;

  async function uploadFile(f: File): Promise<{ key: string } | null> {
    const ext = f.name.split(".").pop()?.toLowerCase() ?? "";
    const contentType = ALLOWED_MIME[ext];
    if (!contentType) {
      toast.error("Only PDF, DOC or DOCX files are allowed.");
      return null;
    }
    if (f.size > 10 * 1024 * 1024) {
      toast.error("File must be under 10 MB.");
      return null;
    }
    const uploadData = new FormData();
    uploadData.append("file", f);
    uploadData.append("purpose", "abstract");
    const uploadRes = await fetch("/api/upload", {
      method: "POST",
      body: uploadData,
    });
    if (!uploadRes.ok) {
      toast.error("File upload failed.");
      return null;
    }
    const { key } = (await uploadRes.json()) as { key: string };
    return { key };
  }

  const onSubmit = async (data: AbstractForm) => {
    if (!file) {
      toast.error("Please attach your abstract file (PDF, DOC or DOCX).");
      return;
    }

    setUploading(true);
    const result = await uploadFile(file);
    setUploading(false);
    if (!result) return;
    const fileKey = result.key;
    const fileName = file.name;

    const { background, objectives, methods, results, conclusions, ...rest } = data;
    const abstract = [
      `Background: ${background}`,
      `Objectives: ${objectives}`,
      `Methods: ${methods}`,
      `Results: ${results}`,
      `Conclusions: ${conclusions}`,
    ].join("\n\n");

    const res = await fetch("/api/abstracts", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...rest, abstract, fileKey, fileName }),
    });
    const body = await res.json();
    if (!res.ok) {
      toast.error(body.error ?? "Submission failed. Please try again.");
      return;
    }
    toast.success("Abstract received. Check your email.");
    router.push(`/abstracts/success/${body.submissionCode}`);
  };

  const errCls = "text-xs text-red-600 mt-1";

  return (
    <div className="pt-8 pb-24">
      {/* Hero */}
      <section className="pt-8 pb-12 px-4 text-center">
        <ScrollReveal>
          <GoldenBadge>Call for Abstracts</GoldenBadge>
          <h1 className="mt-6 font-display text-4xl md:text-6xl font-black text-[var(--crimson-800)]">
            Submit Your Research
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-base md:text-lg text-[var(--muted-text)]">
            Share your work with 1500+ pharmacy educators and researchers at APTICON 2026, Raipur.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3 text-left">
            {[
              { icon: Microscope, label: "Research spotlight" },
              { icon: Users, label: "1500+ peers" },
              { icon: Sparkles, label: "Ideas that inspire" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="inline-flex items-center gap-2 rounded-full border border-[var(--gold-500)]/30 bg-white/80 px-4 py-2 text-sm font-medium text-[var(--dark-text)] shadow-sm">
                <Icon className="h-4 w-4 text-[var(--crimson-800)]" aria-hidden />
                {label}
              </div>
            ))}
          </div>
          <div className="mt-6 flex items-center justify-center gap-3">
            <Link href="/abstracts/status">
              <Button variant="outline">
                <Search className="w-4 h-4" />
                Check Submission Status
              </Button>
            </Link>
          </div>
        </ScrollReveal>
      </section>

      <CulturalDivider />

      {/* Important Dates */}
      <section className="py-12 px-4 max-w-4xl mx-auto">
        <ScrollReveal>
          <h2 className="font-display text-2xl md:text-3xl font-bold text-[var(--dark-text)] mb-6 text-center">
            Important Dates
          </h2>
        </ScrollReveal>
        <motion.ol
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="space-y-3"
        >
          {IMPORTANT_DATES.map((d) => (
            <motion.li
              key={d.event}
              variants={fadeUp}
              className={`flex items-center justify-between p-4 rounded-xl border ${
                d.done
                  ? "bg-[var(--cream-100)] border-[var(--gold-500)]/30"
                  : "bg-white border-[var(--gold-500)]/20"
              }`}
            >
              <span className="text-sm md:text-base text-[var(--dark-text)]">{d.event}</span>
              <span className="text-sm md:text-base font-semibold text-[var(--crimson-800)]">{d.date}</span>
            </motion.li>
          ))}
        </motion.ol>
      </section>

      {/* Guidelines */}
      <section className="py-8 px-4 max-w-4xl mx-auto">
        <Card>
          <CardContent className="pt-6">
            <h3 className="font-display text-xl font-bold text-[var(--dark-text)] mb-4">Submission Guidelines</h3>
            <ul className="space-y-2 text-sm text-[var(--muted-text)]">
              {GUIDELINES.map((g) => (
                <li key={g} className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-[var(--crimson-800)] mt-0.5 flex-shrink-0" />
                  <span>{g}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </section>

      {/* Themes */}
      <section className="py-8 px-4 max-w-4xl mx-auto">
        <ScrollReveal>
          <h3 className="font-display text-xl font-bold text-[var(--dark-text)] mb-4">Areas of Specialization</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {ABSTRACT_THEMES.map((t) => (
              <div key={t} className="px-4 py-3 rounded-lg bg-[var(--cream-100)] border border-[var(--gold-500)]/25 text-sm text-[var(--dark-text)]">
                {t}
              </div>
            ))}
          </div>
        </ScrollReveal>
      </section>

      {/* Notes */}
      <section className="py-8 px-4 max-w-4xl mx-auto">
        <Card>
          <CardContent className="pt-6">
            <h3 className="font-display text-xl font-bold text-[var(--dark-text)] mb-4">Note</h3>
            <ul className="space-y-2 text-sm text-[var(--muted-text)]">
              {SUBMISSION_NOTES.map((n) => (
                <li key={n} className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-[var(--crimson-800)] mt-0.5 flex-shrink-0" />
                  <span>{n}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </section>

      {/* Rejected Categories */}
      <section className="py-8 px-4 max-w-4xl mx-auto">
        <Card>
          <CardContent className="pt-6">
            <h3 className="font-display text-xl font-bold text-[var(--dark-text)] mb-4">
              The following categories of papers will be rejected
            </h3>
            <ol className="space-y-2 text-sm text-[var(--muted-text)] list-decimal list-inside">
              {REJECTED_CATEGORIES.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ol>
            <p className="mt-4 text-sm font-medium text-[var(--crimson-800)]">
              All accepted abstracts will be published in a special issue of IJPER.
            </p>
          </CardContent>
        </Card>
      </section>

      {/* ── Submission Form ─────────────────────────────────── */}
      <section className="py-12 px-4 max-w-3xl mx-auto">
        <Card>
          <CardContent className="pt-8">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-[var(--crimson-800)] mb-6 text-center">
              Submission Form
            </h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  className="mt-2"
                  {...register("title", { required: true, minLength: 5, maxLength: 300 })}
                  aria-invalid={!!errors.title}
                />
                {errors.title && <p className={errCls}>Title is required (5–300 chars).</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <Label htmlFor="presentingAuthor">Presenting Author *</Label>
                  <Input id="presentingAuthor" className="mt-2" {...register("presentingAuthor", { required: true })} />
                  {errors.presentingAuthor && <p className={errCls}>Required.</p>}
                </div>
                <div>
                  <Label htmlFor="institution">Institution *</Label>
                  <Input id="institution" className="mt-2" {...register("institution", { required: true })} />
                  {errors.institution && <p className={errCls}>Required.</p>}
                </div>
              </div>

              <div>
                <Label htmlFor="authors">All Authors * <span className="text-xs font-normal text-[var(--muted-text)]">(comma-separated)</span></Label>
                <Input id="authors" className="mt-2" placeholder="Jane Doe*, John Smith, Priya Sharma" {...register("authors", { required: true })} />
                {errors.authors && <p className={errCls}>List all authors.</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input id="email" type="email" className="mt-2" {...register("email", { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ })} />
                  {errors.email && <p className={errCls}>Valid email required.</p>}
                </div>
                <div>
                  <Label htmlFor="phone">Mobile *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    className="mt-2"
                    placeholder="10-digit mobile"
                    {...register("phone", {
                      required: "Mobile is required",
                      pattern: {
                        value: /^[6-9]\d{9}$/,
                        message: "Enter a valid 10-digit Indian mobile number",
                      },
                    })}
                    onInput={(e) => {
                      // Strip non-digits and cap at 10 as the user types
                      const t = e.currentTarget;
                      t.value = t.value.replace(/\D/g, "").slice(0, 10);
                    }}
                    aria-invalid={!!errors.phone}
                  />
                  {errors.phone && <p className={errCls}>{errors.phone.message || "Enter a valid 10-digit mobile."}</p>}
                </div>
              </div>

              <AptiMembershipIdField
                registerProps={register("aptiMemberId", { required: "APTI Membership ID is required to submit an abstract", minLength: 3 })}
                error={errors.aptiMemberId?.message}
                helperText="Only verified APTI members can submit an abstract — enter the presenting author's Membership ID."
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <Label htmlFor="theme">Theme *</Label>
                  <select
                    id="theme"
                    className="mt-2 flex h-10 w-full rounded-lg border border-[var(--gold-500)]/30 bg-white px-3 py-2 text-sm text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--gold-400)]"
                    {...register("theme", { required: true })}
                    defaultValue=""
                  >
                    <option value="" disabled>Select a theme</option>
                    {ABSTRACT_THEMES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                  {errors.theme && <p className={errCls}>Choose a theme.</p>}
                </div>

                <div>
                  <Label>Article Type *</Label>
                  <div className="mt-2 flex gap-3">
                    <label className="flex-1 flex items-center gap-2 px-4 py-2 rounded-lg border border-[var(--gold-500)]/30 bg-white cursor-pointer hover:border-[var(--crimson-800)]/40">
                      <input type="radio" value="review" {...register("type", { required: true })} defaultChecked />
                      <span className="text-sm">Review Article</span>
                    </label>
                    <label className="flex-1 flex items-center gap-2 px-4 py-2 rounded-lg border border-[var(--gold-500)]/30 bg-white cursor-pointer hover:border-[var(--crimson-800)]/40">
                      <input type="radio" value="research" {...register("type", { required: true })} />
                      <span className="text-sm">Research Article</span>
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="keywords">Keywords * <span className="text-xs font-normal text-[var(--muted-text)]">(comma-separated, 1–8)</span></Label>
                <Input id="keywords" className="mt-2" placeholder="nanoparticles, drug delivery, controlled release" {...register("keywords", { required: true })} />
                {errors.keywords && <p className={errCls}>Enter at least one keyword.</p>}
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <Label>Abstract Body *</Label>
                  <span className={`text-xs ${wordCount > 300 ? "text-red-600" : "text-[var(--muted-text)]"}`}>
                    {wordCount} / 300 words
                  </span>
                </div>
                <div className="mt-2 space-y-3">
                  <div>
                    <Label htmlFor="background" className="text-xs font-normal text-[var(--muted-text)]">Background</Label>
                    <Textarea id="background" className="mt-1 min-h-[70px]" {...register("background", { required: true, minLength: 20 })} />
                  </div>
                  <div>
                    <Label htmlFor="objectives" className="text-xs font-normal text-[var(--muted-text)]">Objectives</Label>
                    <Textarea id="objectives" className="mt-1 min-h-[70px]" {...register("objectives", { required: true, minLength: 20 })} />
                  </div>
                  <div>
                    <Label htmlFor="methods" className="text-xs font-normal text-[var(--muted-text)]">Methods</Label>
                    <Textarea id="methods" className="mt-1 min-h-[70px]" {...register("methods", { required: true, minLength: 20 })} />
                  </div>
                  <div>
                    <Label htmlFor="results" className="text-xs font-normal text-[var(--muted-text)]">Results</Label>
                    <Textarea id="results" className="mt-1 min-h-[70px]" {...register("results", { required: true, minLength: 20 })} />
                  </div>
                  <div>
                    <Label htmlFor="conclusions" className="text-xs font-normal text-[var(--muted-text)]">Conclusions</Label>
                    <Textarea id="conclusions" className="mt-1 min-h-[70px]" {...register("conclusions", { required: true, minLength: 20 })} />
                  </div>
                </div>
                {(errors.background || errors.objectives || errors.methods || errors.results || errors.conclusions) && (
                  <p className={errCls}>Each section is required (at least 20 characters).</p>
                )}
              </div>

              <div>
                <Label htmlFor="file">Abstract file * (PDF, DOC, DOCX, max 10 MB)</Label>
                <div className="mt-2 flex items-center gap-3">
                  <label className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-lg border border-dashed border-[var(--gold-500)]/40 bg-white cursor-pointer hover:border-[var(--crimson-800)]/40 transition-colors">
                    <Upload className="w-4 h-4 text-[var(--muted-text)]" />
                    <span className="text-sm text-[var(--dark-text)] truncate">
                      {file ? file.name : "Choose file..."}
                    </span>
                    <input
                      id="file"
                      type="file"
                      accept=".pdf,.doc,.docx"
                      className="hidden"
                      onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                    />
                  </label>
                  {file && (
                    <Button type="button" variant="outline" size="sm" onClick={() => setFile(null)}>
                      Remove
                    </Button>
                  )}
                </div>
              </div>

              <div className="pt-4">
                <Button type="submit" size="lg" className="w-full" disabled={isSubmitting || uploading}>
                  {uploading || isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {uploading ? "Uploading file…" : "Submitting…"}
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4" />
                      Submit Abstract
                    </>
                  )}
                </Button>
                <p className="mt-3 text-center text-xs text-[var(--muted-text)]">
                  You'll receive a confirmation email with your submission code.
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
