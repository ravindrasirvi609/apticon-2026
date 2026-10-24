import { createHash } from "node:crypto";
import mongoose from "mongoose";
import { connectDB } from "../lib/db";
import Registration from "../models/Registration";
import { registrationApprovedEmail, sendMail } from "../lib/email";

const SEND_INTERVAL_MS = 600;
const WORKERS = 2;
const filter = {
  status: "approved",
  registrationCode: { $type: "string", $ne: "" },
  email: { $type: "string", $ne: "" },
} as const;

async function main() {
  await connectDB();
  const regs = await Registration.find(filter)
    .select("fullName email registrationCode feeAmount")
    .sort({ _id: 1 })
    .lean();
  console.log(`Sending updated confirmation email to ${regs.length} approved delegates.`);

  let sent = 0;
  let failed = 0;
  let index = 0;
  let nextSlot = Date.now();
  const worker = async () => {
    while (true) {
      const reg = regs[index++];
      if (!reg) return;
      const now = Date.now();
      if (nextSlot > now) await new Promise((resolve) => setTimeout(resolve, nextSlot - now));
      nextSlot = Math.max(Date.now(), nextSlot) + SEND_INTERVAL_MS;
      try {
        const email = await registrationApprovedEmail(reg.fullName, reg.registrationCode, reg.feeAmount);
        const contentHash = createHash("sha256")
          .update(reg.email).update("\0").update(email.subject).update("\0").update(email.html)
          .digest("hex").slice(0, 32);
        await sendMail({
          to: reg.email,
          subject: email.subject,
          html: email.html,
          attachments: email.attachments,
          idempotencyKey: `bulk-confirmation-location-${reg._id}-${contentHash}`,
        });
        await Registration.updateOne(
          { _id: reg._id },
          { $set: { bulkConfirmationSentAt: new Date(), confirmationEmailSentAt: new Date() } },
        );
        sent++;
      } catch (err) {
        failed++;
        console.error(`FAILED ${reg.registrationCode} ${reg.email}:`, err);
      }
      if ((sent + failed) % 25 === 0) console.log(`Progress: ${sent + failed}/${regs.length}; sent=${sent}; failed=${failed}`);
    }
  };
  await Promise.all(Array.from({ length: WORKERS }, worker));
  console.log(`Complete: sent=${sent}; failed=${failed}; total=${regs.length}`);
  await mongoose.disconnect();
}

main().catch((err) => { console.error(err); process.exit(1); });
