import type {
  CampaignAttachment,
  EmailBodyFormat,
} from "@/lib/email-campaign-shared";

export type { CampaignAttachment, EmailBodyFormat };

export interface CampaignCounts {
  total: number;
  sent: number;
  failed: number;
  /** Queued, or claimed by an in-flight request. */
  pending: number;
  cancelled: number;
}

export type CampaignStatus = "sending" | "completed" | "cancelled";

export interface CampaignProgress extends CampaignCounts {
  status: CampaignStatus;
  haltReason: string;
}

export interface CampaignRow {
  id: string;
  subject: string;
  status: CampaignStatus;
  haltReason: string;
  attachments: { filename: string; size: number }[];
  createdByName: string;
  createdAt: string;
  completedAt: string | null;
  counts: CampaignCounts;
}

export interface DelegateRow {
  email: string;
  name: string;
  institution?: string;
  registration: { code: string; status: string } | null;
  abstracts: { submissionCode: string }[];
}

export type FocusField = "subject" | "headline" | "body";

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
