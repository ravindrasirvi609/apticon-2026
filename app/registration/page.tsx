import type { Metadata } from "next";
import RegistrationClient from "./RegistrationClient";

export const metadata: Metadata = {
  title: "Registration | APTICON 2026",
  description:
    "Register for APTICON 2026 — 28th Annual National Convention, 24–25 October 2026, Raipur. View fee categories and submit your registration.",
};

export default function RegistrationPage() {
  return <RegistrationClient />;
}
