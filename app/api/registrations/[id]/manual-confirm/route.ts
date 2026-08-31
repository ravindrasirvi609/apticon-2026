import { NextResponse, type NextRequest } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Registration from "@/models/Registration";
import { requireRole, authErrorResponse } from "@/lib/auth";
import { generateRegistrationCode } from "@/lib/registration-code";
import { registrationApprovedEmail, sendMail } from "@/lib/email";
import { sendWhatsAppNotification } from "@/lib/whatsapp";
import { logAudit } from "@/lib/audit";

export async function POST(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireRole("super_admin"); const { id } = await ctx.params;
    if (!mongoose.isValidObjectId(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    await connectDB();
<<<<<<< HEAD
    const source = await Registration.findById(id).select("status category groupRegistration registrationCode paymentError razorpayPaymentId feeAmount").lean();
    if (!source) return NextResponse.json({ error: "Registration not found" }, { status: 404 });
    if (source.groupRegistration) return NextResponse.json({ error: "Confirm group delegates from the group registration." }, { status: 400 });

    // Approval + code assignment happens once; if a PRIOR call approved this registration but
    // its email failed to send, this call skips straight past approval and only retries the email.
    let justApproved = null;
    if (source.status !== "approved") {
      const registrationCode = await generateRegistrationCode(source.category);
      justApproved = await Registration.findOneAndUpdate(
        { _id: id, status: { $ne: "approved" }, registrationCode: { $exists: false } },
        { $set: { status: "approved", paymentStatus: "captured", approvedBy: admin.uid, approvedAt: new Date(), paidAt: new Date(), registrationCode }, $unset: { rejectedBy: 1, rejectedAt: 1, reviewNote: 1, paymentError: 1 } },
        { new: true }
      );
      if (justApproved) {
        await logAudit({
          actor: admin.uid,
          actorRole: admin.role,
          action: "registration.manual.confirmed",
          resourceType: "registration",
          resourceId: id,
          details: { registrationCode, feeAmount: source.feeAmount, razorpayPaymentId: source.razorpayPaymentId ?? null, priorPaymentError: source.paymentError ?? null },
          request,
        });
      }
    }

    const reg = justApproved ?? (await Registration.findById(id));
    if (!reg || reg.status !== "approved") return NextResponse.json({ error: "Could not confirm this registration." }, { status: 409 });

    let emailSent = false;
    if (!reg.confirmationEmailSentAt) {
      const email = await registrationApprovedEmail(reg.fullName, reg.registrationCode, reg.feeAmount, !!reg.linkedAbstract);
      await sendMail({ to: reg.email, subject: email.subject, html: email.html, attachments: email.attachments });
      await Registration.updateOne({ _id: reg._id }, { $set: { confirmationEmailSentAt: new Date() } });
      await sendWhatsAppNotification(reg.phone, "registration_approved", [reg.fullName], `registration-approved-${reg._id.toString()}`);
      emailSent = true;
    }

    return NextResponse.json({ ok: true, registrationCode: reg.registrationCode, emailSent, alreadyConfirmed: !justApproved });
=======
    const source = await Registration.findById(id).select("status category groupRegistration registrationCode").lean();
    if (!source) return NextResponse.json({ error: "Registration not found" }, { status: 404 });
    if (source.groupRegistration) return NextResponse.json({ error: "Confirm group delegates from the group registration." }, { status: 400 });
    if (source.status === "approved") return NextResponse.json({ ok: true, alreadyConfirmed: true, registrationCode: source.registrationCode });
    const registrationCode = await generateRegistrationCode(source.category);
    const reg = await Registration.findOneAndUpdate({ _id: id, status: { $ne: "approved" }, registrationCode: { $exists: false } }, { $set: { status: "approved", paymentStatus: "captured", approvedBy: admin.uid, approvedAt: new Date(), paidAt: new Date(), registrationCode }, $unset: { rejectedBy: 1, rejectedAt: 1, reviewNote: 1, paymentError: 1 } }, { new: true });
    if (!reg) { const current = await Registration.findById(id).select("registrationCode").lean(); return NextResponse.json({ ok: true, alreadyConfirmed: true, registrationCode: current?.registrationCode ?? null }); }
    await logAudit({ actor: admin.uid, actorRole: admin.role, action: "registration.manual.confirmed", resourceType: "registration", resourceId: id, details: { registrationCode }, request });
    const email = await registrationApprovedEmail(reg.fullName, registrationCode, reg.feeAmount, !!reg.linkedAbstract);
    await sendMail({ to: reg.email, subject: email.subject, html: email.html, attachments: email.attachments });
    return NextResponse.json({ ok: true, registrationCode, emailSent: true });
>>>>>>> e4fbbe2 (feat: add manual confirmation functionality for individual registrations)
  } catch (err) { return authErrorResponse(err); }
}
