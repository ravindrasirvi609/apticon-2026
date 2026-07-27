import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getSessionFromCookies } from "@/lib/auth";
import ConsoleShell, { type NavItem } from "@/components/console/ConsoleShell";
import ConsoleBodyClass from "@/components/console/ConsoleBodyClass";

export const metadata: Metadata = {
  title: { default: "Approver Console", template: "%s | APTICON Approver" },
  robots: { index: false, follow: false },
};

const APPROVER_NAV: NavItem[] = [
  { href: "/approver",               label: "Dashboard",     icon: "dashboard" },
  { href: "/approver/registrations", label: "Registrations", icon: "registrations" },
  { href: "/approver/settings",      label: "Settings",      icon: "settings" },
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
