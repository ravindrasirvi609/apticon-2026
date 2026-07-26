import { Suspense } from "react";
import type { Metadata } from "next";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";

export const metadata: Metadata = { title: "Approver Password Reset", robots: { index: false, follow: false } };

export default function ApproverResetPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm title="Reset Approver Password" loginPath="/approver/login" />
    </Suspense>
  );
}
