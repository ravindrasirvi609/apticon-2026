import mongoose, { Schema, Model } from "mongoose";

// Brute-force guard for POST /api/mobile/delegate/auth/login. Registration codes are short and
// sequential (AM1001, AA501...) and the in-memory lib/rate-limit.ts is per serverless instance,
// so failures are counted in the database, keyed by the submitted code (whether or not that code
// exists — so a lock never reveals which codes are real).
export interface IDelegateLoginAttempt {
  _id: mongoose.Types.ObjectId;
  key: string;
  failures: number;
  lockedUntil?: Date;
  // TTL: the whole document disappears once this passes (refreshed on every failure).
  expiresAt: Date;
}

const DelegateLoginAttemptSchema = new Schema<IDelegateLoginAttempt>({
  key: { type: String, required: true, unique: true },
  failures: { type: Number, default: 0 },
  lockedUntil: { type: Date },
  expiresAt: { type: Date, required: true, expires: 0 },
});

const DelegateLoginAttempt: Model<IDelegateLoginAttempt> =
  (mongoose.models.DelegateLoginAttempt as Model<IDelegateLoginAttempt>) ??
  mongoose.model<IDelegateLoginAttempt>(
    "DelegateLoginAttempt",
    DelegateLoginAttemptSchema,
  );

export default DelegateLoginAttempt;
