import { redirect } from "next/navigation";
import type { Metadata } from "next";
import {
  LayoutDashboard,
  FileText,
  Users,
  ClipboardList,
  Settings as SettingsIcon,
  ClipboardCheck,
  UsersRound,
} from "lucide-react";
import { getSessionFromCookies } from "@/lib/auth";
import ConsoleShell from "@/components/console/ConsoleShell";
import ConsoleBodyClass from "@/components/console/ConsoleBodyClass";

export const metadata: Metadata = {
  title: { default: "Admin Console", template: "%s | APTICON Admin" },
  robots: { index: false, follow: false },
};

const ADMIN_NAV = [
  { href: "/admin",              label: "Dashboard",     icon: LayoutDashboard },
  { href: "/admin/delegates",    label: "Delegates",     icon: UsersRound },
  { href: "/admin/registrations",label: "Registrations", icon: ClipboardCheck },
  { href: "/admin/abstracts",    label: "Abstracts",     icon: FileText },
  { href: "/admin/users",        label: "Users",         icon: Users },
  { href: "/admin/audit",        label: "Audit Log",     icon: ClipboardList },
  { href: "/admin/settings",     label: "Settings",      icon: SettingsIcon },
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
