"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Printer } from "lucide-react";
import { Button } from "@/components/ui/shadcn/button";

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
    <div className="p-4 md:p-8 flex flex-col items-center bg-slate-100 min-h-screen">
      <style>{`
        @page { size: 92mm 132mm; margin: 0; }
        @media print {
          body { background: white !important; }
          .id-card-toolbar { display: none !important; }
          .id-card-sheet { box-shadow: none !important; margin: 0 !important; }
        }
      `}</style>

      <div className="id-card-toolbar w-full max-w-[92mm] flex items-center justify-between mb-6 print:hidden">
        <Link
          href={detailHref}
          className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
        <Button onClick={() => window.print()}>
          <Printer className="w-4 h-4" /> Print
        </Button>
      </div>

      <article className="id-card-sheet relative h-[132mm] w-[92mm] shrink-0 overflow-hidden bg-white shadow-lg print:shadow-none">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/id card.jpg"
          alt=""
          className="absolute inset-0 h-full w-full"
        />
        {/* Photo, QR and registration code belong in the blank yellow section. */}
        <div className="absolute left-[18%] right-[18%] top-[48%] h-[15.5%]">
          <div className="flex h-full items-start justify-center gap-[12%] pt-[2%]">
            <div className="h-[99%] aspect-square overflow-hidden rounded-md border-[3px] border-[#ad4822] bg-white shadow-sm">
              {data.photoUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={data.photoUrl}
                  alt={data.fullName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-[clamp(18px,3vw,34px)] font-bold text-[#8d1b3d]">
                  {data.fullName.charAt(0)}
                </div>
              )}
            </div>
            <div className="flex h-full min-w-0 flex-col items-center">
              {data.qrCode && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={data.qrCode}
                  alt={`QR code for ${data.registrationCode}`}
                  className="h-[92%] aspect-square"
                />
              )}
              <div className="mt-[2%] whitespace-nowrap font-mono text-[clamp(10px,1.5vw,17px)] font-bold text-[#8d1b3d]">
                {data.registrationCode}
              </div>
            </div>
          </div>
        </div>
        {/* Delegate details stay inside the white rounded panel. */}
        <div className="absolute left-[10%] right-[10%] top-[69%] h-[18%]">
          <div className="absolute inset-x-0 text-center font-sans leading-[1.15] text-[#4b1725]">
            <div className="truncate text-[clamp(10px,1.6vw,18px)] font-extrabold">
              {data.fullName}
            </div>
            <div className="truncate text-[clamp(8px,1.1vw,12px)]">
              {data.designation}
            </div>
            <div className="mx-auto max-w-[82%] whitespace-normal break-words [overflow-wrap:anywhere] text-[clamp(8px,1.1vw,12px)] leading-tight line-clamp-2">
              {data.institution}
            </div>
            <div className="truncate text-[clamp(7px,1vw,10px)] font-semibold uppercase tracking-wide">
              {data.category}
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}
