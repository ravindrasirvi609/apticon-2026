import { Suspense } from "react";
import type { Metadata } from "next";
import ReviseClient from "./ReviseClient";

export const metadata: Metadata = {
  title: "Revise Your Abstract",
  description: "Update and resubmit your APTICON 2026 abstract after a revision request.",
};

export default function RevisePage() {
  return (
    <Suspense fallback={null}>
      <ReviseClient />
    </Suspense>
  );
}
