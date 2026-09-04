import type { Metadata } from "next";
import AbstractsClient from "./AbstractsClient";

export const metadata: Metadata = {
  title: "Abstract Submission | APTICON 2026",
  description:
    "Call for abstracts — submit your review or research article for APTICON 2026, Raipur.",
};

export default function AbstractsPage() {
  return <AbstractsClient />;
}
