import { Schema, model, models, type Document, type Model, Types } from "mongoose";

export interface ITopic extends Document {
  userId: Types.ObjectId;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TopicSchema = new Schema<ITopic>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, lowercase: true, trim: true },
    description: { type: String },
    color: { type: String },
  },
  { timestamps: true }
);

TopicSchema.index({ userId: 1, slug: 1 }, { unique: true });

export const Topic: Model<ITopic> = models.Topic || model<ITopic>("Topic", TopicSchema);
