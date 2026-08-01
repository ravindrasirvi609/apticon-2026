import { Suspense } from "react";
import type { Metadata } from "next";
import LoginForm from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Editorial Login",
  robots: { index: false, follow: false },
};

export default function EditorialLoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm
        role="editorial"
        title="Editorial"
        subtitle="Sign in to assign abstracts and record decisions"
        successPath="/editorial"
        forgotPath="/editorial/forgot-password"
      />
    </Suspense>
  );
}
