import { Suspense } from "react";
import type { Metadata } from "next";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";

export const metadata: Metadata = { title: "Admin Password Reset", robots: { index: false, follow: false } };

export default function AdminResetPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm title="Reset Admin Password" loginPath="/admin/login" />
    </Suspense>
  );
}
