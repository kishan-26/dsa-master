import { Schema, model, models, type Document, type Model } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash?: string; // absent for OAuth-only accounts
  avatarUrl?: string;
  googleId?: string;
  emailVerified: boolean;
  // Incremented on "logout all devices" / password change to invalidate all
  // previously-issued refresh tokens (embedded as a claim in the JWT).
  tokenVersion: number;
  resetPasswordTokenHash?: string;
  resetPasswordExpiresAt?: Date;
  accentColor: string;
  theme: "dark" | "light";
  dailyGoal: {
    questions: number;
    revisions: number;
    studyMinutes: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: { type: String, select: false },
    avatarUrl: { type: String },
    googleId: { type: String, index: true, sparse: true },
    emailVerified: { type: Boolean, default: false },
    tokenVersion: { type: Number, default: 0 },
    resetPasswordTokenHash: { type: String, select: false },
    resetPasswordExpiresAt: { type: Date, select: false },
    accentColor: { type: String, default: "indigo-violet" },
    theme: { type: String, enum: ["dark", "light"], default: "dark" },
    dailyGoal: {
      questions: { type: Number, default: 3 },
      revisions: { type: Number, default: 5 },
      studyMinutes: { type: Number, default: 60 },
    },
  },
  { timestamps: true }
);

export const User: Model<IUser> = models.User || model<IUser>("User", UserSchema);
