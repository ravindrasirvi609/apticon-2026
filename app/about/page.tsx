import type { Metadata } from "next";
import AboutClient from "./AboutClient";

export const metadata: Metadata = {
  title: "About APTICON 2026",
  description:
    "Learn about APTICON 2026, the 28th Annual National Convention of APTI, hosted by APTI Chhattisgarh in association with University Institute of Pharmacy, Pt. RSU Raipur.",
};

export default function AboutPage() {
  return <AboutClient />;
}
