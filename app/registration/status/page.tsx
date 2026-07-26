import type { Metadata } from "next";
import RegistrationStatusClient from "./RegistrationStatusClient";

export const metadata: Metadata = {
  title: "Registration Status | APTICON 2026",
  description: "Check the payment verification status of your APTICON 2026 registration.",
};

export default function RegistrationStatusPage() {
  return <RegistrationStatusClient />;
}
