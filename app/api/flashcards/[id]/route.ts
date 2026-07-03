import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { connectDB } from "@/lib/db/connect";
import { Flashcard } from "@/models/Flashcard";
import { requireUser } from "@/lib/auth/session";
import { updateFlashcardSchema } from "@/lib/validators/flashcard";
import { withErrorHandling, apiError } from "@/lib/api/handler";
import { sanitizeHtml } from "@/lib/utils/sanitize-html";

interface Params {
  params: { id: string };
}

export const GET = withErrorHandling(async (req: Request, { params }: Params) => {
  const { userId } = requireUser(req);
  if (!Types.ObjectId.isValid(params.id)) return apiError("Invalid flashcard id", 400);
  await connectDB();

  const flashcard = await Flashcard.findOne({ _id: params.id, userId }).populate("topic", "name slug");
  if (!flashcard) return apiError("Flashcard not found", 404);
  return NextResponse.json({ flashcard });
});

export const PATCH = withErrorHandling(async (req: Request, { params }: Params) => {
  const { userId } = requireUser(req);
  if (!Types.ObjectId.isValid(params.id)) return apiError("Invalid flashcard id", 400);
  const body = updateFlashcardSchema.parse(await req.json());
  await connectDB();

  const updates: Record<string, unknown> = {};
  if (body.front !== undefined) updates.front = sanitizeHtml(body.front);
  if (body.back !== undefined) updates.back = sanitizeHtml(body.back);

  const flashcard = await Flashcard.findOneAndUpdate({ _id: params.id, userId }, updates, { new: true });
  if (!flashcard) return apiError("Flashcard not found", 404);
  return NextResponse.json({ flashcard });
});

export const DELETE = withErrorHandling(async (req: Request, { params }: Params) => {
  const { userId } = requireUser(req);
  if (!Types.ObjectId.isValid(params.id)) return apiError("Invalid flashcard id", 400);
  await connectDB();

  const flashcard = await Flashcard.findOneAndDelete({ _id: params.id, userId });
  if (!flashcard) return apiError("Flashcard not found", 404);
  return NextResponse.json({ success: true });
});
