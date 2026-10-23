import { NextResponse, type NextRequest } from "next/server";
import mongoose from "mongoose";
import { requireRole } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { campaignActionSchema } from "@/lib/validators/email-campaign";
import {
  campaignErrorResponse,
  cancelCampaign,
  processCampaignBatch,
  resumeCampaign,
  retryFailedRecipients,
} from "@/lib/email-campaign";

// One slice of recipients is mailed per call; give it room for Resend rate-limit back-off.
export const maxDuration = 60;

/**
 * Drives a campaign forward.
 *   action "send" (default) — mail the next slice of queued recipients; the UI repeats this
 *                             until `pending` reaches 0. Safe to call from several tabs.
 *   action "retry_failed"   — requeue recipients whose send failed.
 *   action "cancel"         — stop a running campaign; sent mail is unaffected.
 */
export async function POST(
  request: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await requireRole("super_admin");
    const { id } = await ctx.params;
    if (!mongoose.isValidObjectId(id))
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });

    const parsed = campaignActionSchema.safeParse(
      await request.json().catch(() => ({})),
    );
    if (!parsed.success)
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    const { action, resume } = parsed.data;

    const audit = (name: string, details: unknown) =>
      logAudit({
        actor: admin.uid,
        actorRole: "super_admin",
        action: `admin.email.campaign.${name}`,
        resourceType: "email_campaign",
        resourceId: id,
        details,
        request,
      });

    if (action === "cancel") {
      const cancelled = await cancelCampaign(id);
      await audit("cancel", { cancelled });
    } else if (action === "retry_failed") {
      const requeued = await retryFailedRecipients(id);
      await audit("retry_failed", { requeued });
    } else if (resume) {
      await resumeCampaign(id);
    }

    return NextResponse.json(await processCampaignBatch(id));
  } catch (err) {
    return campaignErrorResponse(err);
  }
}
