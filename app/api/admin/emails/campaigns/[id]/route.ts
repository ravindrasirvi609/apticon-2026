import { NextResponse, type NextRequest } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import EmailCampaign from "@/models/EmailCampaign";
import EmailRecipient from "@/models/EmailRecipient";
import { campaignErrorResponse, recipientCounts } from "@/lib/email-campaign";

const FAILURE_LIMIT = 200;

/** One campaign with its content, delivery counts and (capped) list of failed recipients. */
export async function GET(
  _request: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    await requireRole("super_admin");
    const { id } = await ctx.params;
    if (!mongoose.isValidObjectId(id))
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });

    await connectDB();
    const campaign = await EmailCampaign.findById(id).lean();
    if (!campaign)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    const [counts, failures] = await Promise.all([
      recipientCounts([campaign._id]),
      EmailRecipient.find({ campaign: campaign._id, status: "failed" })
        .select("email name error attempts")
        .sort({ email: 1 })
        .limit(FAILURE_LIMIT)
        .lean(),
    ]);
    const campaignCounts = counts.get(campaign._id.toString());

    return NextResponse.json({
      id: campaign._id.toString(),
      subject: campaign.subject,
      headline: campaign.headline,
      body: campaign.body,
      bodyFormat: campaign.bodyFormat,
      replyTo: campaign.replyTo,
      status: campaign.status,
      haltReason: campaign.haltReason,
      attachments: campaign.attachments.map((a) => ({
        filename: a.filename,
        size: a.size,
        url: a.url,
      })),
      createdByName: campaign.createdByName,
      createdAt: campaign.createdAt.toISOString(),
      completedAt: campaign.completedAt?.toISOString() ?? null,
      counts: campaignCounts,
      failures: failures.map((f) => ({
        email: f.email,
        name: f.name,
        error: f.error,
        attempts: f.attempts,
      })),
      failuresTruncated: (campaignCounts?.failed ?? 0) > FAILURE_LIMIT,
    });
  } catch (err) {
    return campaignErrorResponse(err);
  }
}
