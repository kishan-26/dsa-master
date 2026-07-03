import { Schema, model, models, type Document, type Model, Types } from "mongoose";
import { MISTAKE_TAGS, type MistakeTag } from "./Question";

// Denormalized copy of each attempt at the top level so analytics queries
// (avg solve time, trend over time, per-topic accuracy) don't need to
// unwind the embedded array on every Question document.
export interface IAttempt extends Document {
  userId: Types.ObjectId;
  question: Types.ObjectId;
  topic: Types.ObjectId;
  patterns: Types.ObjectId[];
  status: "Failed" | "Solved" | "Gave Up";
  timeTakenMinutes?: number;
  mistakes: MistakeTag[];
  attemptedAt: Date;
}

const AttemptSchema = new Schema<IAttempt>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  question: { type: Schema.Types.ObjectId, ref: "Question", required: true, index: true },
  topic: { type: Schema.Types.ObjectId, ref: "Topic", required: true, index: true },
  patterns: [{ type: Schema.Types.ObjectId, ref: "Pattern" }],
  status: { type: String, enum: ["Failed", "Solved", "Gave Up"], required: true },
  timeTakenMinutes: { type: Number },
  mistakes: [{ type: String, enum: MISTAKE_TAGS }],
  attemptedAt: { type: Date, default: Date.now, index: true },
});

export const Attempt: Model<IAttempt> = models.Attempt || model<IAttempt>("Attempt", AttemptSchema);
