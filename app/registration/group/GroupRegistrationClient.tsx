"use client";
import Link from "next/link";
import { Search } from "lucide-react";
import GoldenBadge from "@/components/ui/GoldenBadge";
import CulturalDivider from "@/components/ui/CulturalDivider";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { Button } from "@/components/ui/shadcn/button";
import GroupRegistrationForm from "@/components/registration/GroupRegistrationForm";
import { GROUP_MIN_DELEGATES } from "@/lib/validators/group-registration";
import { GROUP_COMPLIMENTARY_AT } from "@/lib/registration-fees";

export default function GroupRegistrationClient() {
  return (
    <div className="bg-[var(--cream-50)] min-h-screen">

      {/* Hero */}
      <section className="relative py-24 md:py-28 overflow-hidden">
        <div className="absolute inset-0 tribal-pattern-bg opacity-30" aria-hidden />
        <div className="container-site relative z-10 text-center">
          <GoldenBadge>Group Registration</GoldenBadge>
          <h1 className="mt-6 font-display font-black text-4xl sm:text-5xl md:text-6xl text-[var(--dark-text)] leading-tight">
            Register Your <span className="text-gradient-crimson">Whole Group</span>
          </h1>
          <p className="mt-5 text-base md:text-lg text-[var(--muted-text)] max-w-xl mx-auto">
            Bring {GROUP_MIN_DELEGATES} or more delegates from your institution to APTICON 2026 — groups of {GROUP_COMPLIMENTARY_AT} or more get 1 seat free — one form, one payment.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link href="/registration">
              <Button variant="outline" size="sm">Registering alone? Use the individual form</Button>
            </Link>
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

      {/* Form */}
      <section className="py-16 md:py-20">
        <div className="container-site">
          <div className="max-w-4xl mx-auto">
            <ScrollReveal className="mb-10">
              <h2 className="font-display font-bold text-2xl sm:text-3xl text-[var(--dark-text)] mb-2">
                Group Registration Form
              </h2>
              <p className="text-[var(--muted-text)] text-sm">
                Fields marked with <span className="text-red-500">*</span> are required. Minimum {GROUP_MIN_DELEGATES} delegates per group.
              </p>
            </ScrollReveal>
            <ScrollReveal>
              <div className="rounded-2xl bg-white border border-[var(--gold-500)]/20 shadow-sm p-6 md:p-8">
                <GroupRegistrationForm />
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>
    </div>
  );
}
