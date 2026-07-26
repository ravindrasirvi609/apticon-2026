import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { LayoutDashboard, FileText, Settings as SettingsIcon } from "lucide-react";
import { getSessionFromCookies } from "@/lib/auth";
import ConsoleShell from "@/components/console/ConsoleShell";
import ConsoleBodyClass from "@/components/console/ConsoleBodyClass";

export const metadata: Metadata = {
  title: { default: "Reviewer Console", template: "%s | APTICON Reviewer" },
  robots: { index: false, follow: false },
};

const REVIEWER_NAV = [
  { href: "/reviewer",           label: "Dashboard",          icon: LayoutDashboard },
  { href: "/reviewer/abstracts", label: "Assigned Abstracts", icon: FileText },
  { href: "/reviewer/settings",  label: "Settings",           icon: SettingsIcon },
];

export default async function ReviewerDashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSessionFromCookies();
  if (!session || session.role !== "reviewer") {
    redirect("/reviewer/login");
  }

  return (
    <>
      <ConsoleBodyClass />
      <ConsoleShell
        role="reviewer"
        brand="APTICON 2026"
        brandSub="Reviewer"
        nav={REVIEWER_NAV}
        user={{ name: session.name, email: session.email }}
      >
        {children}
      </ConsoleShell>
    </>
  );
}
