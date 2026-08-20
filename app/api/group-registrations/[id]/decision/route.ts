import { NextResponse, type NextRequest } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import GroupRegistration from "@/models/GroupRegistration";
import Registration from "@/models/Registration";
import { generateRegistrationCode } from "@/lib/registration-code";
import { groupDecisionSchema } from "@/lib/validators/group-registration";
import { requireAnyRole, authErrorResponse } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { sendMail, registrationApprovedEmail, groupRegistrationApprovedEmail, groupRegistrationRejectedEmail } from "@/lib/email";
import { sendWhatsAppNotification } from "@/lib/whatsapp";

/**
 * Approves or rejects a group registration that's finished paying (status "payment_review").
 * Unlike individual registrations (auto-approved on Razorpay capture), groups always wait for a
 * human to check the delegate list/institution before real Registration documents are created —
 * so a rejected/still-pending group never pollutes delegate lists, check-in, or stats.
 */
export async function POST(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAnyRole("super_admin", "editorial");

    const { id } = await ctx.params;
    if (!mongoose.isValidObjectId(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

    const body = await request.json().catch(() => null);
    const parsed = groupDecisionSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
    const { decision, reviewNote } = parsed.data;

    await connectDB();

    // Atomically claim the group so a double-click (or two staff acting at once) can't
    // double-create delegate registrations. `new: false` returns the pre-update doc, which is
    // what we need to iterate delegates from.
    const group = await GroupRegistration.findOneAndUpdate(
      { _id: id, status: "payment_review" },
      {
        $set: {
          status: decision,
          reviewedBy: admin.uid,
          reviewedAt: new Date(),
          ...(reviewNote ? { reviewNote } : {}),
        },
      },
      { new: false }
    );

    if (!group) {
      return NextResponse.json(
        { error: "This group registration is not awaiting review (already decided, or payment not yet captured)." },
        { status: 409 }
      );
    }

    if (decision === "rejected") {
      await logAudit({
        actor: admin.uid,
        actorRole: admin.role,
        action: "group_registration.rejected",
        resourceType: "group_registration",
        resourceId: id,
        details: { groupCode: group.groupCode, reviewNote },
        request,
      });
      const { subject, html } = groupRegistrationRejectedEmail(group.coordinatorName, group.groupCode, reviewNote ?? "");
      await sendMail({ to: group.coordinatorEmail, subject, html });
      await sendWhatsAppNotification(group.coordinatorPhone, "group_registration_rejected", [group.coordinatorName, group.groupCode], group._id.toString());
      return NextResponse.json({ ok: true, status: "rejected" });
    }

    // Approved: create one real Registration per delegate. Fee is split evenly across the
    // paying delegates (complimentary delegates get feeAmount: 0) since the group paid one
    // lump discounted sum rather than per-head amounts.
    const paidCount = group.delegateCount - group.complimentaryCount;
    const perHeadShare = paidCount > 0 ? Math.round(group.feeAmount / paidCount) : 0;

    const createdIds: mongoose.Types.ObjectId[] = [];
    for (const delegate of group.delegates) {
      const registrationCode = await generateRegistrationCode(group.category);

      const reg = await Registration.create({
        registrationCode,
        fullName: delegate.name,
        designation: delegate.designation,
        institution: group.institution,
        city: group.city,
        state: group.state,
        email: delegate.email,
        phone: delegate.phone,
        photoKey: delegate.photoKey,
        photoUrl: delegate.photoUrl,
        photoName: delegate.photoName,
        category: group.category,
        feeTier: group.feeTier,
        feeAmount: delegate.isComplimentary ? 0 : perHeadShare,
        willSubmitAbstract: false,
        includesAptiMembership: false,
        paymentMode: "razorpay",
        paymentStatus: "captured",
        razorpayOrderId: group.razorpayOrderId,
        razorpayPaymentId: group.razorpayPaymentId,
        paymentMethod: group.paymentMethod,
        paidAt: group.paidAt,
        status: "approved",
        approvedAt: new Date(),
        groupRegistration: group._id,
      });
      createdIds.push(reg._id);

      const { subject, html, attachments } = await registrationApprovedEmail(reg.fullName, reg.registrationCode, reg.feeAmount, false);
      await sendMail({ to: reg.email, subject, html, attachments });
      await sendWhatsAppNotification(reg.phone, "registration_approved", [reg.fullName, reg.registrationCode], reg._id.toString());
    }

    await GroupRegistration.updateOne({ _id: group._id }, { $set: { createdRegistrations: createdIds } });

    await logAudit({
      actor: admin.uid,
      actorRole: admin.role,
      action: "group_registration.approved",
      resourceType: "group_registration",
      resourceId: id,
      details: { groupCode: group.groupCode, delegateCount: group.delegateCount, createdRegistrations: createdIds.map((i) => i.toString()) },
      request,
    });

    const { subject, html } = groupRegistrationApprovedEmail(group.coordinatorName, group.groupCode, group.delegateCount);
    await sendMail({ to: group.coordinatorEmail, subject, html });
    await sendWhatsAppNotification(group.coordinatorPhone, "group_registration_approved", [group.coordinatorName, group.groupCode], group._id.toString());

    return NextResponse.json({ ok: true, status: "approved", createdCount: createdIds.length });
  } catch (err) {
    return authErrorResponse(err);
  }
}
