import mongoose, { Schema, Model } from "mongoose";
import type { FeeTier, RegistrationCategory } from "@/lib/registration-fees";

export type RegistrationStatus =
  | "submitted"
  | "payment_review"
  | "approved"
  | "rejected"
  | "resubmitted";

export type PaymentMode = "neft_rtgs" | "upi" | "dd" | "online" | "razorpay";
export type PaymentStatus =
  | "pending"
  | "authorized"
  | "captured"
  | "failed"
  | "refunded";

export interface IRegistration {
  _id: mongoose.Types.ObjectId;
  registrationCode: string;

  // Identity
  fullName: string;
  designation: string;
  institution: string;
  affiliation: string;
  city?: string;
  state?: string;

  // Contact
  email: string;
  phone: string;

  // Delegate photo (badge / directory). Required for new registrations; blank on legacy rows.
  photoKey: string;
  photoUrl: string;
  photoName: string;

  // Registration
  category: RegistrationCategory;
  feeTier: FeeTier;
  feeAmount: number;
  willSubmitAbstract: boolean;
  includesAptiMembership: boolean;
  /** Verified against the APTI membership registry — set only for "APTI Life Member" / "APTI Annual Member" categories. */
  aptiMemberId?: string;

  // Payment
  paymentMode: PaymentMode;
  transactionNumber: string;
  paymentProofKey: string;
  paymentProofUrl: string;
  paymentProofName: string;
  paymentStatus?: PaymentStatus;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  paymentMethod?: string;
  /** Why the last attempt did not result in an approval (gateway error or amount mismatch). */
  paymentError?: string;
  paidAt?: Date;
  /** Set only once the approval email actually sends — lets a retry tell "approved" apart from "delivered". */
  confirmationEmailSentAt?: Date;

  // Workflow
  status: RegistrationStatus;
  approvedBy?: mongoose.Types.ObjectId;
  approvedAt?: Date;
  rejectedBy?: mongoose.Types.ObjectId;
  rejectedAt?: Date;
  reviewNote?: string;
  internalNote?: string;

  // Cross-link
  linkedAbstract?: mongoose.Types.ObjectId;
  /** Set when this delegate was created from an approved GroupRegistration, not individual signup. */
  groupRegistration?: mongoose.Types.ObjectId;

  // Meta
  remarks?: string;
  createdAt: Date;
  updatedAt: Date;
}

const RegistrationSchema = new Schema<IRegistration>(
  {
    // Assigned only after Razorpay confirms capture. Sparse keeps pending registrations
    // without a code out of the unique index.
    registrationCode: { type: String, sparse: true, unique: true, index: true },

    fullName: { type: String, required: true, trim: true },
    designation: { type: String, required: true, trim: true },
    institution: { type: String, required: true, trim: true },
    affiliation: { type: String, default: "", trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    phone: { type: String, required: true, trim: true },

    // Enforced at the API layer, not here, so legacy documents without a photo still save.
    photoKey: { type: String, default: "" },
    photoUrl: { type: String, default: "" },
    photoName: { type: String, default: "" },

    category: { type: String, required: true },
    feeTier: {
      type: String,
      enum: ["early_bird", "regular", "on_spot"],
      required: true,
    },
    feeAmount: { type: Number, required: true, min: 0 },
    willSubmitAbstract: { type: Boolean, default: false },
    includesAptiMembership: { type: Boolean, default: false, index: true },
    aptiMemberId: { type: String, trim: true, uppercase: true },

    paymentMode: {
      type: String,
      enum: ["neft_rtgs", "upi", "dd", "online", "razorpay"],
      required: true,
    },
    transactionNumber: { type: String, default: "", trim: true, index: true },
    paymentProofKey: { type: String, default: "" },
    paymentProofUrl: { type: String, default: "" },
    paymentProofName: { type: String, default: "" },
    paymentStatus: {
      type: String,
      enum: ["pending", "authorized", "captured", "failed", "refunded"],
      index: true,
    },
    razorpayOrderId: { type: String, sparse: true, unique: true, index: true },
    razorpayPaymentId: {
      type: String,
      sparse: true,
      unique: true,
      index: true,
    },
    paymentMethod: { type: String },
    paymentError: { type: String },
    paidAt: { type: Date },
    confirmationEmailSentAt: { type: Date },

    // "payment_review", "rejected" and "resubmitted" are retained for legacy manual-payment
    // documents only — nothing sets them now that Razorpay drives approval.
    status: {
      type: String,
      enum: [
        "submitted",
        "payment_review",
        "approved",
        "rejected",
        "resubmitted",
      ],
      default: "submitted",
      index: true,
    },
    approvedBy: { type: Schema.Types.ObjectId, ref: "User" },
    approvedAt: { type: Date },
    rejectedBy: { type: Schema.Types.ObjectId, ref: "User" },
    rejectedAt: { type: Date },
    reviewNote: { type: String },
    internalNote: { type: String },

    linkedAbstract: {
      type: Schema.Types.ObjectId,
      ref: "Abstract",
      index: true,
    },
    groupRegistration: {
      type: Schema.Types.ObjectId,
      ref: "GroupRegistration",
      index: true,
      sparse: true,
    },

    remarks: { type: String },
  },
  { timestamps: true },
);

RegistrationSchema.index({ createdAt: -1 });
RegistrationSchema.index({ status: 1, createdAt: -1 });

const Registration: Model<IRegistration> =
  (mongoose.models.Registration as Model<IRegistration>) ??
  mongoose.model<IRegistration>("Registration", RegistrationSchema);

export default Registration;
