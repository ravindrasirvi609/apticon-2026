import { Suspense } from "react";
import type { Metadata } from "next";
import LoginForm from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Reviewer Login",
  robots: { index: false, follow: false },
};

export default function ReviewerLoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm
        role="reviewer"
        title="Reviewer Console"
        subtitle="Sign in to review your assigned abstracts"
        successPath="/reviewer"
        forgotPath="/reviewer/forgot-password"
      />
    </Suspense>
  );
}
