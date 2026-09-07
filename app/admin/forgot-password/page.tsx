import type { Metadata } from "next";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Admin Password Reset",
  robots: { index: false, follow: false },
};

export default function AdminForgotPage() {
  return (
    <ForgotPasswordForm title="Reset Admin Password" loginPath="/admin/login" />
  );
}
