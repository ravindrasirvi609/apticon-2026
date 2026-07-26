import mongoose, { Schema, Model } from "mongoose";

export type AbstractStatus =
  | "submitted"
  | "under_review"
  | "accepted"
  | "rejected"
  | "revision_requested"
  | "resubmitted";

export interface IAbstract {
  _id: mongoose.Types.ObjectId;
  submissionCode: string;
  title: string;
  authors: string;
  presentingAuthor: string;
  institution: string;
  email: string;
  phone: string;
  theme: string;
  type: "oral" | "poster";
  abstract: string;
  fileUrl?: string;
  fileKey?: string;
  fileName?: string;
  status: AbstractStatus;
  assignedReviewers: mongoose.Types.ObjectId[];
  finalDecision?: "accepted" | "rejected" | "revision_requested";
  finalDecisionBy?: mongoose.Types.ObjectId;
  finalDecisionAt?: Date;
  finalDecisionNote?: string;
  linkedRegistration?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const AbstractSchema = new Schema<IAbstract>(
  {
    submissionCode: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true, trim: true },
    authors: { type: String, required: true },
    presentingAuthor: { type: String, required: true, trim: true },
    institution: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    phone: { type: String, required: true },
    theme: { type: String, required: true },
    type: { type: String, enum: ["oral", "poster"], required: true },
    abstract: { type: String, required: true },
    fileUrl: { type: String },
    fileKey: { type: String },
    fileName: { type: String },
    status: {
      type: String,
      enum: ["submitted", "under_review", "accepted", "rejected", "revision_requested", "resubmitted"],
      default: "submitted",
      index: true,
    },
    assignedReviewers: [{ type: Schema.Types.ObjectId, ref: "User" }],
    finalDecision: { type: String, enum: ["accepted", "rejected", "revision_requested"] },
    finalDecisionBy: { type: Schema.Types.ObjectId, ref: "User" },
    finalDecisionAt: { type: Date },
    finalDecisionNote: { type: String },
    linkedRegistration: { type: Schema.Types.ObjectId, ref: "Registration", index: true },
  },
  { timestamps: true }
);

AbstractSchema.index({ createdAt: -1 });
AbstractSchema.index({ assignedReviewers: 1, status: 1 });

const Abstract: Model<IAbstract> =
  (mongoose.models.Abstract as Model<IAbstract>) ?? mongoose.model<IAbstract>("Abstract", AbstractSchema);
export default Abstract;
