import Image from "next/image";
import { CheckCircle, Clock } from "lucide-react";
import DelegatePhoto from "@/components/ui/DelegatePhoto";
import type { BadgeData } from "../types";

interface Props {
  badge: BadgeData;
  className?: string;
}

/**
 * Static, non-physics ID card. Used for prefers-reduced-motion, as the dynamic-import loading
 * placeholder for the 3D scene, and as the always-present accessible text underneath it.
 */
export default function IDCardFallback({ badge, className = "" }: Props) {
  const { fullName, designation, institution, registrationCode, photoUrl, confirmed } = badge;

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {/* Static lanyard + clip, purely decorative */}
      <div aria-hidden className="flex flex-col items-center">
        <div className="w-2 h-16 rounded-full bg-gradient-to-b from-[var(--crimson-800)] to-[var(--crimson-700)]" />
        <div className="w-10 h-4 rounded-sm bg-[var(--dark-text)]/70 -mt-1" />
      </div>

      <div className="relative w-64 rounded-2xl border border-[var(--gold-500)]/30 bg-white shadow-xl px-5 pt-6 pb-5 text-center">
        <div className="mx-auto mb-3 h-6 w-6 rounded-full border-4 border-[var(--cream-100)] bg-white absolute -top-3 left-1/2 -translate-x-1/2" />

        <Image
          src="/logo/APTICON_LOGO.png"
          alt="APTICON 2026"
          width={1536}
          height={1024}
          className="h-6 w-auto mx-auto mb-3"
        />

        <DelegatePhoto url={photoUrl} name={fullName} size={72} className="mx-auto" />

        <p className="mt-3 font-display text-lg font-bold text-[var(--crimson-800)] leading-tight">
          {fullName}
        </p>
        <p className="text-xs text-[var(--muted-text)]">{designation}</p>
        <p className="text-xs text-[var(--muted-text)] font-medium">{institution}</p>

        <div className="mt-3 border-t border-dashed border-[var(--gold-500)]/30 pt-3">
          <p className="font-mono text-sm font-bold text-[var(--dark-text)]">{registrationCode}</p>
          <div
            className={`mt-2 inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
              confirmed ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
            }`}
          >
            {confirmed ? <CheckCircle className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
            {confirmed ? "Registration Confirmed" : "Payment Processing"}
          </div>
        </div>
      </div>
    </div>
  );
}
