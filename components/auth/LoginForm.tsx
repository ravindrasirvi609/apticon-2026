"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Loader2, LogIn } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/shadcn/button";
import { Input } from "@/components/ui/shadcn/input";
import { Label } from "@/components/ui/shadcn/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/shadcn/card";

interface LoginFormProps {
  role: "super_admin" | "reviewer" | "registration_approver";
  title: string;
  subtitle: string;
  successPath: string;
  forgotPath: string;
}

export default function LoginForm({ role, title, subtitle, successPath, forgotPath }: LoginFormProps) {
  const router = useRouter();
  const params = useSearchParams();
  const from = params.get("from");
  const rolePrefix =
    role === "super_admin" ? "/admin"
    : role === "registration_approver" ? "/approver"
    : "/reviewer";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Login failed");
        return;
      }
      if (data.user?.role !== role) {
        toast.error("This account is not authorised for this console.");
        await fetch("/api/auth/logout", { method: "POST" });
        return;
      }
      toast.success("Welcome back, " + data.user.name);
      router.push(from && from.startsWith(rolePrefix) ? from : successPath);
      router.refresh();
    } catch {
      toast.error("Network error. Please retry.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-dvh flex items-center justify-center bg-[var(--cream-50)] px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-14 h-14 rounded-full bg-gradient-to-br from-[var(--crimson-800)] to-[var(--crimson-900)] flex items-center justify-center mb-3">
            <LogIn className="w-6 h-6 text-[var(--gold-300)]" />
          </div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{subtitle}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href={forgotPath} className="text-xs text-[var(--crimson-800)] hover:underline">
                  Forgot?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>
            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign in"}
            </Button>
          </form>
          <p className="mt-6 text-center text-xs text-[var(--muted-text)]">
            APTICON 2026 · 28th Annual National Convention
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
