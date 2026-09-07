import type { Metadata } from "next";
import SpeakersClient from "./SpeakersClient";

export const metadata: Metadata = {
  title: "Speakers | APTICON 2026",
  description:
    "Distinguished keynote and invited speakers at APTICON 2026, the 28th Annual National Convention in Raipur.",
};

export default function SpeakersPage() {
  return <SpeakersClient />;
}
