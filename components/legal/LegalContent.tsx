"use client";
import GoldenBadge from "@/components/ui/GoldenBadge";
import CulturalDivider from "@/components/ui/CulturalDivider";
import ScrollReveal from "@/components/ui/ScrollReveal";

interface LayoutProps {
  badge: string;
  title: React.ReactNode;
  subtitle?: string;
  updated?: string;
  children: React.ReactNode;
}

export function LegalPageLayout({ badge, title, subtitle, updated, children }: LayoutProps) {
  return (
    <div className="bg-[var(--cream-50)] min-h-screen">
      <section className="relative py-20 md:py-24 overflow-hidden">
        <div className="absolute inset-0 tribal-pattern-bg opacity-30" aria-hidden />
        <div className="container-site relative z-10 text-center">
          <GoldenBadge>{badge}</GoldenBadge>
          <h1 className="mt-6 font-display font-black text-4xl sm:text-5xl md:text-6xl text-[var(--dark-text)] leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-5 text-base md:text-lg text-[var(--muted-text)] max-w-2xl mx-auto">
              {subtitle}
            </p>
          )}
          {updated && (
            <p className="mt-4 text-xs font-semibold tracking-widest uppercase text-[var(--gold-500)]">
              Last updated: {updated}
            </p>
          )}
        </div>
      </section>

      <CulturalDivider variant="bastar" className="opacity-40" />

      <section className="py-16 md:py-20">
        <div className="container-site">
          <ScrollReveal>
            <div className="max-w-3xl mx-auto rounded-2xl bg-white border border-[var(--gold-500)]/15 shadow-sm p-6 md:p-10">
              {children}
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}

export function LegalH2({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-display font-bold text-xl md:text-2xl text-[var(--dark-text)] mt-8 mb-3 first:mt-0">
      {children}
    </h2>
  );
}

export function LegalP({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-sm md:text-base text-[var(--muted-text)] leading-relaxed mb-4">
      {children}
    </p>
  );
}

export function LegalList({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="space-y-3 mb-4">
      {items.map((item, i) => (
        <li key={i} className="flex gap-3 text-sm md:text-base text-[var(--muted-text)] leading-relaxed">
          <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[var(--gold-500)] shrink-0" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
