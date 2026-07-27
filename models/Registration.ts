import mongoose, { Schema, Model } from "mongoose";
import type { FeeTier, RegistrationCategory } from "@/lib/registration-fees";

export type RegistrationStatus =
  | "submitted"
  | "payment_review"
  | "approved"
  | "rejected"
  | "resubmitted";

export type PaymentMode = "neft_rtgs" | "upi" | "dd" | "online";

export interface IRegistration {
  _id: mongoose.Types.ObjectId;
  registrationCode: string;

  // Identity
  fullName: string;
  designation: string;
  institution: string;
  city?: string;
  state?: string;

  // Contact
  email: string;
  phone: string;

  // Registration
  category: RegistrationCategory;
  feeTier: FeeTier;
  feeAmount: number;
  willSubmitAbstract: boolean;

  // Payment
  paymentMode: PaymentMode;
  transactionNumber: string;
  paymentProofKey: string;
  paymentProofUrl: string;
  paymentProofName: string;

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

  // Meta
  remarks?: string;
  createdAt: Date;
  updatedAt: Date;
}

const RegistrationSchema = new Schema<IRegistration>(
  {
    registrationCode: { type: String, required: true, unique: true, index: true },

    fullName:     { type: String, required: true, trim: true },
    designation:  { type: String, required: true, trim: true },
    institution:  { type: String, required: true, trim: true },
    city:         { type: String, trim: true },
    state:        { type: String, trim: true },

    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    phone: { type: String, required: true, trim: true },

    category:           { type: String, required: true },
    feeTier:            { type: String, enum: ["early_bird", "regular", "on_spot"], required: true },
    feeAmount:          { type: Number, required: true, min: 0 },
    willSubmitAbstract: { type: Boolean, default: false },

    paymentMode:       { type: String, enum: ["neft_rtgs", "upi", "dd", "online"], required: true },
    transactionNumber: { type: String, required: true, trim: true, index: true },
    paymentProofKey:   { type: String, required: true },
    paymentProofUrl:   { type: String, required: true },
    paymentProofName:  { type: String, required: true },

    status: {
      type: String,
      enum: ["submitted", "payment_review", "approved", "rejected", "resubmitted"],
      default: "payment_review",
      index: true,
    },
    approvedBy: { type: Schema.Types.ObjectId, ref: "User" },
    approvedAt: { type: Date },
    rejectedBy: { type: Schema.Types.ObjectId, ref: "User" },
    rejectedAt: { type: Date },
    reviewNote:   { type: String },
    internalNote: { type: String },

    linkedAbstract: { type: Schema.Types.ObjectId, ref: "Abstract", index: true },

    remarks: { type: String },
  },
  { timestamps: true }
);

RegistrationSchema.index({ createdAt: -1 });
RegistrationSchema.index({ status: 1, createdAt: -1 });

const Registration: Model<IRegistration> =
  (mongoose.models.Registration as Model<IRegistration>) ??
  mongoose.model<IRegistration>("Registration", RegistrationSchema);

export default Registration;
