import { NextResponse, type NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { isEmailConfigured, registrationApprovedEmail, sendMail } from "@/lib/email";
import Registration from "@/models/Registration";

const BATCH_SIZE = 25;
const SEND_DELAY_MS = 650;

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Send one idempotent batch of standard confirmation emails, including each delegate's QR code. */
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
      .limit(BATCH_SIZE)
      .select("fullName email registrationCode feeAmount linkedAbstract")
      .lean();

    let sent = 0;
    const failures: { email: string; error: string }[] = [];
    // Resend can rate-limit concurrent requests. Serialize sends and pause between them.
    for (const registration of registrations) {
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
        sent += 1;
      } catch (error) {
        failures.push({
          email: registration.email,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
      if (registration !== registrations[registrations.length - 1]) await wait(SEND_DELAY_MS);
    }

    await logAudit({
      actor: admin.uid,
      actorRole: admin.role,
      action: "admin.email.approved_registrations.send",
      resourceType: "email_campaign",
      details: { matched: registrations.length, sent, failed: failures.length },
      request,
    });

    const remaining = await Registration.countDocuments({
      status: "approved",
      registrationCode: { $exists: true, $ne: "" },
      email: { $exists: true, $ne: "" },
      confirmationEmailSentAt: { $exists: false },
    });
    return NextResponse.json({ ok: true, matched: registrations.length, sent, failed: failures.length, remaining, failures });
  } catch (error) {
    console.error("[admin approved registration emails]", error);
    return NextResponse.json({ error: "Could not send approved registration emails" }, { status: 500 });
  }
}
