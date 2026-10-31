/**
 * Emails each delegate who paid through Razorpay their payment receipt (PDF).
 *
 *   npx tsx scripts/send-payment-receipts.ts          dry run: counts recipients and writes one
 *                                                     sample PDF to the temp folder; sends nothing
 *   npx tsx scripts/send-payment-receipts.ts --send   emails every recipient not yet sent
 *   npx tsx scripts/send-payment-receipts.ts --send --limit 5
 *
 * Only self-paid Razorpay registrations are included. Group delegates are skipped because the
 * group coordinator paid the group order, not the delegate. Safe to re-run: each receipt that is
 * sent is stamped with paymentReceiptSentAt and skipped on the next run.
 */

import { config } from "dotenv";
config({ path: ".env.local" });

import { readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import mongoose from "mongoose";
import { connectDB } from "../lib/db";
import Registration from "../models/Registration";
import { isEmailConfigured, paymentReceiptEmail, sendMail } from "../lib/email";
import { buildPaymentReceiptPdf, type PaymentReceiptData } from "../lib/payment-receipt";
import { NEW_APTI_MEMBERSHIP_CATEGORY } from "../lib/registration-fees";

const SEND_INTERVAL_MS = 600;
const LETTERHEAD_PATH = path.join(__dirname, "data", "receipt-letterhead.jpg");
const FONT_PATH = path.join(__dirname, "..", "public", "fonts", "Geist-Regular.ttf");

const recipientFilter = {
  status: "approved",
  paymentMode: "razorpay",
  paymentStatus: "captured",
  razorpayPaymentId: { $type: "string", $ne: "" },
  registrationCode: { $type: "string", $ne: "" },
  email: { $type: "string", $ne: "" },
  groupRegistration: { $exists: false },
  paymentReceiptSentAt: { $exists: false },
} as const;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

type Recipient = {
  _id: mongoose.Types.ObjectId;
  registrationCode: string;
  fullName: string;
  designation: string;
  institution: string;
  city?: string;
  email: string;
  category: string;
  feeAmount: number;
  paidAt?: Date;
  approvedAt?: Date;
  createdAt: Date;
};

function toReceiptData(reg: Recipient): PaymentReceiptData {
  return {
    receiptNo: `APTICON/2026/${reg.registrationCode}`,
    paidOn: reg.paidAt ?? reg.approvedAt ?? reg.createdAt,
    name: reg.fullName,
    designation: reg.designation,
    institution: [reg.institution, reg.city].filter(Boolean).join(", "),
    amount: reg.feeAmount,
    gstIncluded: reg.category !== NEW_APTI_MEMBERSHIP_CATEGORY,
  };
}

async function main() {
  const send = process.argv.includes("--send");
  const limitIndex = process.argv.indexOf("--limit");
  const limit = limitIndex > -1 ? Number(process.argv[limitIndex + 1]) : 0;

  await connectDB();
  const recipients = (await Registration.find(recipientFilter)
    .select("registrationCode fullName designation institution city email category feeAmount paidAt approvedAt createdAt")
    .sort({ _id: 1 })
    .limit(limit)
    .lean()) as Recipient[];
  const groupDelegatesSkipped = await Registration.countDocuments({
    ...recipientFilter,
    groupRegistration: { $exists: true },
  });
  const total = recipients.reduce((sum, reg) => sum + reg.feeAmount, 0);

  console.log(
    `${send ? "Sending" : "Dry run:"} ${recipients.length} payment receipts, total INR ${total.toLocaleString("en-IN")}.`,
  );
  console.log(`Skipped group delegates (paid by coordinator): ${groupDelegatesSkipped}.`);

  const assets = {
    letterhead: await readFile(LETTERHEAD_PATH),
    font: await readFile(FONT_PATH),
  };

  if (!send) {
    const sample = recipients[0];
    if (sample) {
      const file = path.join(os.tmpdir(), `APTICON-2026-Receipt-${sample.registrationCode}.pdf`);
      await writeFile(file, await buildPaymentReceiptPdf(toReceiptData(sample), assets));
      console.log(`Sample receipt for ${sample.registrationCode} written to: ${file}`);
    }
    console.log("Nothing was sent. Re-run with --send to email these delegates.");
    await mongoose.disconnect();
    return;
  }

  // sendMail resolves without sending when the key is missing, which would mark receipts as sent.
  if (!isEmailConfigured()) throw new Error("RESEND_API_KEY is not set. Nothing was sent.");

  let sent = 0;
  let failed = 0;
  for (const [index, reg] of recipients.entries()) {
    try {
      const pdf = await buildPaymentReceiptPdf(toReceiptData(reg), assets);
      const email = paymentReceiptEmail(reg.fullName, reg.registrationCode, reg.feeAmount);
      await sendMail({
        to: reg.email,
        subject: email.subject,
        html: email.html,
        attachments: [
          {
            filename: `APTICON-2026-Receipt-${reg.registrationCode}.pdf`,
            content: pdf,
            contentType: "application/pdf",
          },
        ],
        idempotencyKey: `payment-receipt-${reg._id.toString()}`,
      });
      await Registration.updateOne(
        { _id: reg._id },
        { $set: { paymentReceiptSentAt: new Date() } },
      );
      sent++;
    } catch (err) {
      failed++;
      console.error(`FAILED ${reg.registrationCode} ${reg.email}:`, err);
    }
    if ((index + 1) % 25 === 0)
      console.log(`Progress: ${index + 1}/${recipients.length}; sent=${sent}; failed=${failed}`);
    await sleep(SEND_INTERVAL_MS);
  }
  console.log(`Complete: sent=${sent}; failed=${failed}; total=${recipients.length}`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
