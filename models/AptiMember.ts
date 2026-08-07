import mongoose, { Schema, Model } from "mongoose";

// Imported from the official APTI membership registry (see scripts/import-apti-members.ts).
// Source of truth for verifying "is this person actually an APTI member" during registration
// (member-priced categories) and abstract submission.
export interface IAptiMember {
  _id: mongoose.Types.ObjectId;
  memberId: string;
  serialNo?: number;
  stateCode?: string;
  name: string;
  email?: string;
  mobile?: string;
  officeAddress?: string;
  city?: string;
  state?: string;
  pincode?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AptiMemberSchema = new Schema<IAptiMember>(
  {
    memberId: { type: String, required: true, unique: true, trim: true, uppercase: true, index: true },
    serialNo: { type: Number },
    stateCode: { type: String, trim: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, lowercase: true, trim: true, index: true },
    mobile: { type: String, trim: true },
    officeAddress: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    pincode: { type: String, trim: true },
  },
  { timestamps: true }
);

const AptiMember: Model<IAptiMember> =
  (mongoose.models.AptiMember as Model<IAptiMember>) ??
  mongoose.model<IAptiMember>("AptiMember", AptiMemberSchema);

export default AptiMember;
