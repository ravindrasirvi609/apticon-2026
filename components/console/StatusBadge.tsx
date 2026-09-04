import { Badge } from "@/components/ui/shadcn/badge";

const MAP: Record<
  string,
  {
    label: string;
    variant: "info" | "warning" | "success" | "danger" | "secondary";
  }
> = {
  submitted: { label: "Submitted", variant: "info" },
  under_review: { label: "Under Review", variant: "warning" },
  accepted: { label: "Accepted", variant: "success" },
  rejected: { label: "Not Accepted", variant: "danger" },
  revision_requested: { label: "Revision Requested", variant: "warning" },
  resubmitted: { label: "Resubmitted", variant: "info" },
};

export default function StatusBadge({ status }: { status: string }) {
  const entry = MAP[status] ?? { label: status, variant: "secondary" as const };
  return <Badge variant={entry.variant}>{entry.label}</Badge>;
}
