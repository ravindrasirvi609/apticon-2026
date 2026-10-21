import mongoose, { Schema, Model } from "mongoose";
import type { EmailBodyFormat } from "@/lib/email-campaign-shared";

export type EmailCampaignStatus = "sending" | "completed" | "cancelled";

export interface IEmailCampaignAttachment {
  key: string;
  url: string;
  filename: string;
  size: number;
  contentType: string;
}

export interface IEmailCampaign {
  _id: mongoose.Types.ObjectId;
  subject: string;
  /** Optional heading inside the branded header; falls back to the rendered subject. */
  headline: string;
  body: string;
  bodyFormat: EmailBodyFormat;
  replyTo: string;
  attachments: IEmailCampaignAttachment[];
  total: number;
  status: EmailCampaignStatus;
  /** Set when sending stopped for a reason that needs the admin (e.g. Resend quota exhausted). */
  haltReason: string;
  createdBy: mongoose.Types.ObjectId | null;
  createdByName: string;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AttachmentSchema = new Schema<IEmailCampaignAttachment>(
  {
    key: { type: String, required: true },
    url: { type: String, required: true },
    filename: { type: String, required: true },
    size: { type: Number, required: true },
    contentType: { type: String, required: true },
  },
  { _id: false },
);

const EmailCampaignSchema = new Schema<IEmailCampaign>(
  {
    subject: { type: String, required: true, trim: true },
    headline: { type: String, default: "", trim: true },
    body: { type: String, required: true },
    bodyFormat: { type: String, enum: ["text", "html"], default: "text" },
    replyTo: { type: String, default: "", trim: true },
    attachments: { type: [AttachmentSchema], default: [] },
    total: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["sending", "completed", "cancelled"],
      default: "sending",
      index: true,
    },
    haltReason: { type: String, default: "" },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    createdByName: { type: String, default: "" },
    completedAt: { type: Date },
  },
  { timestamps: true },
);

EmailCampaignSchema.index({ createdAt: -1 });

const EmailCampaign: Model<IEmailCampaign> =
  (mongoose.models.EmailCampaign as Model<IEmailCampaign>) ??
  mongoose.model<IEmailCampaign>("EmailCampaign", EmailCampaignSchema);
export default EmailCampaign;
