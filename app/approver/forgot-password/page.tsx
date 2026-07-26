import type { Metadata } from "next";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";

export const metadata: Metadata = { title: "Approver Password Reset", robots: { index: false, follow: false } };

export default function ApproverForgotPage() {
  return <ForgotPasswordForm title="Reset Approver Password" loginPath="/approver/login" />;
}
