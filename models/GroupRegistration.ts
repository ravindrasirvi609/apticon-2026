import mongoose, { Schema, Model } from "mongoose";
import type { FeeTier, RegistrationCategory } from "@/lib/registration-fees";
import type { PaymentStatus } from "@/models/Registration";

export type GroupRegistrationStatus = "submitted" | "payment_review" | "approved" | "rejected";

export interface IGroupDelegate {
  name: string;
  designation: string;
  email: string;
  phone: string;
  affiliation: string;
  isAptiMember: boolean;
  aptiMemberId?: string;
  photoKey: string;
  photoUrl: string;
  photoName: string;
  isComplimentary: boolean;
}

export interface IGroupRegistration {
  _id: mongoose.Types.ObjectId;
  groupCode: string;

  coordinatorName: string;
  coordinatorEmail: string;
  coordinatorPhone: string;
  coordinatorPhotoKey: string;
  coordinatorPhotoUrl: string;
  coordinatorPhotoName: string;
  coordinatorAffiliation: string;
  coordinatorAptiMemberId?: string;
  institution: string;
  city?: string;
  state?: string;

  category: RegistrationCategory;
  delegates: IGroupDelegate[];
  delegateCount: number;
  complimentaryCount: number;

  feeTier: FeeTier;
  baseFeeAmount: number;
  feeAmount: number; // post-GST total actually charged

  paymentMode: "razorpay";
  paymentStatus?: PaymentStatus;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  paymentMethod?: string;
  paidAt?: Date;

  status: GroupRegistrationStatus;
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedAt?: Date;
  reviewNote?: string;

  createdRegistrations: mongoose.Types.ObjectId[];

  createdAt: Date;
  updatedAt: Date;
}

const GroupDelegateSchema = new Schema<IGroupDelegate>(
  {
    name: { type: String, required: true, trim: true },
    designation: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    affiliation: { type: String, required: true, trim: true },
    isAptiMember: { type: Boolean, default: false },
    aptiMemberId: { type: String, trim: true, uppercase: true },
    photoKey: { type: String, default: "" },
    photoUrl: { type: String, default: "" },
    photoName: { type: String, default: "" },
    isComplimentary: { type: Boolean, default: false },
  },
  { _id: false }
);

const GroupRegistrationSchema = new Schema<IGroupRegistration>(
  {
    groupCode: { type: String, required: true, unique: true, index: true },

    coordinatorName: { type: String, required: true, trim: true },
    coordinatorEmail: { type: String, required: true, lowercase: true, trim: true, index: true },
    coordinatorPhone: { type: String, required: true, trim: true },
    coordinatorPhotoKey: { type: String, required: true },
    coordinatorPhotoUrl: { type: String, default: "" },
    coordinatorPhotoName: { type: String, required: true },
    coordinatorAffiliation: { type: String, required: true, trim: true },
    coordinatorAptiMemberId: { type: String, trim: true, uppercase: true },
    institution: { type: String, required: true, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },

    category: { type: String, required: true },
    delegates: { type: [GroupDelegateSchema], required: true },
    delegateCount: { type: Number, required: true, min: 1 },
    complimentaryCount: { type: Number, required: true, default: 0 },

    feeTier: { type: String, enum: ["early_bird", "regular", "on_spot"], required: true },
    baseFeeAmount: { type: Number, required: true, min: 0 },
    feeAmount: { type: Number, required: true, min: 0 },

    paymentMode: { type: String, enum: ["razorpay"], required: true, default: "razorpay" },
    paymentStatus: { type: String, enum: ["pending", "authorized", "captured", "failed", "refunded"], index: true },
    razorpayOrderId: { type: String, sparse: true, unique: true, index: true },
    razorpayPaymentId: { type: String, sparse: true, unique: true, index: true },
    paymentMethod: { type: String },
    paidAt: { type: Date },

    status: {
      type: String,
      enum: ["submitted", "payment_review", "approved", "rejected"],
      default: "submitted",
      index: true,
    },
    reviewedBy: { type: Schema.Types.ObjectId, ref: "User" },
    reviewedAt: { type: Date },
    reviewNote: { type: String },

    createdRegistrations: [{ type: Schema.Types.ObjectId, ref: "Registration" }],
  },
  { timestamps: true }
);

GroupRegistrationSchema.index({ createdAt: -1 });

const GroupRegistration: Model<IGroupRegistration> =
  (mongoose.models.GroupRegistration as Model<IGroupRegistration>) ??
  mongoose.model<IGroupRegistration>("GroupRegistration", GroupRegistrationSchema);

export default GroupRegistration;
