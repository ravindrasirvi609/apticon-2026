import type { Metadata } from "next";
import StatusClient from "./StatusClient";

export const metadata: Metadata = {
  title: "Check Submission Status",
  description:
    "Look up the review status of your APTICON 2026 abstract submission.",
};

export default function StatusPage() {
  return <StatusClient />;
}
