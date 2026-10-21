import { NextResponse, type NextRequest } from "next/server";
import { requireRole } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { isEmailConfigured, sendMail } from "@/lib/email";
import { emailTestSchema } from "@/lib/validators/email-campaign";
import {
  campaignErrorResponse,
  normalizeAttachments,
  renderCampaignEmail,
  toMailAttachments,
} from "@/lib/email-campaign";
import { sampleVariables } from "@/lib/email-campaign-shared";

/** Send one email with sample data so the admin can check the real inbox rendering and attachments. */
export async function POST(request: NextRequest) {
  try {
    const admin = await requireRole("super_admin");
    const limit = rateLimit(`email-test:${admin.uid}`, 20, 10 * 60_000);
    if (!limit.ok)
      return NextResponse.json(
        { error: "Too many test emails. Try again in a few minutes." },
        { status: 429 },
      );
    if (!isEmailConfigured())
      return NextResponse.json(
        { error: "RESEND_API_KEY is not configured on the server" },
        { status: 503 },
      );

    const body = await request.json().catch(() => null);
    const parsed = emailTestSchema.safeParse(body);
    if (!parsed.success)
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 },
      );

    const { to, replyTo, attachments, ...content } = parsed.data;
    const rendered = renderCampaignEmail(content, sampleVariables());
    try {
      await sendMail({
        to,
        subject: `[TEST] ${rendered.subject}`,
        html: rendered.html,
        replyTo: replyTo || undefined,
        attachments: toMailAttachments(normalizeAttachments(attachments)),
      });
    } catch (err) {
      // Resend's own message (unverified domain, sandbox sender, …) is what the admin needs to see.
      if (err instanceof Error && err.message.startsWith("Resend rejected"))
        return NextResponse.json({ error: err.message }, { status: 502 });
      throw err;
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    return campaignErrorResponse(err);
  }
}
