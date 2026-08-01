import { Suspense } from "react";
import type { Metadata } from "next";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";

export const metadata: Metadata = { title: "Editorial Password Reset", robots: { index: false, follow: false } };

export default function EditorialResetPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm title="Reset Editorial Password" loginPath="/editorial/login" />
    </Suspense>
  );
}
