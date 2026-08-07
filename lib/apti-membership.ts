import { connectDB } from "@/lib/db";
import AptiMember from "@/models/AptiMember";

export interface AptiMembershipCheck {
  valid: boolean;
  member?: { name: string; email?: string };
  /** false only when both sides have an email and they disagree — informational, never blocks. */
  emailMatches?: boolean;
}

/**
 * Looks up a Member ID against the imported APTI registry. Member ID is the authoritative
 * match — the registry's email column is stale for many rows, so an email mismatch doesn't
 * invalidate an otherwise-real Member ID; it's only surfaced for callers that want to flag it.
 */
export async function verifyAptiMember(memberId: string, email?: string): Promise<AptiMembershipCheck> {
  const normalized = memberId.trim().toUpperCase();
  if (!normalized) return { valid: false };

  await connectDB();
  const record = await AptiMember.findOne({ memberId: normalized }).lean();
  if (!record) return { valid: false };

  const emailMatches = record.email && email ? record.email.toLowerCase() === email.toLowerCase() : undefined;

  return {
    valid: true,
    member: { name: record.name, email: record.email },
    emailMatches,
  };
}
