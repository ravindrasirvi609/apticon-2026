import type { Metadata } from "next";
import GuidelinesClient from "./GuidelinesClient";

export const metadata: Metadata = {
  title: "Presentation Guidelines | APTICON 2026",
  description:
    "Oral and poster presentation guidelines for APTICON 2026, the 28th Annual National Convention of APTI — slide limits, poster size, structure, design and time management.",
};

export default function GuidelinesPage() {
  return <GuidelinesClient />;
}
