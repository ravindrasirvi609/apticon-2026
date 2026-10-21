import { NextResponse, type NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { isEmailConfigured } from "@/lib/email";
import EmailCampaign from "@/models/EmailCampaign";
import { emailCampaignSchema } from "@/lib/validators/email-campaign";
import {
  campaignErrorResponse,
  createCampaign,
  normalizeAttachments,
  recipientCounts,
} from "@/lib/email-campaign";

/** Campaign history, newest first, with live delivery counts. */
export async function GET() {
  try {
    await requireRole("super_admin");
    await connectDB();
    const campaigns = await EmailCampaign.find({})
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();
    const counts = await recipientCounts(campaigns.map((c) => c._id));
    return NextResponse.json({
      campaigns: campaigns.map((c) => ({
        id: c._id.toString(),
        subject: c.subject,
        status: c.status,
        haltReason: c.haltReason,
        attachments: c.attachments.map((a) => ({
          filename: a.filename,
          size: a.size,
        })),
        createdByName: c.createdByName,
        createdAt: c.createdAt.toISOString(),
        completedAt: c.completedAt?.toISOString() ?? null,
        counts: counts.get(c._id.toString()),
      })),
    });
  } catch (err) {
    return campaignErrorResponse(err);
  }
}

/**
 * Freeze a campaign (content + recipient list). Nothing is mailed yet — the UI then drives
 * POST /campaigns/:id/send until the queue is empty.
 */
export async function POST(request: NextRequest) {
  try {
    const admin = await requireRole("super_admin");
    if (!isEmailConfigured())
      return NextResponse.json(
        { error: "RESEND_API_KEY is not configured on the server" },
        { status: 503 },
      );

    const body = await request.json().catch(() => null);
    const parsed = emailCampaignSchema.safeParse(body);
    if (!parsed.success)
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 },
      );

    const { emails, attachments, ...content } = parsed.data;
    const created = await createCampaign(
      { ...content, emails, attachments: normalizeAttachments(attachments) },
      { uid: admin.uid, name: admin.name },
    );

    await logAudit({
      actor: admin.uid,
      actorRole: "super_admin",
      action: "admin.email.campaign.create",
      resourceType: "email_campaign",
      resourceId: created.id,
      details: {
        subject: content.subject,
        recipients: created.total,
        attachments: attachments.length,
      },
      request,
    });

    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    return campaignErrorResponse(err);
  }
}
