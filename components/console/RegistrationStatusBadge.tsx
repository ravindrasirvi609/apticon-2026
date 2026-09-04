import { Badge } from "@/components/ui/shadcn/badge";

type Variant = "info" | "warning" | "success" | "danger" | "secondary";

// Legacy manual-payment states. Nothing sets these any more — Razorpay drives approval — but
// older documents still carry them.
const LEGACY: Record<string, { label: string; variant: Variant }> = {
  payment_review: { label: "Payment Under Review", variant: "warning" },
  rejected: { label: "Payment Rejected", variant: "danger" },
  resubmitted: { label: "Resubmitted", variant: "info" },
};

/**
 * `status` alone is not enough for Razorpay registrations: an unpaid record and a record whose
 * card was declined are both "submitted". `paymentStatus` disambiguates them.
 */
export default function RegistrationStatusBadge({
  status,
  paymentStatus,
}: {
  status: string;
  paymentStatus?: string;
}) {
  const { label, variant } = resolve(status, paymentStatus);
  return <Badge variant={variant}>{label}</Badge>;
}

function resolve(
  status: string,
  paymentStatus?: string,
): { label: string; variant: Variant } {
  if (status === "approved")
    return { label: "Approved · Paid", variant: "success" };

  switch (paymentStatus) {
    case "failed":
      return { label: "Payment Failed", variant: "danger" };
    case "refunded":
      return { label: "Refunded", variant: "secondary" };
    case "authorized":
      return { label: "Awaiting Capture", variant: "warning" };
    // Captured but still not approved means a mismatch the sync refused to honour — it needs a look.
    case "captured":
      return { label: "Captured · Needs Review", variant: "warning" };
  }

  if (status === "submitted")
    return { label: "Awaiting Payment", variant: "info" };
  return LEGACY[status] ?? { label: status, variant: "secondary" };
}
