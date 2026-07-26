import { Suspense } from "react";
import type { Metadata } from "next";
import LoginForm from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Admin Login",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm
        role="super_admin"
        title="Super Admin Console"
        subtitle="Sign in with your administrator credentials"
        successPath="/admin"
        forgotPath="/admin/forgot-password"
      />
    </Suspense>
  );
}
