import { Schema, model, models, type Document, type Model, Types } from "mongoose";
import { MISTAKE_TAGS, type MistakeTag } from "./Question";

export interface IMistake extends Document {
  userId: Types.ObjectId;
  question: Types.ObjectId;
  attempt?: Types.ObjectId;
  topic: Types.ObjectId;
  patterns: Types.ObjectId[];
  tag: MistakeTag;
  note?: string;
  loggedAt: Date;
}

const MistakeSchema = new Schema<IMistake>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  question: { type: Schema.Types.ObjectId, ref: "Question", required: true, index: true },
  attempt: { type: Schema.Types.ObjectId },
  topic: { type: Schema.Types.ObjectId, ref: "Topic", required: true, index: true },
  patterns: [{ type: Schema.Types.ObjectId, ref: "Pattern" }],
  tag: { type: String, enum: MISTAKE_TAGS, required: true, index: true },
  note: { type: String },
  loggedAt: { type: Date, default: Date.now, index: true },
});

export const Mistake: Model<IMistake> = models.Mistake || model<IMistake>("Mistake", MistakeSchema);
