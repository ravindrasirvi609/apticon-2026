"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { Handshake, ArrowRight } from "lucide-react";

const CO_ASSOCIATES = [
  { name: "Rungta International Skills University", logo: "/sponsors/rungta.png" },
  { name: "Columbia Professional University", logo: "/sponsors/columbia.png" },
  { name: "NIMS University, Jaipur", logo: "/sponsors/nims.png" },
  { name: "SAGE University", logo: "/sponsors/sage.png" },
  { name: "Gracious College of Pharmacy", logo: "/sponsors/gracious.png" },
  { name: "Shri Shankaracharya Professional University", logo: "/sponsors/shankaracharya.png" },
  { name: "D Y Patil University, Navi Mumbai", logo: "/sponsors/dy-patil.png" },
  { name: "Shri Davara University", logo: "/sponsors/davara.png" },
  { name: "Sri Aurobindo Institute of Pharmacy", logo: "/sponsors/sri-aurobindo.png" },
];

const POWERED_BY = [
  { name: "Operant Pharmacy Federation", logo: "/sponsors/opf.png" },
  { name: "GPAT Discussion Center", logo: "/sponsors/gpat.png" },
];

function LogoTile({ name, logo }: { name: string; logo: string }) {
  return (
    <div className="mx-3 flex h-24 w-48 shrink-0 items-center justify-center rounded-2xl border border-[var(--surface-200)] bg-white p-3 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md sm:mx-4 sm:w-56">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={logo} alt={name} className="max-h-full max-w-full object-contain" />
    </div>
  );
}

const DOUBLED = [...CO_ASSOCIATES, ...CO_ASSOCIATES];

export default function SponsorMarquee() {
  return (
    <section className="border-t border-[var(--surface-200)] bg-[var(--surface-50)] py-16 sm:py-20">
      <div className="container-site mb-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-[var(--accent-500)]/30 bg-[var(--accent-500)]/10 px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--accent-500)] sm:text-[11px]">
            <Handshake size={12} />
            Co-Associates &amp; Partners
          </span>
          <h2 className="mt-5 font-display text-2xl font-bold text-[var(--dark-text)] sm:text-3xl md:text-4xl">
            Our Co-Associates
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-[var(--muted-text)]">
            Institutions partnering with APTICON 2026. Become a part of
            India&apos;s premier pharmacy education event.
          </p>
        </motion.div>
      </div>

      {/* Marquee */}
      <div className="relative w-full overflow-hidden py-1" aria-hidden>
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-[var(--surface-50)] to-transparent sm:w-28"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-[var(--surface-50)] to-transparent sm:w-28"
        />
        <div className="marquee-track">
          {DOUBLED.map((item, i) => (
            <LogoTile key={i} name={item.name} logo={item.logo} />
          ))}
        </div>
      </div>

      <div className="container-site mt-12 text-center">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--muted-text)]">
          Powered by
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-4">
          {POWERED_BY.map((p) => (
            <div
              key={p.name}
              className="flex h-28 w-56 items-center justify-center rounded-2xl border border-[var(--surface-200)] bg-white p-3 shadow-sm"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.logo} alt={p.name} className="max-h-full max-w-full object-contain" />
            </div>
          ))}
        </div>
      </div>

      <div className="container-site mt-10 flex justify-center">
        <Link
          href="/sponsors"
          className="group inline-flex items-center gap-2 rounded-full border-2 border-[var(--primary-800)] px-7 py-3 text-sm font-bold text-[var(--primary-800)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[var(--primary-800)] hover:text-white sm:text-base"
        >
          Sponsorship Opportunities
          <ArrowRight
            size={16}
            className="transition-transform duration-300 group-hover:translate-x-1"
          />
        </Link>
      </div>
    </section>
  );
}
