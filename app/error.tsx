"use client";
import { useEffect } from "react";
import Link from "next/link";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="relative min-h-[70dvh] flex flex-col items-center justify-center text-center px-6 overflow-hidden">
      <div className="absolute inset-0 tribal-pattern-bg opacity-20" aria-hidden />

      <div className="relative z-10">
        <p className="font-display font-black text-[6rem] sm:text-[8rem] leading-none text-gradient-primary select-none">
          Oops
        </p>
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-[var(--dark-text)] mt-2 mb-3">
          Something went wrong
        </h1>
        <p className="text-[var(--muted-text)] max-w-sm mx-auto mb-8 text-sm">
          An unexpected error occurred. Please try again or contact us if the problem persists.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="px-8 py-3 rounded-xl bg-[var(--primary-800)] text-white font-semibold text-sm hover:bg-[var(--primary-700)] transition-colors shadow-md focus:outline-none focus:ring-2 focus:ring-[var(--accent-400)] focus:ring-offset-2"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="px-8 py-3 rounded-xl border-2 border-[var(--primary-800)] text-[var(--primary-800)] font-semibold text-sm hover:bg-[var(--primary-800)] hover:text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--accent-400)] focus:ring-offset-2"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
