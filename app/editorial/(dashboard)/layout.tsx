import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getSessionFromCookies } from "@/lib/auth";
import ConsoleShell, { type NavItem } from "@/components/console/ConsoleShell";
import ConsoleBodyClass from "@/components/console/ConsoleBodyClass";

export const metadata: Metadata = {
  title: { default: "Editorial Console", template: "%s | APTICON Editorial" },
  robots: { index: false, follow: false },
};

const EDITORIAL_NAV: NavItem[] = [
  { href: "/editorial", label: "Dashboard", icon: "dashboard" },
  { href: "/editorial/abstracts", label: "Abstracts", icon: "abstracts" },
  {
    href: "/editorial/registrations",
    label: "Registrations",
    icon: "registrations",
  },
  {
    href: "/editorial/group-registrations",
    label: "Group Registrations",
    icon: "groups",
  },
  { href: "/editorial/settings", label: "Settings", icon: "settings" },
];

export default async function EditorialDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSessionFromCookies();
  if (!session || session.role !== "editorial") {
    redirect("/editorial/login");
  }

  return (
    <>
      <ConsoleBodyClass />
      <ConsoleShell
        role="editorial"
        brand="APTICON 2026"
        brandSub="Editorial"
        nav={EDITORIAL_NAV}
        user={{ name: session.name, email: session.email }}
      >
        {children}
      </ConsoleShell>
    </>
  );
}
