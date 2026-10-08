import type { Metadata } from "next";
import ExhibitionClient from "./ExhibitionClient";

export const metadata: Metadata = {
  title: "Exhibition & Expo | APTICON 2026",
  description:
    "Exhibit at APTICON 2026, Raipur — a platform for pharmaceutical companies, healthcare organizations, technology providers, publishers and equipment manufacturers.",
};

export default function ExhibitionPage() {
  return <ExhibitionClient />;
}
