import { NextResponse, type NextRequest } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import {
  getRazorpayPayment,
  verifyRazorpayPaymentSignature,
} from "@/lib/razorpay";
import { groupRazorpayVerifySchema } from "@/lib/validators/group-registration";
import GroupRegistration from "@/models/GroupRegistration";
import Registration from "@/models/Registration";
import { generateRegistrationCode } from "@/lib/registration-code";
import {
  sendMail,
  registrationApprovedEmail,
  groupRegistrationApprovedEmail,
} from "@/lib/email";
import { logAudit } from "@/lib/audit";
import { sendWhatsAppNotification } from "@/lib/whatsapp";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = groupRazorpayVerifySchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json(
      { error: "Invalid payment response" },
      { status: 400 },
    );
  const data = parsed.data;
  await connectDB();
  const group = await GroupRegistration.findById(data.groupRegistrationId);
  if (
    !group ||
    group.paymentMode !== "razorpay" ||
    group.razorpayOrderId !== data.razorpay_order_id
  ) {
    return NextResponse.json(
      { error: "Payment order not found" },
      { status: 404 },
    );
  }
  if (
    !verifyRazorpayPaymentSignature(
      group.razorpayOrderId,
      data.razorpay_payment_id,
      data.razorpay_signature,
    )
  ) {
    return NextResponse.json(
      { error: "Payment signature could not be verified" },
      { status: 400 },
    );
  }

  try {
    const payment = await getRazorpayPayment(data.razorpay_payment_id);
    if (
      payment.order_id !== group.razorpayOrderId ||
      payment.currency !== "INR" ||
      payment.amount !== group.feeAmount * 100
    ) {
      return NextResponse.json(
        { error: "Payment details do not match this group registration" },
        { status: 400 },
      );
    }

    if (payment.status === "captured") {
      const updated = await GroupRegistration.findOneAndUpdate(
        { _id: group._id, status: "submitted" },
        {
          $set: {
            status: "approved",
            paymentStatus: "captured",
            razorpayPaymentId: payment.id,
            paymentMethod: payment.method,
            paidAt: new Date(),
          },
        },
        { new: true },
      );
      if (updated) {
        const paidCount = updated.delegateCount - updated.complimentaryCount;
        const perHeadShare =
          paidCount > 0 ? Math.round(updated.feeAmount / paidCount) : 0;
        const createdIds: mongoose.Types.ObjectId[] = [];

        for (const delegate of updated.delegates) {
          const registrationCode = await generateRegistrationCode(
            updated.category,
          );
          const reg = await Registration.create({
            registrationCode,
            fullName: delegate.name,
            designation: delegate.designation,
            institution: updated.institution,
            affiliation: delegate.affiliation,
            city: updated.city,
            state: updated.state,
            email: delegate.email,
            phone: delegate.phone,
            photoKey: delegate.photoKey,
            photoUrl: delegate.photoUrl,
            photoName: delegate.photoName,
            aptiMemberId: delegate.isAptiMember
              ? delegate.aptiMemberId
              : undefined,
            includesAptiMembership: delegate.isAptiMember,
            category: updated.category,
            feeTier: updated.feeTier,
            feeAmount: delegate.isComplimentary ? 0 : perHeadShare,
            willSubmitAbstract: false,
            paymentMode: "razorpay",
            paymentStatus: "captured",
            razorpayOrderId: updated.razorpayOrderId,
            razorpayPaymentId: updated.razorpayPaymentId,
            paymentMethod: updated.paymentMethod,
            paidAt: updated.paidAt,
            status: "approved",
            approvedAt: new Date(),
            groupRegistration: updated._id,
          });
          createdIds.push(reg._id);
          const email = await registrationApprovedEmail(reg.fullName, reg.registrationCode, reg.feeAmount, false);
          await sendMail({ to: reg.email, subject: email.subject, html: email.html, attachments: email.attachments });
          // await sendWhatsAppNotification(reg.phone, "registration_approved", [reg.fullName, reg.registrationCode], reg._id.toString());
        }
        await GroupRegistration.updateOne(
          { _id: updated._id },
          { $set: { createdRegistrations: createdIds } },
        );
        await logAudit({
          actorRole: "public",
          action: "group_registration.payment_captured",
          resourceType: "group_registration",
          resourceId: group._id.toString(),
          details: {
            groupCode: group.groupCode,
            razorpayOrderId: group.razorpayOrderId,
            razorpayPaymentId: payment.id,
            amount: payment.amount,
          },
          request,
        });
        const { subject, html } = groupRegistrationApprovedEmail(
          updated.coordinatorName,
          updated.groupCode,
          updated.delegateCount,
        );
        await sendMail({ to: updated.coordinatorEmail, subject, html });
      }
      return NextResponse.json({
        ok: true,
        captured: true,
        groupCode: group.groupCode,
      });
    }

    await GroupRegistration.updateOne(
      { _id: group._id, status: "submitted" },
      {
        $set: {
          razorpayPaymentId: payment.id,
          paymentMethod: payment.method,
          paymentStatus: payment.status,
        },
      },
    );
    return NextResponse.json({
      ok: true,
      captured: false,
      groupCode: group.groupCode,
    });
  } catch (error) {
    console.error("[razorpay] group payment verification failed:", error);
    return NextResponse.json(
      {
        error:
          "We could not verify the payment yet. Your payment status will update automatically.",
      },
      { status: 502 },
    );
  }
}
