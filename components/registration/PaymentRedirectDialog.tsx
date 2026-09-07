"use client";

import { Loader2, ShieldCheck } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/shadcn/dialog";

export default function PaymentRedirectDialog({ open }: { open: boolean }) {
  return (
    <Dialog open={open}>
      <DialogContent
        className="max-w-md text-center [&>button]:hidden"
        onEscapeKeyDown={(event) => event.preventDefault()}
        onInteractOutside={(event) => event.preventDefault()}
      >
        <DialogHeader className="items-center space-y-3 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--accent-200)] text-[var(--primary-800)]">
            <ShieldCheck className="h-7 w-7" aria-hidden="true" />
          </div>
          <DialogTitle>Payment submitted</DialogTitle>
          <DialogDescription className="max-w-sm text-center leading-6">
            We’re securely confirming your payment and preparing your
            registration confirmation. Please wait — you’ll be redirected
            automatically in a few seconds.
          </DialogDescription>
        </DialogHeader>
        <div
          className="flex items-center justify-center gap-2 text-sm font-medium text-[var(--primary-800)]"
          role="status"
        >
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          Redirecting to your confirmation page…
        </div>
      </DialogContent>
    </Dialog>
  );
}
