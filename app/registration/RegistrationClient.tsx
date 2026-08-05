"use client";
import Link from "next/link";
import { Search } from "lucide-react";
import GoldenBadge from "@/components/ui/GoldenBadge";
import CulturalDivider from "@/components/ui/CulturalDivider";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { Button } from "@/components/ui/shadcn/button";
import FeeTable from "@/components/registration/FeeTable";
import RegistrationForm from "@/components/registration/RegistrationForm";

export default function RegistrationClient() {
  return (
    <div className="bg-[var(--cream-50)] min-h-screen">

      {/* Hero */}
      <section className="relative py-24 md:py-28 overflow-hidden">
        <div className="absolute inset-0 tribal-pattern-bg opacity-30" aria-hidden />
        <div className="container-site relative z-10 text-center">
          <GoldenBadge>Registration</GoldenBadge>
          <h1 className="mt-6 font-display font-black text-4xl sm:text-5xl md:text-6xl text-[var(--dark-text)] leading-tight">
            Register for <span className="text-gradient-crimson">APTICON 2026</span>
          </h1>
          <p className="mt-5 text-base md:text-lg text-[var(--muted-text)] max-w-xl mx-auto">
            Join 1500+ pharmacy educators and researchers at India's premier pharmaceutical education convention.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Registration Open
            </div>
            <Link href="/registration/status">
              <Button variant="outline" size="sm">
                <Search className="w-4 h-4" />
                Check Registration Status
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <CulturalDivider variant="bastar" className="opacity-40" />

      {/* Fee Table */}
      <section className="py-16 md:py-20">
        <div className="container-site">
          <ScrollReveal className="mb-10">
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-[var(--dark-text)] mb-2">
              Registration Fees
            </h2>
            <p className="text-[var(--muted-text)] text-sm">Register early to avail discounted rates.</p>
          </ScrollReveal>
          <ScrollReveal>
            <FeeTable />
          </ScrollReveal>
        </div>
      </section>

      <CulturalDivider variant="lotus-row" className="container-site" />

      {/* Form */}
      <section className="py-16 md:py-20">
        <div className="container-site">
          <div className="max-w-3xl mx-auto">
            <ScrollReveal className="mb-10">
              <h2 className="font-display font-bold text-2xl sm:text-3xl text-[var(--dark-text)] mb-2">
                Registration Form
              </h2>
              <p className="text-[var(--muted-text)] text-sm">Fields marked with <span className="text-red-500">*</span> are required.</p>
            </ScrollReveal>
            <ScrollReveal>
              <div className="rounded-2xl bg-white border border-[var(--gold-500)]/20 shadow-sm p-6 md:p-8">
                <RegistrationForm />
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>
    </div>
  );
}
