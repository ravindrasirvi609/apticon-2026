"use client";
import { Suspense } from "react";
import dynamic from "next/dynamic";
import { useReducedMotion } from "framer-motion";
import IDCardFallback from "./IDCardFallback";
import type { BadgeData } from "../types";

const BadgeScene = dynamic(() => import("./BadgeScene"), { ssr: false });

interface Props {
  badge: BadgeData;
  onFirstInteract?: () => void;
}

export default function InteractiveBadge({ badge, onFirstInteract }: Props) {
  const reducedMotion = useReducedMotion();

  const srSummary = `ID badge for ${badge.fullName}, ${badge.designation} at ${badge.institution}. Registration code ${badge.registrationCode}. ${
    badge.confirmed ? "Registration confirmed." : "Payment processing."
  }`;

  return (
    <figure className="relative mx-auto" aria-label={srSummary}>
      <span className="sr-only">{srSummary}</span>

      {reducedMotion ? (
        <IDCardFallback badge={badge} />
      ) : (
        <div aria-hidden>
          <Suspense fallback={<IDCardFallback badge={badge} />}>
            <BadgeScene badge={badge} onDragStart={onFirstInteract} />
          </Suspense>
        </div>
      )}
    </figure>
  );
}
