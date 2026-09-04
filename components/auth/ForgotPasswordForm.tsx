"use client";
import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/shadcn/button";
import { Input } from "@/components/ui/shadcn/input";
import { Label } from "@/components/ui/shadcn/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/shadcn/card";

interface ForgotFormProps {
  loginPath: string;
  title: string;
}

export default function ForgotPasswordForm({
  loginPath,
  title,
}: ForgotFormProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setDone(true);
      toast.success("If that email is registered, a reset link has been sent.");
    } catch {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-dvh flex items-center justify-center bg-[var(--surface-50)] px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-14 h-14 rounded-full bg-gradient-to-br from-[var(--primary-800)] to-[var(--primary-900)] flex items-center justify-center mb-3">
            <Mail className="w-6 h-6 text-[var(--accent-300)]" />
          </div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>
            Enter your email and we'll send you a reset link.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {done ? (
            <div className="text-center py-4 space-y-3">
              <p className="text-sm text-[var(--dark-text)]">
                Check your inbox for a reset link.
              </p>
              <Link
                href={loginPath}
                className="text-sm text-[var(--primary-800)] hover:underline"
              >
                Return to sign in
              </Link>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Send reset link"
                )}
              </Button>
              <div className="text-center">
                <Link
                  href={loginPath}
                  className="text-xs text-[var(--muted-text)] hover:text-[var(--primary-800)]"
                >
                  Back to sign in
                </Link>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
