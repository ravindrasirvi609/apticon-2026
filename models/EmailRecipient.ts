import mongoose, { Schema, Model } from "mongoose";

export type EmailRecipientStatus =
  | "pending"
  | "sending"
  | "sent"
  | "failed"
  | "cancelled";

export interface IEmailRecipient {
  _id: mongoose.Types.ObjectId;
  campaign: mongoose.Types.ObjectId;
  email: string;
  name: string;
  /** Variable values frozen when the campaign was created, so every retry renders identically. */
  vars: Record<string, string>;
  status: EmailRecipientStatus;
  attempts: number;
  error: string;
  resendId: string;
  /** Identifies the request that claimed this row; lets concurrent send calls share a campaign safely. */
  claimToken: string;
  claimedAt?: Date;
  sentAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const EmailRecipientSchema = new Schema<IEmailRecipient>(
  {
    campaign: {
      type: Schema.Types.ObjectId,
      ref: "EmailCampaign",
      required: true,
    },
    email: { type: String, required: true, lowercase: true, trim: true },
    name: { type: String, default: "" },
    vars: { type: Schema.Types.Mixed, default: {} },
    status: {
      type: String,
      enum: ["pending", "sending", "sent", "failed", "cancelled"],
      default: "pending",
    },
    attempts: { type: Number, default: 0 },
    error: { type: String, default: "" },
    resendId: { type: String, default: "" },
    claimToken: { type: String, default: "" },
    claimedAt: { type: Date },
    sentAt: { type: Date },
  },
  { timestamps: true },
);

EmailRecipientSchema.index({ campaign: 1, status: 1 });
EmailRecipientSchema.index({ campaign: 1, email: 1 }, { unique: true });

const EmailRecipient: Model<IEmailRecipient> =
  (mongoose.models.EmailRecipient as Model<IEmailRecipient>) ??
  mongoose.model<IEmailRecipient>("EmailRecipient", EmailRecipientSchema);
export default EmailRecipient;
