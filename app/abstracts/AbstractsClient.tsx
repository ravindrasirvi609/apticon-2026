"use client";
import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle, Upload, Loader2, FileText, Search, Microscope, Users, Sparkles, Plus, Trash2 } from "lucide-react";
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
import { MAX_CO_AUTHORS } from "@/lib/validators/abstract";
import { staggerContainer, fadeUp } from "@/lib/animations";
import AptiMembershipIdField from "@/components/ui/AptiMembershipIdField";
import { ABSTRACT_FILE_MIME, IMAGE_MIME, uploadPublicFile } from "@/lib/upload-client";

interface CoAuthorRow {
  name: string;
  institution: string;
}

interface AbstractForm {
  title: string;
  coAuthors: CoAuthorRow[];
  presentingAuthor: string;
  institution: string;
  email: string;
  phone: string;
  aptiMemberId: string;
  theme: string;
  type: "review" | "research";
  preferredPresentationType?: "oral" | "poster";
  keywords: string;
  abstract: string;
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

export default function AbstractsClient() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [graphicalAbstractFile, setGraphicalAbstractFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const { register, handleSubmit, watch, control, formState: { errors, isSubmitting } } = useForm<AbstractForm>({
    defaultValues: { coAuthors: [] },
  });
  const { fields: coAuthorFields, append: appendCoAuthor, remove: removeCoAuthor } = useFieldArray({ control, name: "coAuthors" });
  const abstractText = watch("abstract");
  const wordCount = (abstractText ?? "").trim().split(/\s+/).filter(Boolean).length;

  function addCoAuthor() {
    if (coAuthorFields.length >= MAX_CO_AUTHORS) {
      toast.error(`Up to ${MAX_CO_AUTHORS} co-authors are supported.`);
      return;
    }
    appendCoAuthor({ name: "", institution: "" });
  }

  const onSubmit = async (data: AbstractForm) => {
    if (!file) {
      toast.error("Please attach your abstract file (DOC or DOCX).");
      return;
    }
    if (!graphicalAbstractFile) {
      toast.error("Please attach your graphical abstract (JPG, PNG or WebP).");
      return;
    }

    setUploading(true);
    const result = await uploadPublicFile(file, "abstract", ABSTRACT_FILE_MIME, 10 * 1024 * 1024);
    if (!result) {
      setUploading(false);
      return;
    }

    const gaResult = await uploadPublicFile(graphicalAbstractFile, "graphicalAbstract", IMAGE_MIME, 5 * 1024 * 1024);
    if (!gaResult) {
      setUploading(false);
      return;
    }
    const uploadedGraphicalAbstractKey = gaResult.key;
    const uploadedGraphicalAbstractName = graphicalAbstractFile.name;
    setUploading(false);

    const fileKey = result.key;
    const fileName = file.name;

    const res = await fetch("/api/abstracts", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...data, fileKey, fileName, graphicalAbstractKey: uploadedGraphicalAbstractKey, graphicalAbstractName: uploadedGraphicalAbstractName }),
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
          <h1 className="mt-6 font-display text-4xl md:text-6xl font-black text-[var(--primary-800)]">
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
              <div key={label} className="inline-flex items-center gap-2 rounded-full border border-[var(--accent-500)]/30 bg-white/80 px-4 py-2 text-sm font-medium text-[var(--dark-text)] shadow-sm">
                <Icon className="h-4 w-4 text-[var(--primary-800)]" aria-hidden />
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
                  ? "bg-[var(--surface-100)] border-[var(--accent-500)]/30"
                  : "bg-white border-[var(--accent-500)]/20"
              }`}
            >
              <span className="text-sm md:text-base text-[var(--dark-text)]">{d.event}</span>
              <span className="text-sm md:text-base font-semibold text-[var(--primary-800)]">{d.date}</span>
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
                  <CheckCircle className="w-4 h-4 text-[var(--primary-800)] mt-0.5 flex-shrink-0" />
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
              <div key={t} className="px-4 py-3 rounded-lg bg-[var(--surface-100)] border border-[var(--accent-500)]/25 text-sm text-[var(--dark-text)]">
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
                  <CheckCircle className="w-4 h-4 text-[var(--primary-800)] mt-0.5 flex-shrink-0" />
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
            <p className="mt-4 text-sm font-medium text-[var(--primary-800)]">
              All accepted abstracts will be published in a special issue of IJPER.
            </p>
          </CardContent>
        </Card>
      </section>

      {/* ── Submission Form ─────────────────────────────────── */}
      <section className="py-12 px-4 max-w-3xl mx-auto">
        <Card>
          <CardContent className="pt-8">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-[var(--primary-800)] mb-6 text-center">
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
                <div className="flex items-center justify-between">
                  <Label>Co-Authors <span className="text-xs font-normal text-[var(--muted-text)]">(optional)</span></Label>
                  <Button type="button" variant="outline" size="sm" onClick={addCoAuthor}>
                    <Plus className="w-4 h-4" /> Add Co-Author
                  </Button>
                </div>
                <div className="mt-2 space-y-3">
                  {coAuthorFields.map((field, index) => (
                    <div key={field.id} className="rounded-lg border border-[var(--accent-500)]/30 bg-white p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-text)]">Co-Author #{index + 1}</span>
                        <Button type="button" variant="ghost" size="sm" onClick={() => removeCoAuthor(index)}>
                          <Trash2 className="w-3.5 h-3.5" /> Remove
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor={`coAuthors.${index}.name`} className="text-xs font-normal text-[var(--muted-text)]">Name *</Label>
                          <Input
                            id={`coAuthors.${index}.name`}
                            className="mt-1"
                            {...register(`coAuthors.${index}.name`, { required: true, minLength: 2 })}
                          />
                          {errors.coAuthors?.[index]?.name && <p className={errCls}>Required.</p>}
                        </div>
                        <div>
                          <Label htmlFor={`coAuthors.${index}.institution`} className="text-xs font-normal text-[var(--muted-text)]">Institution *</Label>
                          <Input
                            id={`coAuthors.${index}.institution`}
                            className="mt-1"
                            {...register(`coAuthors.${index}.institution`, { required: true, minLength: 2 })}
                          />
                          {errors.coAuthors?.[index]?.institution && <p className={errCls}>Required.</p>}
                        </div>
                      </div>
                    </div>
                  ))}
                  {coAuthorFields.length === 0 && (
                    <p className="text-xs text-[var(--muted-text)]">No co-authors added. Click "Add Co-Author" if this work has other authors besides the presenting author.</p>
                  )}
                </div>
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
                    className="mt-2 flex h-10 w-full rounded-lg border border-[var(--accent-500)]/30 bg-white px-3 py-2 text-sm text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-400)]"
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
                    <label className="flex-1 flex items-center gap-2 px-4 py-2 rounded-lg border border-[var(--accent-500)]/30 bg-white cursor-pointer hover:border-[var(--primary-800)]/40">
                      <input type="radio" value="review" {...register("type", { required: true })} defaultChecked />
                      <span className="text-sm">Review Article</span>
                    </label>
                    <label className="flex-1 flex items-center gap-2 px-4 py-2 rounded-lg border border-[var(--accent-500)]/30 bg-white cursor-pointer hover:border-[var(--primary-800)]/40">
                      <input type="radio" value="research" {...register("type", { required: true })} />
                      <span className="text-sm">Research Article</span>
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <Label>
                  Presentation Type Preference <span className="text-xs font-normal text-[var(--muted-text)]">(optional — editorial confirms this on acceptance)</span>
                </Label>
                <div className="mt-2 flex gap-3">
                  <label className="flex-1 flex items-center gap-2 px-4 py-2 rounded-lg border border-[var(--accent-500)]/30 bg-white cursor-pointer hover:border-[var(--primary-800)]/40">
                    <input type="radio" value="oral" {...register("preferredPresentationType")} />
                    <span className="text-sm">Oral</span>
                  </label>
                  <label className="flex-1 flex items-center gap-2 px-4 py-2 rounded-lg border border-[var(--accent-500)]/30 bg-white cursor-pointer hover:border-[var(--primary-800)]/40">
                    <input type="radio" value="poster" {...register("preferredPresentationType")} />
                    <span className="text-sm">Poster</span>
                  </label>
                </div>
              </div>

              <div>
                <Label htmlFor="keywords">Keywords * <span className="text-xs font-normal text-[var(--muted-text)]">(comma-separated, 1–8)</span></Label>
                <Input id="keywords" className="mt-2" placeholder="nanoparticles, drug delivery, controlled release" {...register("keywords", { required: true })} />
                {errors.keywords && <p className={errCls}>Enter at least one keyword.</p>}
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
                  className="mt-2 min-h-[220px]"
                  {...register("abstract", { required: true, minLength: 100, maxLength: 3800 })}
                  aria-invalid={!!errors.abstract}
                />
                {errors.abstract && <p className={errCls}>Abstract is required (100–3800 characters).</p>}
                <p className="mt-2 text-xs text-[var(--muted-text)]">
                  Note: Your abstract should clearly cover the Objectives, Methods, Results, and Conclusion of your work.
                </p>
              </div>

              <div>
                <Label htmlFor="graphicalAbstract">
                  Graphical Abstract * <span className="text-xs font-normal text-[var(--muted-text)]">(JPG/PNG/WebP, max 5 MB)</span>
                </Label>
                <div className="mt-2 flex items-center gap-3">
                  <label className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-lg border border-dashed border-[var(--accent-500)]/40 bg-white cursor-pointer hover:border-[var(--primary-800)]/40 transition-colors">
                    <Upload className="w-4 h-4 text-[var(--muted-text)]" />
                    <span className="text-sm text-[var(--dark-text)] truncate">
                      {graphicalAbstractFile ? graphicalAbstractFile.name : "Choose image..."}
                    </span>
                    <input
                      id="graphicalAbstract"
                      type="file"
                      accept=".jpg,.jpeg,.png,.webp"
                      required
                      className="hidden"
                      onChange={(e) => setGraphicalAbstractFile(e.target.files?.[0] ?? null)}
                    />
                  </label>
                  {graphicalAbstractFile && (
                    <Button type="button" variant="outline" size="sm" onClick={() => setGraphicalAbstractFile(null)}>
                      Remove
                    </Button>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="file">Abstract file * (DOC or DOCX, max 10 MB)</Label>
                <div className="mt-2 flex items-center gap-3">
                  <label className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-lg border border-dashed border-[var(--accent-500)]/40 bg-white cursor-pointer hover:border-[var(--primary-800)]/40 transition-colors">
                    <Upload className="w-4 h-4 text-[var(--muted-text)]" />
                    <span className="text-sm text-[var(--dark-text)] truncate">
                      {file ? file.name : "Choose file..."}
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
