"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle, Upload, Loader2, FileText, Search } from "lucide-react";
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
import { ABSTRACT_THEMES } from "@/lib/constants";
import { staggerContainer, fadeUp } from "@/lib/animations";

interface AbstractForm {
  title: string;
  authors: string;
  presentingAuthor: string;
  institution: string;
  email: string;
  phone: string;
  theme: string;
  type: "oral" | "poster";
  abstract: string;
}

const IMPORTANT_DATES = [
  { event: "Abstract Submission Opens",   date: "1 August 2026",     done: true },
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
  "Each delegate may submit a maximum of 2 abstracts.",
  "Attach the full-text PDF (max 10 MB, PDF/DOC/DOCX only).",
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
  const abstractText = watch("abstract", "");
  const wordCount = abstractText.trim().split(/\s+/).filter(Boolean).length;

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
    const presignRes = await fetch("/api/upload/presign", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ fileName: f.name, contentType, size: f.size }),
    });
    if (!presignRes.ok) {
      toast.error("Could not prepare upload.");
      return null;
    }
    const { uploadUrl, key } = (await presignRes.json()) as { uploadUrl: string; key: string };
    const putRes = await fetch(uploadUrl, {
      method: "PUT",
      headers: { "content-type": contentType },
      body: f,
    });
    if (!putRes.ok) {
      toast.error("File upload failed.");
      return null;
    }
    return { key };
  }

  const onSubmit = async (data: AbstractForm) => {
    let fileKey: string | undefined;
    let fileName: string | undefined;

    if (file) {
      setUploading(true);
      const result = await uploadFile(file);
      setUploading(false);
      if (!result) return;
      fileKey = result.key;
      fileName = file.name;
    }

    const res = await fetch("/api/abstracts", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...data, fileKey, fileName }),
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
            Share your work with 500+ pharmacy educators and researchers at APTICON 2026, Raipur.
          </p>
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
          <h3 className="font-display text-xl font-bold text-[var(--dark-text)] mb-4">Themes</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {ABSTRACT_THEMES.map((t) => (
              <div key={t} className="px-4 py-3 rounded-lg bg-[var(--cream-100)] border border-[var(--gold-500)]/25 text-sm text-[var(--dark-text)]">
                {t}
              </div>
            ))}
          </div>
        </ScrollReveal>
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
                  <Label htmlFor="phone">Phone *</Label>
                  <Input id="phone" className="mt-2" {...register("phone", { required: true, minLength: 6 })} />
                  {errors.phone && <p className={errCls}>Required.</p>}
                </div>
              </div>

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
                  <Label>Presentation Type *</Label>
                  <div className="mt-2 flex gap-3">
                    <label className="flex-1 flex items-center gap-2 px-4 py-2 rounded-lg border border-[var(--gold-500)]/30 bg-white cursor-pointer hover:border-[var(--crimson-800)]/40">
                      <input type="radio" value="oral" {...register("type", { required: true })} defaultChecked />
                      <span className="text-sm">Oral</span>
                    </label>
                    <label className="flex-1 flex items-center gap-2 px-4 py-2 rounded-lg border border-[var(--gold-500)]/30 bg-white cursor-pointer hover:border-[var(--crimson-800)]/40">
                      <input type="radio" value="poster" {...register("type", { required: true })} />
                      <span className="text-sm">Poster</span>
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="abstract">Abstract Body *</Label>
                  <span className={`text-xs ${wordCount > 300 ? "text-red-600" : "text-[var(--muted-text)]"}`}>
                    {wordCount} / 300 words
                  </span>
                </div>
                <Textarea
                  id="abstract"
                  className="mt-2 min-h-[200px]"
                  {...register("abstract", { required: true, minLength: 100 })}
                  placeholder="Background — Objectives — Methods — Results — Conclusions"
                />
                {errors.abstract && <p className={errCls}>At least 100 characters.</p>}
              </div>

              <div>
                <Label htmlFor="file">Full paper (optional — PDF, DOC, DOCX, max 10 MB)</Label>
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
