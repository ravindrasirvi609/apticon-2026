"use client";
import { Suspense, useSyncExternalStore } from "react";
import dynamic from "next/dynamic";
import { useReducedMotion } from "framer-motion";
import IDCardFallback from "./IDCardFallback";
import type { BadgeData } from "../types";

const BadgeScene = dynamic(() => import("./BadgeScene"), { ssr: false });

const noopSubscribe = () => () => {};
const getMountedSnapshot = () => true;
const getServerSnapshot = () => false;

/**
 * True only after hydration has committed. React always uses `getServerSnapshot` for both the
 * server render and the client's first (pre-hydration) render, then re-checks after mount — so
 * this can never itself cause a hydration mismatch, unlike a plain `useEffect(() => setState)`.
 */
function useHasMounted() {
  return useSyncExternalStore(noopSubscribe, getMountedSnapshot, getServerSnapshot);
}

interface Props {
  badge: BadgeData;
  onFirstInteract?: () => void;
}

export default function InteractiveBadge({ badge, onFirstInteract }: Props) {
  const reducedMotion = useReducedMotion();
  // The server can never know the client's prefers-reduced-motion setting, so the very first
  // client render must render the same subtree the server did (the 3D branch) regardless of the
  // real preference — otherwise React flags a hydration mismatch. Only trust `reducedMotion`
  // once mounted, one tick after hydration has already reconciled successfully.
  const hasMounted = useHasMounted();
  const showStaticFallback = hasMounted && reducedMotion;

  const srSummary = `ID badge for ${badge.fullName}, ${badge.designation} at ${badge.institution}. Registration code ${badge.registrationCode}. ${
    badge.confirmed ? "Registration confirmed." : "Payment processing."
  }`;

  return (
    <figure className="relative mx-auto" aria-label={srSummary}>
      <span className="sr-only">{srSummary}</span>

      {showStaticFallback ? (
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
