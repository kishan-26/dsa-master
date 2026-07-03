import { Schema, model, models, type Document, type Model, Types } from "mongoose";

export interface IPattern extends Document {
  userId: Types.ObjectId;
  name: string;
  slug: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PatternSchema = new Schema<IPattern>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, lowercase: true, trim: true },
    description: { type: String },
  },
  { timestamps: true }
);

PatternSchema.index({ userId: 1, slug: 1 }, { unique: true });

export const Pattern: Model<IPattern> = models.Pattern || model<IPattern>("Pattern", PatternSchema);
