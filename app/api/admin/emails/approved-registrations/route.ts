import { NextResponse, type NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { isEmailConfigured, registrationApprovedEmail, sendMail } from "@/lib/email";
import Registration from "@/models/Registration";

/** Send the standard confirmation email, including that delegate's QR code, to every
 * approved registration whose confirmation has not already been sent. */
export async function POST(request: NextRequest) {
  try {
    const admin = await requireRole("super_admin");
    if (!isEmailConfigured()) {
      return NextResponse.json(
        { error: "RESEND_API_KEY is not configured on the server" },
        { status: 503 },
      );
    }

    await connectDB();
    const registrations = await Registration.find({
      status: "approved",
      registrationCode: { $exists: true, $ne: "" },
      email: { $exists: true, $ne: "" },
      confirmationEmailSentAt: { $exists: false },
    })
      .select("fullName email registrationCode feeAmount linkedAbstract")
      .lean();

    let sent = 0;
    const failures: { email: string; error: string }[] = [];
    // Keep concurrency modest so a large approved list does not overwhelm the mail provider.
    for (let i = 0; i < registrations.length; i += 5) {
      const batch = registrations.slice(i, i + 5);
      const results = await Promise.all(
        batch.map(async (registration) => {
          try {
            const email = await registrationApprovedEmail(
              registration.fullName,
              registration.registrationCode,
              registration.feeAmount,
            );
            await sendMail({
              to: registration.email,
              subject: email.subject,
              html: email.html,
              attachments: email.attachments,
            });
            await Registration.updateOne(
              { _id: registration._id, confirmationEmailSentAt: { $exists: false } },
              { $set: { confirmationEmailSentAt: new Date() } },
            );
            return { ok: true as const };
          } catch (error) {
            return {
              ok: false as const,
              email: registration.email,
              error: error instanceof Error ? error.message : "Unknown error",
            };
          }
        }),
      );
      for (const result of results) {
        if (result.ok) sent += 1;
        else failures.push({ email: result.email, error: result.error });
      }
    }

    await logAudit({
      actor: admin.uid,
      actorRole: admin.role,
      action: "admin.email.approved_registrations.send",
      resourceType: "email_campaign",
      details: { matched: registrations.length, sent, failed: failures.length },
      request,
    });

    return NextResponse.json({ ok: true, matched: registrations.length, sent, failed: failures.length, failures });
  } catch (error) {
    console.error("[admin approved registration emails]", error);
    return NextResponse.json({ error: "Could not send approved registration emails" }, { status: 500 });
  }
}
