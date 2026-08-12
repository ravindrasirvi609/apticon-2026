"use client";
import { useState } from "react";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Label } from "@/components/ui/shadcn/label";

type RegisterLikeProps = {
  name: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  onBlur: React.FocusEventHandler<HTMLInputElement>;
  ref: React.Ref<HTMLInputElement>;
};

interface AptiMembershipIdFieldProps {
  registerProps: RegisterLikeProps;
  error?: string;
  helperText?: string;
}

/**
 * Shared "APTI Membership ID" input used on both the registration and abstract-submission
 * forms. Verification against /api/apti-members/verify is best-effort inline feedback only —
 * the real gate is the server-side check each form's own submit route performs.
 */
export default function AptiMembershipIdField({ registerProps, error, helperText }: AptiMembershipIdFieldProps) {
  const [status, setStatus] = useState<"idle" | "checking" | "valid" | "invalid">("idle");
  const [verifiedName, setVerifiedName] = useState<string | null>(null);

  async function checkMembership(memberId: string) {
    const trimmed = memberId.trim();
    if (trimmed.length < 3) {
      setStatus("idle");
      return;
    }
    setStatus("checking");
    try {
      const res = await fetch(`/api/apti-members/verify?memberId=${encodeURIComponent(trimmed)}`);
      const body = await res.json().catch(() => null);
      if (res.ok && body?.valid) {
        setStatus("valid");
        setVerifiedName(body.name ?? null);
      } else {
        setStatus("invalid");
        setVerifiedName(null);
      }
    } catch {
      setStatus("idle");
    }
  }

  return (
    <div>
      <Label htmlFor={registerProps.name}>APTI Membership ID *</Label>
      <div className="relative mt-2">
        <input
          id={registerProps.name}
          className="flex h-10 w-full rounded-lg border border-[var(--accent-500)]/30 bg-white px-3 py-2 pr-9 text-sm text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-400)]"
          placeholder="e.g. AP/LM-1358"
          autoComplete="off"
          {...registerProps}
          onBlur={(e) => {
            registerProps.onBlur(e);
            checkMembership(e.target.value);
          }}
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2">
          {status === "checking" && <Loader2 className="w-4 h-4 animate-spin text-[var(--muted-text)]" />}
          {status === "valid" && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
          {status === "invalid" && <XCircle className="w-4 h-4 text-red-600" />}
        </span>
      </div>
      {status === "valid" && verifiedName && (
        <p className="mt-1 text-xs text-emerald-700">Verified: {verifiedName}</p>
      )}
      {status === "invalid" && (
        <p className="mt-1 text-xs text-red-600">Membership ID not found in the APTI registry.</p>
      )}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      {!error && status === "idle" && helperText && (
        <p className="mt-1 text-xs text-[var(--muted-text)]">{helperText}</p>
      )}
    </div>
  );
}
