import type { Metadata } from "next";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";

export const metadata: Metadata = { title: "Reviewer Password Reset", robots: { index: false, follow: false } };

export default function ReviewerForgotPage() {
  return <ForgotPasswordForm title="Reset Reviewer Password" loginPath="/reviewer/login" />;
}
