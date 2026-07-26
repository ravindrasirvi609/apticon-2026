import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { LayoutDashboard, ClipboardCheck, Settings as SettingsIcon } from "lucide-react";
import { getSessionFromCookies } from "@/lib/auth";
import ConsoleShell from "@/components/console/ConsoleShell";
import ConsoleBodyClass from "@/components/console/ConsoleBodyClass";

export const metadata: Metadata = {
  title: { default: "Approver Console", template: "%s | APTICON Approver" },
  robots: { index: false, follow: false },
};

const APPROVER_NAV = [
  { href: "/approver",               label: "Dashboard",     icon: LayoutDashboard },
  { href: "/approver/registrations", label: "Registrations", icon: ClipboardCheck },
  { href: "/approver/settings",      label: "Settings",      icon: SettingsIcon },
];

export default async function ApproverDashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSessionFromCookies();
  if (!session || session.role !== "registration_approver") {
    redirect("/approver/login");
  }

  return (
    <>
      <ConsoleBodyClass />
      <ConsoleShell
        role="registration_approver"
        brand="APTICON 2026"
        brandSub="Approver"
        nav={APPROVER_NAV}
        user={{ name: session.name, email: session.email }}
      >
        {children}
      </ConsoleShell>
    </>
  );
}
