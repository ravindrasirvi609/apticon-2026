"use client";
import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ClipboardCheck,
  ClipboardList,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Users,
  UsersRound,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/shadcn/button";

export interface NavItem {
  href: string;
  label: string;
  icon: "dashboard" | "delegates" | "registrations" | "abstracts" | "users" | "audit" | "settings";
}

interface Props {
  role: "super_admin" | "reviewer" | "registration_approver";
  brand: string;
  brandSub: string;
  nav: NavItem[];
  user: { name: string; email: string };
  children: ReactNode;
}

const LOGIN_PATH_BY_ROLE: Record<Props["role"], string> = {
  super_admin: "/admin/login",
  reviewer: "/reviewer/login",
  registration_approver: "/approver/login",
};

const NAV_ICONS = {
  dashboard: LayoutDashboard,
  delegates: UsersRound,
  registrations: ClipboardCheck,
  abstracts: FileText,
  users: Users,
  audit: ClipboardList,
  settings: Settings,
};

export default function ConsoleShell({ role, brand, brandSub, nav, user, children }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    toast.success("Signed out");
    router.push(LOGIN_PATH_BY_ROLE[role]);
    router.refresh();
  }

  const initial = user.name.charAt(0).toUpperCase();

  return (
    <div className="min-h-dvh bg-[var(--cream-50)]">
      {/* ─── Sidebar (desktop) ─── */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 flex-col bg-white border-r border-[var(--gold-500)]/20 z-40">
        <div className="p-6 border-b border-[var(--gold-500)]/20">
          <div className="font-display text-xl font-black text-[var(--crimson-800)]">{brand}</div>
          <div className="text-[10px] font-semibold uppercase tracking-widest text-[var(--muted-text)] mt-1">{brandSub}</div>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {nav.map((item) => {
            const active = pathname === item.href || (item.href !== "/admin" && item.href !== "/reviewer" && pathname.startsWith(item.href));
            const Icon = NAV_ICONS[item.icon];
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  active
                    ? "bg-[var(--crimson-800)] text-white"
                    : "text-[var(--dark-text)] hover:bg-[var(--cream-100)] hover:text-[var(--crimson-800)]"
                )}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-[var(--gold-500)]/20">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--crimson-800)] to-[var(--crimson-900)] text-white flex items-center justify-center font-bold text-sm">
              {initial}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold truncate">{user.name}</div>
              <div className="text-xs text-[var(--muted-text)] truncate">{user.email}</div>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="w-full justify-start mt-1" onClick={logout}>
            <LogOut className="w-4 h-4" />
            Sign out
          </Button>
        </div>
      </aside>

      {/* ─── Mobile top bar ─── */}
      <div className="lg:hidden sticky top-0 z-40 bg-white border-b border-[var(--gold-500)]/20 px-4 h-14 flex items-center justify-between">
        <div>
          <div className="font-display text-lg font-black text-[var(--crimson-800)] leading-none">{brand}</div>
          <div className="text-[9px] font-semibold uppercase tracking-widest text-[var(--muted-text)]">{brandSub}</div>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setOpen(true)} aria-label="Open menu">
          <Menu className="w-5 h-5" />
        </Button>
      </div>

      {/* Mobile sheet */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setOpen(false)}>
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-white flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b border-[var(--gold-500)]/20 flex items-center justify-between">
              <div>
                <div className="font-display text-lg font-black text-[var(--crimson-800)]">{brand}</div>
                <div className="text-[10px] font-semibold uppercase tracking-widest text-[var(--muted-text)]">{brandSub}</div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setOpen(false)} aria-label="Close">
                <X className="w-5 h-5" />
              </Button>
            </div>
            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
              {nav.map((item) => {
                const active = pathname === item.href;
                const Icon = NAV_ICONS[item.icon];
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium",
                      active
                        ? "bg-[var(--crimson-800)] text-white"
                        : "text-[var(--dark-text)] hover:bg-[var(--cream-100)]"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <div className="p-3 border-t border-[var(--gold-500)]/20">
              <div className="flex items-center gap-3 px-3 py-2">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--crimson-800)] to-[var(--crimson-900)] text-white flex items-center justify-center font-bold text-sm">
                  {initial}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold truncate">{user.name}</div>
                  <div className="text-xs text-[var(--muted-text)] truncate">{user.email}</div>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="w-full justify-start mt-1" onClick={logout}>
                <LogOut className="w-4 h-4" />
                Sign out
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Main ─── */}
      <main className="lg:pl-64">{children}</main>
    </div>
  );
}
