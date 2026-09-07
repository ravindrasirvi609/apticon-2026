import mongoose, { Schema, Model } from "mongoose";

export interface IUser {
  _id: mongoose.Types.ObjectId;
  email: string;
  name: string;
  passwordHash: string;
  role: "super_admin" | "reviewer" | "editorial" | "checkin_staff";
  expertise: string[];
  isActive: boolean;
  mustChangePassword: boolean;
  lastLoginAt?: Date;
  lastLoginIp?: string;
  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: ["super_admin", "reviewer", "editorial", "checkin_staff"],
      required: true,
      index: true,
    },
    expertise: { type: [String], default: [] },
    isActive: { type: Boolean, default: true, index: true },
    mustChangePassword: { type: Boolean, default: true },
    lastLoginAt: { type: Date },
    lastLoginIp: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

const User: Model<IUser> =
  (mongoose.models.User as Model<IUser>) ??
  mongoose.model<IUser>("User", UserSchema);
export default User;
