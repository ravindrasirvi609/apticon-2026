import type { Metadata } from "next";
import CommitteeClient from "./CommitteeClient";

export const metadata: Metadata = {
  title: "Organizing Committee | APTICON 2026",
  description: "Meet the organizing committee members of APTICON 2026, Raipur.",
};

export default function CommitteePage() {
  return <CommitteeClient />;
}
