import mongoose, { Schema, Model } from "mongoose";

export type DelegateQuestionStatus =
  | "pending"
  | "approved"
  | "answered"
  | "hidden";

export const DELEGATE_QUESTION_STATUSES: DelegateQuestionStatus[] = [
  "pending",
  "approved",
  "answered",
  "hidden",
];

// A question a delegate asked for one session. `isAnonymous` only controls what OTHER people may
// later see — the registration is always stored so organizers can deal with abuse. How questions
// are displayed/moderated is intentionally not built yet; everything starts as "pending".
export interface IDelegateQuestion {
  _id: mongoose.Types.ObjectId;
  sessionId: string;
  registration: mongoose.Types.ObjectId;
  text: string;
  isAnonymous: boolean;
  status: DelegateQuestionStatus;
  createdAt: Date;
  updatedAt: Date;
}

const DelegateQuestionSchema = new Schema<IDelegateQuestion>(
  {
    sessionId: { type: String, required: true },
    registration: {
      type: Schema.Types.ObjectId,
      ref: "Registration",
      required: true,
    },
    text: { type: String, required: true, trim: true, maxlength: 500 },
    isAnonymous: { type: Boolean, default: false },
    status: {
      type: String,
      enum: DELEGATE_QUESTION_STATUSES,
      default: "pending",
    },
  },
  { timestamps: true },
);

// "my questions for this session" + per-delegate cap.
DelegateQuestionSchema.index({ registration: 1, sessionId: 1, createdAt: -1 });
// Organizer listing per session.
DelegateQuestionSchema.index({ sessionId: 1, status: 1, createdAt: -1 });

const DelegateQuestion: Model<IDelegateQuestion> =
  (mongoose.models.DelegateQuestion as Model<IDelegateQuestion>) ??
  mongoose.model<IDelegateQuestion>("DelegateQuestion", DelegateQuestionSchema);

export default DelegateQuestion;
