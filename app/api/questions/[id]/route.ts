import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { connectDB } from "@/lib/db/connect";
import { Question } from "@/models/Question";
import { requireUser } from "@/lib/auth/session";
import { updateQuestionSchema } from "@/lib/validators/question";
import { withErrorHandling, apiError } from "@/lib/api/handler";
import { sanitizeHtml } from "@/lib/utils/sanitize-html";

interface Params {
  params: { id: string };
}

export const GET = withErrorHandling(async (req: Request, { params }: Params) => {
  const { userId } = requireUser(req);
  if (!Types.ObjectId.isValid(params.id)) return apiError("Invalid question id", 400);
  await connectDB();

  const question = await Question.findOne({ _id: params.id, userId })
    .populate("topic", "name slug color")
    .populate("patterns", "name slug");

  if (!question) return apiError("Question not found", 404);
  return NextResponse.json({ question });
});

export const PATCH = withErrorHandling(async (req: Request, { params }: Params) => {
  const { userId } = requireUser(req);
  if (!Types.ObjectId.isValid(params.id)) return apiError("Invalid question id", 400);
  const body = updateQuestionSchema.parse(await req.json());
  if (body.notes !== undefined) body.notes = sanitizeHtml(body.notes);
  if (body.editorialNotes !== undefined) body.editorialNotes = sanitizeHtml(body.editorialNotes);
  await connectDB();

  const question = await Question.findOneAndUpdate({ _id: params.id, userId }, body, {
    new: true,
  })
    .populate("topic", "name slug color")
    .populate("patterns", "name slug");

  if (!question) return apiError("Question not found", 404);
  return NextResponse.json({ question });
});

export const DELETE = withErrorHandling(async (req: Request, { params }: Params) => {
  const { userId } = requireUser(req);
  if (!Types.ObjectId.isValid(params.id)) return apiError("Invalid question id", 400);
  await connectDB();

  const question = await Question.findOneAndDelete({ _id: params.id, userId });
  if (!question) return apiError("Question not found", 404);
  return NextResponse.json({ success: true });
});
