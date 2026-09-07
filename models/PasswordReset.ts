import mongoose, { Schema, Model } from "mongoose";

export interface IPasswordReset {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  tokenHash: string;
  expiresAt: Date;
  usedAt?: Date;
  createdAt: Date;
}

const PasswordResetSchema = new Schema<IPasswordReset>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    tokenHash: { type: String, required: true, index: true },
    expiresAt: { type: Date, required: true },
    usedAt: { type: Date },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

PasswordResetSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const PasswordReset: Model<IPasswordReset> =
  (mongoose.models.PasswordReset as Model<IPasswordReset>) ??
  mongoose.model<IPasswordReset>("PasswordReset", PasswordResetSchema);
export default PasswordReset;
