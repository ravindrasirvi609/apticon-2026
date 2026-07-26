import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "404 — Page Not Found | APTICON 2026",
};

export default function NotFound() {
  return (
    <div className="relative min-h-[70dvh] flex flex-col items-center justify-center text-center px-6 overflow-hidden">
      {/* Background tribal pattern */}
      <div className="absolute inset-0 tribal-pattern-bg opacity-20" aria-hidden />

      {/* Decorative Gondi sun watermark */}
      <div className="absolute opacity-5 w-96 h-96 pointer-events-none" aria-hidden>
        <img src="/cultural/gondi-sun.svg" alt="" className="w-full h-full" />
      </div>

      <div className="relative z-10">
        {/* 404 number */}
        <p className="font-display font-black text-[8rem] sm:text-[12rem] leading-none text-gradient-crimson select-none">
          404
        </p>

        <h1 className="font-display font-bold text-2xl sm:text-3xl text-[var(--dark-text)] mt-2 mb-4">
          Page Not Found
        </h1>
        <p className="text-[var(--muted-text)] max-w-sm mx-auto mb-8 text-sm sm:text-base">
          The page you are looking for does not exist or has been moved. Let's get you back to APTICON 2026.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="px-8 py-3 rounded-xl bg-[var(--crimson-800)] text-white font-semibold text-sm hover:bg-[var(--crimson-700)] transition-colors shadow-md focus:outline-none focus:ring-2 focus:ring-[var(--gold-400)] focus:ring-offset-2"
          >
            Back to Home
          </Link>
          <Link
            href="/contact"
            className="px-8 py-3 rounded-xl border-2 border-[var(--crimson-800)] text-[var(--crimson-800)] font-semibold text-sm hover:bg-[var(--crimson-800)] hover:text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--gold-400)] focus:ring-offset-2"
          >
            Contact Us
          </Link>
        </div>

        {/* Quick links */}
        <div className="mt-10 flex flex-wrap gap-x-6 gap-y-2 justify-center">
          {[
            { label: "About", href: "/about" },
            { label: "Schedule", href: "/schedule" },
            { label: "Registration", href: "/registration" },
            { label: "Venue", href: "/venue" },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-[var(--muted-text)] hover:text-[var(--crimson-800)] transition-colors underline underline-offset-2"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
