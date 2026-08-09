import mongoose, { Schema, Model } from "mongoose";

export interface IReview {
  _id: mongoose.Types.ObjectId;
  abstract: mongoose.Types.ObjectId;
  reviewer: mongoose.Types.ObjectId;
  verdict: "accept" | "reject" | "revise";
  /** Only set when verdict is "accept" — the reviewer's Oral/Poster choice, used to finalize the abstract. */
  presentationType?: "oral" | "poster";
  comments: string;
  commentsPrivate?: string;
  submittedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    abstract: { type: Schema.Types.ObjectId, ref: "Abstract", required: true, index: true },
    reviewer: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    verdict: { type: String, enum: ["accept", "reject", "revise"], required: true },
    presentationType: { type: String, enum: ["oral", "poster"] },
    comments: { type: String, required: true },
    commentsPrivate: { type: String },
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

ReviewSchema.index({ abstract: 1, reviewer: 1 }, { unique: true });

const Review: Model<IReview> =
  (mongoose.models.Review as Model<IReview>) ?? mongoose.model<IReview>("Review", ReviewSchema);
export default Review;
