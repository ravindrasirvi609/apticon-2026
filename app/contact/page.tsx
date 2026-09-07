import type { Metadata } from "next";
import ContactClient from "./ContactClient";

export const metadata: Metadata = {
  title: "Contact | APTICON 2026",
  description:
    "Get in touch with the APTICON 2026 organizing team. Email: apticon2026@gmail.com",
};

export default function ContactPage() {
  return <ContactClient />;
}
