import { Schema, model, models, type Document, type Model, Types } from "mongoose";
import { REVISION_OUTCOMES, type RevisionOutcome } from "./Question";

export interface IRevisionLog extends Document {
  userId: Types.ObjectId;
  question?: Types.ObjectId; // set when revising a Question
  flashcard?: Types.ObjectId; // set when revising a Flashcard
  topic?: Types.ObjectId;
  outcome: RevisionOutcome;
  intervalDaysBefore: number;
  intervalDaysAfter: number;
  easeFactorBefore: number;
  easeFactorAfter: number;
  revisedAt: Date;
  // true if this revision happened on/before its scheduled due date
  wasOnTime: boolean;
}

const RevisionLogSchema = new Schema<IRevisionLog>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  question: { type: Schema.Types.ObjectId, ref: "Question", index: true },
  flashcard: { type: Schema.Types.ObjectId, ref: "Flashcard", index: true },
  topic: { type: Schema.Types.ObjectId, ref: "Topic", index: true },
  outcome: { type: String, enum: REVISION_OUTCOMES, required: true },
  intervalDaysBefore: { type: Number, required: true },
  intervalDaysAfter: { type: Number, required: true },
  easeFactorBefore: { type: Number, required: true },
  easeFactorAfter: { type: Number, required: true },
  revisedAt: { type: Date, default: Date.now, index: true },
  wasOnTime: { type: Boolean, required: true },
});

export const RevisionLog: Model<IRevisionLog> =
  models.RevisionLog || model<IRevisionLog>("RevisionLog", RevisionLogSchema);
