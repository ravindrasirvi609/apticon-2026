import mongoose, { Schema, Model } from "mongoose";

export interface ICounter {
  _id: string;
  seq: number;
}

const CounterSchema = new Schema<ICounter>({
  _id: { type: String, required: true },
  // Generators increment before using the value, so a new counter must start at 0.
  seq: { type: Number, default: 0 },
});

const Counter: Model<ICounter> =
  (mongoose.models.Counter as Model<ICounter>) ??
  mongoose.model<ICounter>("Counter", CounterSchema);

export default Counter;
