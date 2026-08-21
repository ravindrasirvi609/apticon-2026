import { NextResponse, type NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import Registration from "@/models/Registration";
import Abstract from "@/models/Abstract";
import { nudgeRequestSchema } from "@/lib/validators/registration";
import { requireRole, authErrorResponse } from "@/lib/auth";
import { sendMail, nudgeAbstractEmail, nudgeRegisterEmail } from "@/lib/email";
import { logAudit } from "@/lib/audit";
import { sendWhatsAppNotification } from "@/lib/whatsapp";

export async function POST(request: NextRequest) {
  try {
    const admin = await requireRole("super_admin");
    const body = await request.json().catch(() => null);
    const parsed = nudgeRequestSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });

    await connectDB();
    const emails = parsed.data.emails.map((e) => e.toLowerCase());

    let sent = 0;
    let skipped = 0;
    const skipReasons: Record<string, string> = {};

    for (const email of emails) {
      if (parsed.data.kind === "abstract") {
        // Nudge someone who registered but hasn't submitted an abstract
        const reg = await Registration.findOne({ email }).sort({ createdAt: -1 }).lean();
        if (!reg) { skipped++; skipReasons[email] = "no_registration"; continue; }
        const hasAbstract = await Abstract.exists({ email });
        if (hasAbstract) { skipped++; skipReasons[email] = "already_has_abstract"; continue; }
        const { subject, html } = nudgeAbstractEmail(reg.fullName, reg.registrationCode);
        await sendMail({ to: email, subject, html });
        // await sendWhatsAppNotification(reg.phone, "nudge_abstract", [reg.fullName, reg.registrationCode], reg._id.toString());
        sent++;
      } else {
        // Nudge someone who submitted an abstract but hasn't registered
        const abs = await Abstract.findOne({ email }).sort({ createdAt: -1 }).lean();
        if (!abs) { skipped++; skipReasons[email] = "no_abstract"; continue; }
        const hasReg = await Registration.exists({ email });
        if (hasReg) { skipped++; skipReasons[email] = "already_registered"; continue; }
        const { subject, html } = nudgeRegisterEmail(abs.presentingAuthor, abs.submissionCode);
        await sendMail({ to: email, subject, html });
        // await sendWhatsAppNotification(abs.phone, "nudge_register", [abs.presentingAuthor, abs.submissionCode], abs._id.toString());
        sent++;
      }
    }

    await logAudit({
      actor: admin.uid,
      actorRole: "super_admin",
      action: `admin.nudge.${parsed.data.kind}`,
      resourceType: "registration",
      details: { requestedCount: emails.length, sent, skipped, skipReasons },
      request,
    });

    return NextResponse.json({ ok: true, sent, skipped, skipReasons });
  } catch (err) {
    return authErrorResponse(err);
  }
}
