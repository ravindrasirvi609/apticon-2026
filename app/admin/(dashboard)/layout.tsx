import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getSessionFromCookies } from "@/lib/auth";
import ConsoleShell, { type NavItem } from "@/components/console/ConsoleShell";
import ConsoleBodyClass from "@/components/console/ConsoleBodyClass";

export const metadata: Metadata = {
  title: { default: "Admin Console", template: "%s | APTICON Admin" },
  robots: { index: false, follow: false },
};

const ADMIN_NAV: NavItem[] = [
  { href: "/admin",               label: "Dashboard",     icon: "dashboard" },
  { href: "/admin/delegates",     label: "Delegates",     icon: "delegates" },
  { href: "/admin/registrations", label: "Registrations", icon: "registrations" },
  { href: "/admin/abstracts",     label: "Abstracts",     icon: "abstracts" },
  { href: "/admin/users",         label: "Users",         icon: "users" },
  { href: "/admin/audit",         label: "Audit Log",     icon: "audit" },
  { href: "/admin/settings",      label: "Settings",      icon: "settings" },
];

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSessionFromCookies();
  if (!session || session.role !== "super_admin") {
    redirect("/admin/login");
  }

  return (
    <>
      <ConsoleBodyClass />
      <ConsoleShell
        role="super_admin"
        brand="APTICON 2026"
        brandSub="Super Admin"
        nav={ADMIN_NAV}
        user={{ name: session.name, email: session.email }}
      >
        {children}
      </ConsoleShell>
    </>
  );
}
