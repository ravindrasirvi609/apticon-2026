import { NextResponse, type NextRequest } from "next/server";
import { requireRole, authErrorResponse } from "@/lib/auth";
import { emailPreviewSchema } from "@/lib/validators/email-campaign";
import { renderCampaignEmail, resolveRecipients } from "@/lib/email-campaign";
import { sampleVariables } from "@/lib/email-campaign-shared";

/** Render exactly what a recipient would receive, using sample data or a real delegate's. */
export async function POST(request: NextRequest) {
  try {
    await requireRole("super_admin");
    const body = await request.json().catch(() => null);
    const parsed = emailPreviewSchema.safeParse(body);
    if (!parsed.success)
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 },
      );

    const { recipientEmail, ...content } = parsed.data;
    let vars = sampleVariables();
    if (recipientEmail) {
      const [recipient] = await resolveRecipients([recipientEmail]);
      vars = { ...vars, ...recipient.vars };
    }
    return NextResponse.json(renderCampaignEmail(content, vars));
  } catch (err) {
    return authErrorResponse(err);
  }
}
