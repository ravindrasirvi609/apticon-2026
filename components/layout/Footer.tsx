import Image from "next/image";
import Link from "next/link";
import { Mail, MapPin, Calendar } from "lucide-react";
import { NAV_LINKS, EVENT } from "@/lib/constants";
import CulturalDivider from "@/components/ui/CulturalDivider";

const QUICK_LINKS = NAV_LINKS.slice(0, 6);
const INFO_LINKS  = NAV_LINKS.slice(6);

const LEGAL_LINKS = [
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms & Conditions", href: "/terms-conditions" },
  { label: "Refund & Cancellation Policy", href: "/refund-policy" },
];

export default function Footer() {
  return (
    <footer className="bg-[var(--dark-text)] text-white">
      {/* Wave top */}
      <div className="wave-divider rotate-180 -mb-1">
        <svg viewBox="0 0 1440 60" preserveAspectRatio="none" className="w-full h-12 md:h-16">
          <path
            d="M0,30 C240,55 480,5 720,30 C960,55 1200,5 1440,30 L1440,60 L0,60 Z"
            fill="#1A1A2E"
          />
        </svg>
      </div>

      {/* Bastar border top */}
      <CulturalDivider variant="bastar" className="opacity-30" />

      <div className="container-site py-12 md:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="mb-4">
              <Image
                src="/logo/APTICON_WORDMARK.png"
                alt="APTICON 2026"
                width={1536}
                height={375}
                className="h-10 w-auto"
              />
            </div>
            <p className="text-xs font-semibold tracking-widest uppercase text-white/50 mb-4">
              28th Annual National Convention
            </p>
            <p className="text-sm text-white/70 leading-relaxed mb-4">
              {EVENT.theme}
            </p>
            <p className="text-sm font-devanagari text-[var(--gold-400)]/80">
              {EVENT.themeHindi}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-bold tracking-widest uppercase text-[var(--gold-500)] mb-5">
              Quick Links
            </h3>
            <ul className="space-y-2.5">
              {QUICK_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/65 hover:text-[var(--gold-400)] transition-colors flex items-center gap-1.5 group"
                  >
                    <span className="w-1 h-1 rounded-full bg-[var(--gold-500)]/50 group-hover:bg-[var(--gold-400)] transition-colors" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info Links */}
          <div>
            <h3 className="text-sm font-bold tracking-widest uppercase text-[var(--gold-500)] mb-5">
              Information
            </h3>
            <ul className="space-y-2.5">
              {INFO_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/65 hover:text-[var(--gold-400)] transition-colors flex items-center gap-1.5 group"
                  >
                    <span className="w-1 h-1 rounded-full bg-[var(--gold-500)]/50 group-hover:bg-[var(--gold-400)] transition-colors" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-bold tracking-widest uppercase text-[var(--gold-500)] mb-5">
              Contact
            </h3>
            <ul className="space-y-4">
              <li className="flex gap-3">
                <Calendar size={16} className="mt-0.5 shrink-0 text-[var(--gold-500)]" />
                <div>
                  <p className="text-sm font-semibold text-white">{EVENT.dateDisplay}</p>
                  <p className="text-xs text-white/50 mt-0.5">Conference Dates</p>
                </div>
              </li>
              <li className="flex gap-3">
                <MapPin size={16} className="mt-0.5 shrink-0 text-[var(--gold-500)]" />
                <div>
                  <p className="text-sm text-white/70 leading-snug">{EVENT.venue}</p>
                </div>
              </li>
              <li className="flex gap-3">
                <Mail size={16} className="mt-0.5 shrink-0 text-[var(--gold-500)]" />
                <a
                  href={`mailto:${EVENT.contact}`}
                  className="text-sm text-[var(--gold-400)] hover:text-[var(--gold-300)] transition-colors"
                >
                  {EVENT.contact}
                </a>
              </li>
            </ul>

            {/* Organizers */}
            <div className="mt-6 pt-6 border-t border-white/10">
              <p className="text-xs text-white/40 leading-relaxed">
                Hosted by <span className="text-white/70">{EVENT.host}</span>
              </p>
              <p className="text-xs text-white/40 leading-relaxed mt-1">
                In association with{" "}
                <span className="text-white/70">{EVENT.partner}</span>
              </p>
              <span className="inline-block mt-2 text-[10px] font-semibold tracking-widest uppercase px-2 py-0.5 rounded-sm bg-[var(--gold-500)]/20 text-[var(--gold-400)]">
                {EVENT.universityAccreditation}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <CulturalDivider variant="bastar" className="opacity-20" />
      <div className="bg-[var(--crimson-900)]/60 py-4">
        <div className="container-site flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5">
            {LEGAL_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xs text-white/50 hover:text-[var(--gold-400)] transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-white/40">
            <p>© 2026 APTICON · APTI Chhattisgarh State Branch. All rights reserved.</p>
            <p>
              Powered by{" "}
              <span className="text-[var(--gold-500)]/70">
                Operant Pharmacy Federation
              </span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
