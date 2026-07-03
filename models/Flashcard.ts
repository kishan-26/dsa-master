import { Schema, model, models, type Document, type Model, Types } from "mongoose";

export interface IFlashcard extends Document {
  userId: Types.ObjectId;
  question: Types.ObjectId; // the DSA Question this card was created from
  front: string; // markdown
  back: string; // markdown
  topic?: Types.ObjectId;
  // Same SM-2-inspired fields as Question, so the revision engine is shared.
  easeFactor: number;
  intervalDays: number;
  nextRevisionDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const FlashcardSchema = new Schema<IFlashcard>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    question: { type: Schema.Types.ObjectId, ref: "Question", required: true, index: true },
    front: { type: String, required: true },
    back: { type: String, required: true },
    topic: { type: Schema.Types.ObjectId, ref: "Topic" },
    easeFactor: { type: Number, default: 2.5 },
    intervalDays: { type: Number, default: 0 },
    nextRevisionDate: { type: Date, default: null, index: true },
  },
  { timestamps: true }
);

export const Flashcard: Model<IFlashcard> =
  models.Flashcard || model<IFlashcard>("Flashcard", FlashcardSchema);
