import mongoose, { Model, Schema } from "mongoose";

export interface IWpdPost {
  _id: mongoose.Types.ObjectId;
  name: string;
  designation: string;
  email: string;
  mobile: string;
  photoUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

const WpdPostSchema = new Schema<IWpdPost>(
  {
    name: { type: String, required: true, trim: true },
    designation: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    mobile: { type: String, required: true, trim: true },
    photoUrl: { type: String, required: true },
  },
  { timestamps: true },
);

const WpdPost: Model<IWpdPost> =
  (mongoose.models.WpdPost as Model<IWpdPost>) ??
  mongoose.model<IWpdPost>("WpdPost", WpdPostSchema);

export default WpdPost;
