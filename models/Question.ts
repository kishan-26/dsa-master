import { Schema, model, models, type Document, type Model, Types } from "mongoose";
import {
  DIFFICULTIES,
  QUESTION_STATUSES,
  PLATFORMS,
  BIG_O_VALUES,
  MISTAKE_TAGS,
  REVISION_OUTCOMES,
  type Difficulty,
  type QuestionStatus,
  type Platform,
  type MistakeTag,
  type RevisionOutcome,
} from "@/lib/constants/question";

// Re-exported for convenience on the server side (route handlers already
// import mongoose anyway). Client components should import these directly
// from "@/lib/constants/question" instead, to avoid bundling mongoose.
export { DIFFICULTIES, QUESTION_STATUSES, PLATFORMS, BIG_O_VALUES, MISTAKE_TAGS, REVISION_OUTCOMES };
export type { Difficulty, QuestionStatus, Platform, MistakeTag, RevisionOutcome };

interface ICodeApproach {
  code: string;
  language: string;
  timeComplexity?: (typeof BIG_O_VALUES)[number];
  spaceComplexity?: (typeof BIG_O_VALUES)[number];
}

interface IAttempt {
  attemptedAt: Date;
  status: "Failed" | "Solved" | "Gave Up";
  timeTakenMinutes?: number;
  mistakes: MistakeTag[];
  notes?: string;
}

interface IRevisionLogEntry {
  revisedAt: Date;
  outcome: RevisionOutcome;
  intervalDaysBefore: number;
  intervalDaysAfter: number;
  easeFactorBefore: number;
  easeFactorAfter: number;
}

export interface IQuestion extends Document {
  userId: Types.ObjectId;
  title: string;
  difficulty: Difficulty;
  topic: Types.ObjectId;
  patterns: Types.ObjectId[];
  platform: Platform;
  leetcodeId?: string;
  leetcodeSlug?: string;
  status: QuestionStatus;
  attempts: IAttempt[];
  confidence: number; // 1-5
  isFavorite: boolean;
  // Spaced repetition (SM-2 inspired)
  easeFactor: number; // starts at 2.5, like classic SM-2
  intervalDays: number;
  nextRevisionDate: Date | null;
  revisionHistory: IRevisionLogEntry[];
  notes: string; // markdown
  mistakes: MistakeTag[];
  tags: string[];
  code: {
    brute?: ICodeApproach;
    better?: ICodeApproach;
    optimal?: ICodeApproach;
  };
  editorialNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CodeApproachSchema = new Schema<ICodeApproach>(
  {
    code: { type: String, default: "" },
    language: { type: String, default: "cpp" },
    timeComplexity: { type: String, enum: BIG_O_VALUES },
    spaceComplexity: { type: String, enum: BIG_O_VALUES },
  },
  { _id: false }
);

const AttemptSchema = new Schema<IAttempt>(
  {
    attemptedAt: { type: Date, default: Date.now },
    status: { type: String, enum: ["Failed", "Solved", "Gave Up"], required: true },
    timeTakenMinutes: { type: Number },
    mistakes: [{ type: String, enum: MISTAKE_TAGS }],
    notes: { type: String },
  },
  { _id: true }
);

const RevisionLogEntrySchema = new Schema<IRevisionLogEntry>(
  {
    revisedAt: { type: Date, default: Date.now },
    outcome: { type: String, enum: REVISION_OUTCOMES, required: true },
    intervalDaysBefore: { type: Number, required: true },
    intervalDaysAfter: { type: Number, required: true },
    easeFactorBefore: { type: Number, required: true },
    easeFactorAfter: { type: Number, required: true },
  },
  { _id: true }
);

const QuestionSchema = new Schema<IQuestion>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true },
    difficulty: { type: String, enum: DIFFICULTIES, required: true },
    topic: { type: Schema.Types.ObjectId, ref: "Topic", required: true, index: true },
    patterns: [{ type: Schema.Types.ObjectId, ref: "Pattern" }],
    platform: { type: String, enum: PLATFORMS, default: "LeetCode" },
    // NOTE: we intentionally never store LeetCode's problem statement text,
    // only the id/slug needed to construct an outbound link.
    leetcodeId: { type: String },
    leetcodeSlug: { type: String },
    status: { type: String, enum: QUESTION_STATUSES, default: "Not Started" },
    attempts: [AttemptSchema],
    confidence: { type: Number, min: 1, max: 5, default: 1 },
    isFavorite: { type: Boolean, default: false },
    easeFactor: { type: Number, default: 2.5 },
    intervalDays: { type: Number, default: 0 },
    nextRevisionDate: { type: Date, default: null, index: true },
    revisionHistory: [RevisionLogEntrySchema],
    notes: { type: String, default: "" },
    mistakes: [{ type: String, enum: MISTAKE_TAGS }],
    tags: [{ type: String, trim: true }],
    code: {
      brute: CodeApproachSchema,
      better: CodeApproachSchema,
      optimal: CodeApproachSchema,
    },
    editorialNotes: { type: String },
  },
  { timestamps: true }
);

QuestionSchema.index({ userId: 1, title: "text", tags: "text" });
QuestionSchema.index({ userId: 1, status: 1 });
QuestionSchema.index({ userId: 1, nextRevisionDate: 1 });

export const Question: Model<IQuestion> =
  models.Question || model<IQuestion>("Question", QuestionSchema);
