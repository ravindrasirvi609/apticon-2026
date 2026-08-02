import type { Metadata } from "next";
import TermsConditionsClient from "./TermsConditionsClient";

export const metadata: Metadata = {
  title: "Terms & Conditions | APTICON 2026",
  description:
    "Read the Terms and Conditions governing your use of the APTICON 2026 website, the 28th Annual National Convention of APTI.",
};

export default function TermsConditionsPage() {
  return <TermsConditionsClient />;
}
