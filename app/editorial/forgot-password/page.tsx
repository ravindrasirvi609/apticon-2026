import type { Metadata } from "next";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";

export const metadata: Metadata = { title: "Editorial Password Reset", robots: { index: false, follow: false } };

export default function EditorialForgotPage() {
  return <ForgotPasswordForm title="Reset Editorial Password" loginPath="/editorial/login" />;
}
