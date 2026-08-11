"use client";
import FloatingParticles from "@/components/ui/FloatingParticles";

/**
 * Decorative only — kept deliberately quiet (low particle count, soft radial glow) so it never
 * competes with the badge, which is the page's hero visual.
 */
export default function SuccessBackground() {
  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden pointer-events-none">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 20%, rgba(212,175,55,0.14), transparent 70%), radial-gradient(80% 60% at 50% 100%, rgba(139,26,26,0.08), transparent 70%)",
        }}
      />
      <FloatingParticles count={5} />
    </div>
  );
}
