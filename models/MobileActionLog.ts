import mongoose, { Schema, Model } from "mongoose";

export type MobileActionType =
  | "check_in"
  | "id_card"
  | "breakfast"
  | "lunch"
  | "dinner"
  | "kit"
  | "certificate";

export const MOBILE_ACTION_TYPES: MobileActionType[] = [
  "check_in",
  "id_card",
  "breakfast",
  "lunch",
  "dinner",
  "kit",
  "certificate",
];

// Action types scoped to a specific conference day (breakfast/lunch/dinner can repeat once per day).
export const DAY_SCOPED_ACTION_TYPES: MobileActionType[] = ["breakfast", "lunch", "dinner"];

export interface IMobileActionLog {
  _id: mongoose.Types.ObjectId;
  registration: mongoose.Types.ObjectId;
  actionType: MobileActionType;
  // 0 for actions that happen at most once overall (check_in/id_card/kit/certificate).
  // 1, 2, 3... for day-scoped meal actions.
  day: number;
  staff: mongoose.Types.ObjectId;
  device: string;
  createdAt: Date;
  updatedAt: Date;
}

const MobileActionLogSchema = new Schema<IMobileActionLog>(
  {
    registration: { type: Schema.Types.ObjectId, ref: "Registration", required: true, index: true },
    actionType: { type: String, enum: MOBILE_ACTION_TYPES, required: true },
    day: { type: Number, default: 0, min: 0 },
    staff: { type: Schema.Types.ObjectId, ref: "User", required: true },
    device: { type: String, default: "" },
  },
  { timestamps: true }
);

// Enforces "once per attendee per action (per day, for meals)" at the database level.
MobileActionLogSchema.index({ registration: 1, actionType: 1, day: 1 }, { unique: true });

const MobileActionLog: Model<IMobileActionLog> =
  (mongoose.models.MobileActionLog as Model<IMobileActionLog>) ??
  mongoose.model<IMobileActionLog>("MobileActionLog", MobileActionLogSchema);

export default MobileActionLog;
