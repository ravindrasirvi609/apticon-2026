"use client";

import Link from "next/link";
import { ArrowLeft, Download, Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/shadcn/button";

interface CardData {
  fullName: string;
  designation: string;
  institution: string;
  category: string;
  registrationCode: string;
  photoUrl: string;
  qrCode: string;
}

export default function BulkIdCards({ cards }: { cards: CardData[] }) {
  const [printing, setPrinting] = useState(false);

  const printCards = () => {
    setPrinting(true);
    // Give the browser a frame to finish decoding remote delegate photos before printing.
    window.setTimeout(() => {
      window.print();
      setPrinting(false);
    }, 250);
  };

  return (
    <main className="min-h-screen bg-slate-100 p-4 md:p-8">
      <style>{`
        @page { size: A4 portrait; margin: 0; }
        @media print {
          body { background: white !important; }
          .id-card-toolbar { display: none !important; }
          .id-card-sheet { break-after: page; page-break-after: always; }
          .id-card-sheet:last-child { break-after: auto; page-break-after: auto; }
        }
      `}</style>

      <div className="id-card-toolbar mx-auto mb-6 flex max-w-[760px] items-center justify-between gap-3">
        <Link href="/admin/registrations" className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900">
          <ArrowLeft className="h-4 w-4" /> Back to registrations
        </Link>
        <Button onClick={printCards} disabled={printing || cards.length === 0}>
          {printing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
          Download PDF ({cards.length})
        </Button>
      </div>

      {cards.length === 0 ? (
        <div className="id-card-toolbar mx-auto max-w-[760px] rounded-lg bg-white p-8 text-center text-sm text-slate-600">
          No confirmed registrations have an ID card yet.
        </div>
      ) : (
        <div className="flex flex-col items-center gap-6">
          {cards.map((card) => (
            <article key={card.registrationCode} className="id-card-sheet relative aspect-[1090/1557] w-full max-w-[760px] overflow-hidden bg-white shadow-lg print:max-w-none print:shadow-none">
              <img src="/IDCARDAPTICON.png" alt="" className="absolute inset-0 h-full w-full" />
              {/* Photo, QR and registration code belong in the blank yellow section. */}
              <div className="absolute left-[18%] right-[18%] top-[48%] h-[15.5%]">
                <div className="flex h-full items-start justify-center gap-[12%] pt-[2%]">
                  <div className="h-[99%] aspect-square overflow-hidden rounded-md border-[3px] border-[#ad4822] bg-white shadow-sm">
                    {card.photoUrl ? <img src={card.photoUrl} alt={card.fullName} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-[clamp(18px,3vw,34px)] font-bold text-[#8d1b3d]">{card.fullName.charAt(0)}</div>}
                  </div>
                  <div className="flex h-full min-w-0 flex-col items-center">
                    <img src={card.qrCode} alt={`QR code for ${card.registrationCode}`} className="h-[92%] aspect-square" />
                    <div className="mt-[2%] whitespace-nowrap font-mono text-[clamp(10px,1.5vw,17px)] font-bold text-[#8d1b3d]">{card.registrationCode}</div>
                  </div>
                </div>
              </div>
              {/* Delegate details stay inside the white rounded panel. */}
              <div className="absolute left-[10%] right-[10%] top-[69%] h-[18%]">
                <div className="absolute inset-x-0 text-center font-sans leading-[1.15] text-[#4b1725]">
                  <div className="truncate text-[clamp(17px,3.1vw,34px)] font-extrabold">{card.fullName}</div>
                  <div className="truncate text-[clamp(13px,2.1vw,24px)]">{card.designation}</div>
                  <div className="mx-auto max-w-[82%] whitespace-normal break-words [overflow-wrap:anywhere] text-[clamp(13px,2.1vw,24px)] leading-tight line-clamp-2">
                    {card.institution}
                  </div>
                  <div className="truncate text-[clamp(12px,1.9vw,21px)] font-semibold uppercase tracking-wide">{card.category}</div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
