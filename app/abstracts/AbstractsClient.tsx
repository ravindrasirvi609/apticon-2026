"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";
import GoldenBadge from "@/components/ui/GoldenBadge";
import CulturalDivider from "@/components/ui/CulturalDivider";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { ABSTRACT_THEMES } from "@/lib/constants";
import { staggerContainer, fadeUp } from "@/lib/animations";

interface AbstractForm {
  title: string;
  authors: string;
  institution: string;
  presenting: string;
  email: string;
  phone: string;
  theme: string;
  type: string;
  abstract: string;
}

const IMPORTANT_DATES = [
  { event: "Abstract Submission Opens",   date: "1 August 2026",     done: false },
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
  "Only registered delegates may submit abstracts.",
  "Each delegate may submit a maximum of 2 abstracts.",
  "Presenting author must be listed first in the author list.",
];

export default function AbstractsClient() {
  const [submitted, setSubmitted] = useState(false);
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<AbstractForm>();
  const abstractText = watch("abstract", "");

  const onSubmit = async (_data: AbstractForm) => {
    await new Promise((r) => setTimeout(r, 1200));
    setSubmitted(true);
  };

  const inputCls = (err?: boolean) => `
    w-full px-4 py-3 rounded-xl border text-sm bg-white
    placeholder:text-[var(--muted-text)]/60 text-[var(--dark-text)]
    focus:outline-none focus:ring-2 focus:ring-[var(--gold-400)] focus:border-transparent
    transition-all duration-200
    ${err ? "border-red-400 bg-red-50" : "border-[var(--gold-500)]/25 hover:border-[var(--gold-500)]/60"}
  `;

  return (
    <div className="bg-[var(--cream-50)] min-h-screen">

      {/* Hero */}
      <section className="relative py-24 md:py-28 overflow-hidden">
        <div className="absolute inset-0 tribal-pattern-bg opacity-30" aria-hidden />
        <div className="container-site relative z-10 text-center">
          <GoldenBadge>Call for Abstracts</GoldenBadge>
          <h1 className="mt-6 font-display font-black text-4xl sm:text-5xl md:text-6xl text-[var(--dark-text)] leading-tight">
            Share Your <span className="text-gradient-crimson">Research</span>
          </h1>
          <p className="mt-5 text-base md:text-lg text-[var(--muted-text)] max-w-xl mx-auto">
            Submit your abstract for oral or poster presentation at APTICON 2026. We welcome original research from all pharmacy disciplines.
          </p>
        </div>
      </section>

      <CulturalDivider variant="bastar" className="opacity-40" />

      {/* Themes + Dates */}
      <section className="py-16 md:py-20">
        <div className="container-site grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* Themes */}
          <div className="lg:col-span-2">
            <ScrollReveal>
              <h2 className="font-display font-bold text-2xl sm:text-3xl text-[var(--dark-text)] mb-6">
                Themes for <span className="text-gradient-gold">Submission</span>
              </h2>
            </ScrollReveal>
            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true }}
              variants={staggerContainer}
              className="grid grid-cols-1 sm:grid-cols-2 gap-3"
            >
              {ABSTRACT_THEMES.map((theme, i) => (
                <motion.div key={theme} variants={fadeUp}
                  className="flex items-start gap-3 p-4 rounded-xl bg-white border border-[var(--gold-500)]/15 hover:border-[var(--gold-500)]/50 hover:shadow-sm transition-all duration-200"
                >
                  <span className="font-display font-black text-[var(--crimson-800)] text-lg leading-none flex-shrink-0">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <p className="text-sm font-medium text-[var(--dark-text)] leading-snug">{theme}</p>
                </motion.div>
              ))}
            </motion.div>

            {/* Guidelines */}
            <ScrollReveal className="mt-10">
              <h3 className="font-display font-bold text-xl text-[var(--dark-text)] mb-4">Abstract Guidelines</h3>
              <ul className="space-y-2.5">
                {GUIDELINES.map((g, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-[var(--muted-text)]">
                    <span className="w-5 h-5 rounded-full bg-[var(--crimson-800)] text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    {g}
                  </li>
                ))}
              </ul>
            </ScrollReveal>
          </div>

          {/* Important Dates */}
          <div>
            <ScrollReveal>
              <div className="rounded-2xl bg-[var(--crimson-800)] p-6 sticky top-28">
                <p className="text-xs font-bold tracking-widest uppercase text-[var(--gold-400)] mb-5">Important Dates</p>
                <div className="space-y-4">
                  {IMPORTANT_DATES.map((d, i) => (
                    <div key={i} className="flex gap-3 items-start">
                      <div className="w-2 h-2 rounded-full bg-[var(--gold-500)] mt-1.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-white/60 leading-snug">{d.event}</p>
                        <p className="text-sm font-bold text-[var(--gold-400)]">{d.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      <CulturalDivider variant="lotus-row" className="container-site" />

      {/* Submission Form */}
      <section className="py-16 md:py-20">
        <div className="container-site max-w-3xl mx-auto">
          <ScrollReveal className="mb-8">
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-[var(--dark-text)]">Submit Your Abstract</h2>
          </ScrollReveal>

          {submitted ? (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="py-16 text-center rounded-2xl bg-white border border-[var(--gold-500)]/20 shadow-sm">
              <CheckCircle size={56} className="mx-auto text-emerald-500 mb-4" />
              <h3 className="font-display font-bold text-2xl text-[var(--dark-text)] mb-2">Abstract Submitted!</h3>
              <p className="text-[var(--muted-text)] max-w-md mx-auto">Your abstract has been received. Acceptance notifications will be sent by 10 October 2026.</p>
            </motion.div>
          ) : (
            <ScrollReveal>
              <form onSubmit={handleSubmit(onSubmit)} noValidate className="rounded-2xl bg-white border border-[var(--gold-500)]/20 shadow-sm p-6 md:p-8 space-y-6">

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-[var(--muted-text)] uppercase tracking-wide mb-1.5">Abstract Title <span className="text-red-500">*</span></label>
                    <input {...register("title", { required: "Title required" })} placeholder="Full title of your abstract" className={inputCls(!!errors.title)} />
                    {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>}
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-[var(--muted-text)] uppercase tracking-wide mb-1.5">Authors <span className="text-red-500">*</span></label>
                    <input {...register("authors", { required: "Authors required" })} placeholder="Author1, Author2*, Author3 — Presenting author marked with *" className={inputCls(!!errors.authors)} />
                    {errors.authors && <p className="mt-1 text-xs text-red-500">{errors.authors.message}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--muted-text)] uppercase tracking-wide mb-1.5">Institution <span className="text-red-500">*</span></label>
                    <input {...register("institution", { required: "Institution required" })} placeholder="Institution name, City" className={inputCls(!!errors.institution)} />
                    {errors.institution && <p className="mt-1 text-xs text-red-500">{errors.institution.message}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--muted-text)] uppercase tracking-wide mb-1.5">Presenting Author <span className="text-red-500">*</span></label>
                    <input {...register("presenting", { required: "Presenting author required" })} placeholder="Name of presenting author" className={inputCls(!!errors.presenting)} />
                    {errors.presenting && <p className="mt-1 text-xs text-red-500">{errors.presenting.message}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--muted-text)] uppercase tracking-wide mb-1.5">Email <span className="text-red-500">*</span></label>
                    <input type="email" {...register("email", { required: "Email required", pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Invalid email" } })} placeholder="Contact email" className={inputCls(!!errors.email)} />
                    {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--muted-text)] uppercase tracking-wide mb-1.5">Mobile</label>
                    <input type="tel" {...register("phone")} placeholder="10-digit mobile" className={inputCls()} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--muted-text)] uppercase tracking-wide mb-1.5">Theme <span className="text-red-500">*</span></label>
                    <select {...register("theme", { required: "Select a theme" })} className={inputCls(!!errors.theme)}>
                      <option value="">Select Theme</option>
                      {ABSTRACT_THEMES.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                    {errors.theme && <p className="mt-1 text-xs text-red-500">{errors.theme.message}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--muted-text)] uppercase tracking-wide mb-1.5">Presentation Type <span className="text-red-500">*</span></label>
                    <select {...register("type", { required: "Select type" })} className={inputCls(!!errors.type)}>
                      <option value="">Select Type</option>
                      <option value="oral">Oral Presentation</option>
                      <option value="poster">Poster Presentation</option>
                    </select>
                    {errors.type && <p className="mt-1 text-xs text-red-500">{errors.type.message}</p>}
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-[var(--muted-text)] uppercase tracking-wide mb-1.5">
                      Abstract Body <span className="text-red-500">*</span>
                      <span className="ml-2 normal-case font-normal text-[var(--muted-text)]">({abstractText.split(/\s+/).filter(Boolean).length}/300 words)</span>
                    </label>
                    <textarea
                      {...register("abstract", {
                        required: "Abstract body required",
                        validate: (v) => v.split(/\s+/).filter(Boolean).length >= 100 || "Minimum 100 words required",
                      })}
                      rows={8}
                      placeholder="Background: ... Objectives: ... Methods: ... Results: ... Conclusions: ..."
                      className={`${inputCls(!!errors.abstract)} resize-none`}
                    />
                    {errors.abstract && <p className="mt-1 text-xs text-red-500">{errors.abstract.message}</p>}
                  </div>
                </div>

                <button type="submit" disabled={isSubmitting}
                  className="w-full py-4 rounded-xl font-bold text-base bg-[var(--crimson-800)] text-white hover:bg-[var(--crimson-700)] disabled:opacity-60 transition-all duration-200 shadow-md"
                >
                  {isSubmitting ? "Submitting…" : "Submit Abstract"}
                </button>
              </form>
            </ScrollReveal>
          )}
        </div>
      </section>
    </div>
  );
}
