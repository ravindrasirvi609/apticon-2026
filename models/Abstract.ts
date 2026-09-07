import mongoose, { Schema, Model } from "mongoose";

export type AbstractStatus =
  | "submitted"
  | "under_review"
  | "accepted"
  | "rejected"
  | "revision_requested"
  | "resubmitted";

export interface ICoAuthor {
  name: string;
  institution: string;
}

export interface IAbstract {
  _id: mongoose.Types.ObjectId;
  submissionCode: string;
  title: string;
  coAuthors: ICoAuthor[];
  presentingAuthor: string;
  institution: string;
  email: string;
  phone: string;
  /** Verified against the APTI membership registry at submission time — only members may submit. */
  aptiMemberId: string;
  theme: string;
  // Current values: "review" | "research". Legacy submissions may hold
  // "oral" | "poster" — kept in the union so those documents type-check.
  type: "review" | "research" | "oral" | "poster";
  abstract: string;
  /** Author's preference, collected at submission — editorial can confirm or override it via `presentationType` on acceptance. */
  preferredPresentationType?: "oral" | "poster";
  keywords: string[];
  fileUrl?: string;
  fileKey?: string;
  fileName?: string;
  graphicalAbstractUrl?: string;
  graphicalAbstractKey?: string;
  graphicalAbstractName?: string;
  status: AbstractStatus;
  assignedReviewers: mongoose.Types.ObjectId[];
  finalDecision?: "accepted" | "rejected" | "revision_requested";
  finalDecisionBy?: mongoose.Types.ObjectId;
  finalDecisionAt?: Date;
  finalDecisionNote?: string;
  // Set only once, when editorial confirms acceptance — distinct from `type`
  // (the submission's review/research classification).
  presentationType?: "oral" | "poster";
  abstractCode?: string;
  linkedRegistration?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const CoAuthorSchema = new Schema<ICoAuthor>(
  {
    name: { type: String, required: true, trim: true },
    institution: { type: String, required: true, trim: true },
  },
  { _id: false },
);

const AbstractSchema = new Schema<IAbstract>(
  {
    submissionCode: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true, trim: true },
    coAuthors: { type: [CoAuthorSchema], default: [] },
    presentingAuthor: { type: String, required: true, trim: true },
    institution: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    phone: { type: String, required: true },
    // Enforced at the API layer, not here, so legacy submissions without a membership ID still save.
    aptiMemberId: { type: String, default: "", trim: true, uppercase: true },
    theme: { type: String, required: true },
    // NOTE: legacy submissions may still have "oral"/"poster"; keeping them in
    // the enum keeps historical records queryable without a data migration.
    type: {
      type: String,
      enum: ["review", "research", "oral", "poster"],
      required: true,
    },
    abstract: { type: String, required: true },
    preferredPresentationType: { type: String, enum: ["oral", "poster"] },
    keywords: { type: [String], required: true },
    fileUrl: { type: String },
    fileKey: { type: String },
    fileName: { type: String },
    graphicalAbstractUrl: { type: String },
    graphicalAbstractKey: { type: String },
    graphicalAbstractName: { type: String },
    status: {
      type: String,
      enum: [
        "submitted",
        "under_review",
        "accepted",
        "rejected",
        "revision_requested",
        "resubmitted",
      ],
      default: "submitted",
      index: true,
    },
    assignedReviewers: [{ type: Schema.Types.ObjectId, ref: "User" }],
    finalDecision: {
      type: String,
      enum: ["accepted", "rejected", "revision_requested"],
    },
    finalDecisionBy: { type: Schema.Types.ObjectId, ref: "User" },
    finalDecisionAt: { type: Date },
    finalDecisionNote: { type: String },
    presentationType: { type: String, enum: ["oral", "poster"] },
    abstractCode: { type: String, sparse: true, unique: true, index: true },
    linkedRegistration: {
      type: Schema.Types.ObjectId,
      ref: "Registration",
      index: true,
    },
  },
  { timestamps: true },
);

AbstractSchema.index({ createdAt: -1 });
AbstractSchema.index({ assignedReviewers: 1, status: 1 });

const Abstract: Model<IAbstract> =
  (mongoose.models.Abstract as Model<IAbstract>) ??
  mongoose.model<IAbstract>("Abstract", AbstractSchema);
export default Abstract;
