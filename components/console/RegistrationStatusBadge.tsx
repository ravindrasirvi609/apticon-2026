import { Badge } from "@/components/ui/shadcn/badge";

const MAP: Record<string, { label: string; variant: "info" | "warning" | "success" | "danger" | "secondary" }> = {
  submitted:       { label: "Submitted",             variant: "info" },
  payment_review:  { label: "Payment Under Review",  variant: "warning" },
  approved:        { label: "Approved",              variant: "success" },
  rejected:        { label: "Payment Rejected",      variant: "danger" },
  resubmitted:     { label: "Resubmitted",           variant: "info" },
};

export default function RegistrationStatusBadge({ status }: { status: string }) {
  const entry = MAP[status] ?? { label: status, variant: "secondary" as const };
  return <Badge variant={entry.variant}>{entry.label}</Badge>;
}
