import mongoose, { Schema, Model } from "mongoose";
import {
  RATING_KEYS,
  type EventFeedbackRatings,
  type RecommendValue,
} from "@/lib/event-feedback-shared";

/**
 * The end-of-convention feedback form. One submission per registration; having one is what
 * unlocks the participation certificate.
 */
export interface IEventFeedback {
  _id: mongoose.Types.ObjectId;
  registration: mongoose.Types.ObjectId;
  // Snapshots, so the admin report still reads correctly if the registration is later edited.
  registrationCode: string;
  email: string;
  name: string;
  institution: string;
  ratings: EventFeedbackRatings;
  wouldRecommend: RecommendValue;
  mostValuable: string;
  suggestions: string;
  certificateDownloads: number;
  lastCertificateAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ratingFields = Object.fromEntries(
  RATING_KEYS.map((key) => [
    key,
    { type: Number, required: true, min: 1, max: 5 },
  ]),
);

const EventFeedbackSchema = new Schema<IEventFeedback>(
  {
    registration: {
      type: Schema.Types.ObjectId,
      ref: "Registration",
      required: true,
    },
    registrationCode: { type: String, required: true, index: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    institution: { type: String, default: "", trim: true },
    ratings: { type: new Schema(ratingFields, { _id: false }), required: true },
    wouldRecommend: {
      type: String,
      enum: ["yes", "maybe", "no"],
      required: true,
    },
    mostValuable: { type: String, default: "", trim: true },
    suggestions: { type: String, default: "", trim: true },
    certificateDownloads: { type: Number, default: 0 },
    lastCertificateAt: { type: Date },
  },
  { timestamps: true },
);

// Enforced by the database so a double-click or two tabs can never create two submissions.
EventFeedbackSchema.index({ registration: 1 }, { unique: true });
EventFeedbackSchema.index({ createdAt: -1 });

const EventFeedback: Model<IEventFeedback> =
  (mongoose.models.EventFeedback as Model<IEventFeedback>) ??
  mongoose.model<IEventFeedback>("EventFeedback", EventFeedbackSchema);
export default EventFeedback;
