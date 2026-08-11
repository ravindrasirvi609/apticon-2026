"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import SuccessBackground from "./SuccessBackground";
import ConfirmationContent from "./ConfirmationContent";
import InteractiveBadge from "./InteractiveBadge";
import InteractionHint from "./InteractionHint";
import SuccessActions from "./SuccessActions";
import type { BadgeData } from "./types";

interface Props {
  badge: BadgeData;
  qrDataUrl: string;
}

export default function RegistrationSuccessExperience({ badge, qrDataUrl }: Props) {
  const [hasInteracted, setHasInteracted] = useState(false);

  return (
    <div className="relative min-h-[90vh] px-4 py-16 bg-[var(--cream-50)] overflow-hidden">
      <SuccessBackground />

      <div className="relative z-10 flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <InteractiveBadge badge={badge} onFirstInteract={() => setHasInteracted(true)} />
        </motion.div>

        <InteractionHint dismissed={hasInteracted} />

        <div className="mt-10 w-full">
          <ConfirmationContent badge={badge} qrDataUrl={qrDataUrl} />
          <SuccessActions />
        </div>
      </div>
    </div>
  );
}
