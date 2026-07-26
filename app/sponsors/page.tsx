import type { Metadata } from "next";
import SponsorsClient from "./SponsorsClient";

export const metadata: Metadata = {
  title: "Sponsors | APTICON 2026",
  description: "Sponsorship opportunities for APTICON 2026 — support India's premier pharmacy education convention.",
};

export default function SponsorsPage() {
  return <SponsorsClient />;
}
