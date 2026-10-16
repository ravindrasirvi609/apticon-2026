import mongoose, { Schema, Model } from "mongoose";

// One feedback entry per delegate per session; submitting again updates it.
export interface IDelegateFeedback {
  _id: mongoose.Types.ObjectId;
  sessionId: string;
  registration: mongoose.Types.ObjectId;
  rating: number;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
}

const DelegateFeedbackSchema = new Schema<IDelegateFeedback>(
  {
    sessionId: { type: String, required: true },
    registration: {
      type: Schema.Types.ObjectId,
      ref: "Registration",
      required: true,
    },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: "", trim: true, maxlength: 1000 },
  },
  { timestamps: true },
);

// Enforced by the database so concurrent submits can't create duplicates.
DelegateFeedbackSchema.index(
  { sessionId: 1, registration: 1 },
  { unique: true },
);

const DelegateFeedback: Model<IDelegateFeedback> =
  (mongoose.models.DelegateFeedback as Model<IDelegateFeedback>) ??
  mongoose.model<IDelegateFeedback>("DelegateFeedback", DelegateFeedbackSchema);

export default DelegateFeedback;
