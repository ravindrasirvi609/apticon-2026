import { Suspense } from "react";
import type { Metadata } from "next";
import LoginForm from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Approver Login",
  robots: { index: false, follow: false },
};

export default function ApproverLoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm
        role="registration_approver"
        title="Registration Approver"
        subtitle="Sign in to verify payments and approve registrations"
        successPath="/approver"
        forgotPath="/approver/forgot-password"
      />
    </Suspense>
  );
}
