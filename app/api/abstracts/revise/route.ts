import { NextResponse, type NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import Abstract from "@/models/Abstract";
import User from "@/models/User";
import { abstractResubmitSchema } from "@/lib/validators/abstract";
import { publicUrl } from "@/lib/r2";
import { sendMail, abstractResubmittedEmail, abstractResubmissionNoticeEmail } from "@/lib/email";
import { logAudit } from "@/lib/audit";
import { rateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/auth";
import { sendWhatsAppNotification } from "@/lib/whatsapp";

// POST /api/abstracts/revise — public resubmission of a revision-requested abstract
export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const limit = rateLimit(`revise:${ip}`, 5, 60 * 60_000);
  if (!limit.ok) {
    return NextResponse.json({ error: "Too many attempts. Please retry in an hour." }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const parsed = abstractResubmitSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;
  await connectDB();

  const abs = await Abstract.findOne({ submissionCode: data.code.toUpperCase(), email: data.email });
  if (!abs) {
    return NextResponse.json({ error: "No submission found with that code and email." }, { status: 404 });
  }

  if (abs.status !== "revision_requested") {
    return NextResponse.json({ error: "This abstract is not open for revision." }, { status: 409 });
  }

  if (!abs.graphicalAbstractKey && !data.graphicalAbstractKey) {
    return NextResponse.json({ error: "A graphical abstract is required for resubmission." }, { status: 400 });
  }

  const before = { status: abs.status };

  abs.abstract = data.abstract;
  if (data.fileKey) {
    abs.fileKey = data.fileKey;
    abs.fileName = data.fileName;
    abs.fileUrl = publicUrl(data.fileKey);
  }
  if (data.graphicalAbstractKey) {
    abs.graphicalAbstractKey = data.graphicalAbstractKey;
    abs.graphicalAbstractName = data.graphicalAbstractName;
    abs.graphicalAbstractUrl = publicUrl(data.graphicalAbstractKey);
  }
  abs.status = "resubmitted";
  await abs.save();

  await logAudit({
    actorRole: "public",
    action: "abstract.resubmit",
    resourceType: "abstract",
    resourceId: abs._id.toString(),
    details: { before, after: { status: abs.status }, submissionCode: abs.submissionCode, email: abs.email },
    request,
  });

  const authorEmail = abstractResubmittedEmail(abs.presentingAuthor, abs.submissionCode, abs.title);
  await sendMail({ to: abs.email, subject: authorEmail.subject, html: authorEmail.html });
  await sendWhatsAppNotification(abs.phone, "abstract_resubmitted", [abs.presentingAuthor, abs.submissionCode], abs._id.toString());

  const recipients = await User.find(
    { role: { $in: ["super_admin", "editorial"] }, isActive: true },
    "email"
  ).lean();
  const noticeEmail = abstractResubmissionNoticeEmail(abs.submissionCode, abs.title, abs.presentingAuthor);
  await Promise.all(recipients.map((u) => sendMail({ to: u.email, subject: noticeEmail.subject, html: noticeEmail.html })));

  return NextResponse.json({ ok: true });
}
