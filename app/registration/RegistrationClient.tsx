"use client";
import Link from "next/link";
import {
  ClipboardEdit,
  CreditCard,
  MailCheck,
  QrCode,
  Search,
} from "lucide-react";
import { EVENT } from "@/lib/constants";

const HOW_TO_REGISTER = [
  {
    icon: QrCode,
    title: "Scan QR Code",
    body: "Open the registration link by scanning the QR code in the brochure, or visit apticon.in/registration.",
  },
  {
    icon: ClipboardEdit,
    title: "Complete Registration",
    body: "Fill in your details and complete the registration form below.",
  },
  {
    icon: CreditCard,
    title: "Make Payment",
    body: "Pay securely using UPI, cards, net banking, or other available payment methods.",
  },
  {
    icon: MailCheck,
    title: "Receive Confirmation",
    body: "After successful payment, you will receive a confirmation email from the organiser.",
  },
];
import GoldenBadge from "@/components/ui/GoldenBadge";
import CulturalDivider from "@/components/ui/CulturalDivider";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { Button } from "@/components/ui/shadcn/button";
import FeeTable from "@/components/registration/FeeTable";
import RegistrationForm from "@/components/registration/RegistrationForm";

export default function RegistrationClient() {
  const scrollToRegistrationForm = () => {
    document
      .getElementById("registration-form")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="bg-[var(--surface-50)] min-h-screen">
      {/* Hero */}
      <section className="relative py-24 md:py-28 overflow-hidden">
        <div
          className="absolute inset-0 tribal-pattern-bg opacity-30"
          aria-hidden
        />
        <div className="container-site relative z-10 text-center">
          <GoldenBadge>Registration</GoldenBadge>
          <h1 className="mt-6 font-display font-black text-4xl sm:text-5xl md:text-6xl text-[var(--dark-text)] leading-tight">
            Register for{" "}
            <span className="text-gradient-primary">APTICON 2026</span>
          </h1>
          <p className="mt-5 text-base md:text-lg text-[var(--muted-text)] max-w-xl mx-auto">
            Join 1500+ pharmacy educators and researchers at India's premier
            pharmaceutical education convention.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={scrollToRegistrationForm}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-semibold hover:bg-emerald-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2"
              aria-label="Scroll to registration form"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Registration Open
            </button>
            <Link href="/registration/status">
              <Button variant="outline" size="sm">
                <Search className="w-4 h-4" />
                Check Registration Status
              </Button>
            </Link>
            <Link href="/registration/group">
              <Button variant="outline" size="sm">
                Registering 10+ delegates? Use Group Registration
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
            <p className="text-[var(--muted-text)] text-sm">
              Register early to avail discounted rates.
            </p>
          </ScrollReveal>
          <ScrollReveal>
            <FeeTable />
          </ScrollReveal>
        </div>
      </section>

      {/* How to Register */}
      <section className="py-16 bg-[var(--surface-100)]">
        <div className="container-site">
          <ScrollReveal className="mb-10">
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-[var(--dark-text)]">
              How to Register
            </h2>
          </ScrollReveal>
          <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {HOW_TO_REGISTER.map((step, i) => (
              <li
                key={step.title}
                className="rounded-2xl bg-white border border-[var(--accent-500)]/20 p-5 shadow-sm"
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="w-10 h-10 rounded-full bg-[var(--accent-500)] text-white font-display font-black flex items-center justify-center">
                    {i + 1}
                  </span>
                  <step.icon size={22} className="text-[var(--primary-800)]" />
                </div>
                <p className="font-semibold text-[var(--dark-text)]">
                  {step.title}
                </p>
                <p className="mt-1 text-sm text-[var(--muted-text)] leading-relaxed">
                  {step.body}
                </p>
              </li>
            ))}
          </ol>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="rounded-xl bg-white border border-[var(--accent-500)]/20 p-4">
              <p className="font-bold text-[var(--primary-800)] mb-1">
                Payment &amp; Registration
              </p>
              <p className="text-[var(--muted-text)]">
                Secure online payment through Razorpay using UPI, cards, net
                banking, or other enabled methods. Registration is confirmed
                after successful payment capture, and confirmation is sent by
                email.
              </p>
            </div>
            <div className="rounded-xl bg-white border border-[var(--accent-500)]/20 p-4">
              <p className="font-bold text-[var(--primary-800)] mb-1">
                Cancellation / Refund
              </p>
              <p className="text-[var(--muted-text)]">
                Registration fees are non-refundable and non-transferable. Once
                payment is made, it cannot be refunded or transferred to another
                person or event.
              </p>
            </div>
            <div className="rounded-xl bg-white border border-[var(--accent-500)]/20 p-4">
              <p className="font-bold text-[var(--primary-800)] mb-1">
                Registration Support
              </p>
              <a
                href={`mailto:${EVENT.contact}`}
                className="text-[var(--primary-800)] font-semibold hover:underline"
              >
                {EVENT.contact}
              </a>
              <p className="mt-1 text-[var(--muted-text)]">
                Accompanying persons get Food Court access, but no Registration
                Kit.
              </p>
            </div>
          </div>
        </div>
      </section>

      <CulturalDivider variant="lotus-row" className="container-site" />

      {/* Form */}
      <section id="registration-form" className="py-16 md:py-20 scroll-mt-24">
        <div className="container-site">
          <div className="max-w-3xl mx-auto">
            <ScrollReveal className="mb-10">
              <h2 className="font-display font-bold text-2xl sm:text-3xl text-[var(--dark-text)] mb-2">
                Registration Form
              </h2>
              <p className="text-[var(--muted-text)] text-sm">
                Fields marked with <span className="text-red-500">*</span> are
                required.
              </p>
            </ScrollReveal>
            <ScrollReveal>
              <div className="rounded-2xl bg-white border border-[var(--accent-500)]/20 shadow-sm p-6 md:p-8">
                <RegistrationForm />
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>
    </div>
  );
}
