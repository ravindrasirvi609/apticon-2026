import { Suspense } from "react";
import AdminDashboard from "./AdminDashboard";

export default function AdminHomePage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-[var(--muted-text)]">Loading…</div>}>
      <AdminDashboard />
    </Suspense>
  );
}
