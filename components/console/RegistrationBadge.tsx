"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Printer } from "lucide-react";
import { Button } from "@/components/ui/shadcn/button";
import DelegatePhoto from "@/components/ui/DelegatePhoto";

interface BadgeData {
  registrationCode: string;
  fullName: string;
  designation: string;
  institution: string;
  category: string;
  photoUrl?: string;
  qrCode?: string;
  status: string;
}

interface Props {
  id: string;
  detailHref: string; // the registration detail page this badge belongs to, e.g. "/admin/registrations/507f..."
}

export default function RegistrationBadge({ id, detailHref }: Props) {
  const [data, setData] = useState<BadgeData | null>(null);

  useEffect(() => {
    fetch(`/api/registrations/${id}`)
      .then((res) => res.json())
      .then((d) => setData(d.registration))
      .catch(() => setData(null));
  }, [id]);

  if (!data)
    return <div className="p-8 text-sm text-[var(--muted-text)]">Loading…</div>;

  if (data.status !== "approved") {
    return (
      <div className="p-8 flex flex-col items-center gap-3 text-center">
        <div className="text-sm text-[var(--muted-text)]">
          The badge is only available once payment is confirmed. This
          registration&rsquo;s payment is not complete yet.
        </div>
        <Link
          href={detailHref}
          className="inline-flex items-center gap-1 text-sm text-[var(--primary-800)] hover:underline"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 flex flex-col items-center">
      {/* @page is inherently print-job-scoped — keeping it colocated with the one page that needs it. */}
      <style>{"@page { margin: 0.5in; }"}</style>

      <div className="w-full max-w-md flex items-center justify-between mb-6 print:hidden">
        <Link
          href={detailHref}
          className="inline-flex items-center gap-1 text-sm text-[var(--muted-text)] hover:text-[var(--primary-800)]"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
        <Button onClick={() => window.print()}>
          <Printer className="w-4 h-4" /> Print
        </Button>
      </div>

      <div className="w-full max-w-md rounded-2xl border-2 border-[var(--accent-500)]/40 bg-white p-8 text-center shadow-sm">
        <div className="text-xs font-semibold tracking-widest uppercase text-[var(--primary-800)]">
          APTICON 2026
        </div>
        <div className="text-[10px] text-[var(--muted-text)] mt-0.5">
          28th Annual National Convention · Raipur (C.G.)
        </div>

        <div className="mt-5 flex justify-center">
          <DelegatePhoto url={data.photoUrl} name={data.fullName} size={96} />
        </div>

        <div className="mt-4 font-display text-xl font-bold text-[var(--dark-text)]">
          {data.fullName}
        </div>
        <div className="text-sm text-[var(--muted-text)] mt-1">
          {data.designation}
        </div>
        <div className="text-sm text-[var(--muted-text)]">
          {data.institution}
        </div>
        <div className="text-xs uppercase tracking-wider text-[var(--primary-800)] font-semibold mt-2">
          {data.category}
        </div>

        {data.qrCode && (
          <div className="mt-5 flex justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={data.qrCode}
              alt="QR code encoding this registration code"
              width={160}
              height={160}
              className="rounded-lg border border-[var(--accent-500)]/20 bg-white p-2"
            />
          </div>
        )}

        <div className="mt-4 font-mono text-lg font-black text-[var(--primary-800)]">
          {data.registrationCode}
        </div>
      </div>
    </div>
  );
}
