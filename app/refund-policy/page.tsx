import type { Metadata } from "next";
import RefundPolicyClient from "./RefundPolicyClient";

export const metadata: Metadata = {
  title: "Refund & Cancellation Policy | APTICON 2026",
  description:
    "Read the Refund and Cancellation Policy for APTICON 2026 registrations, the 28th Annual National Convention of APTI.",
};

export default function RefundPolicyPage() {
  return <RefundPolicyClient />;
}
