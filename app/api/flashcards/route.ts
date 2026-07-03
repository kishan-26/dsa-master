import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { connectDB } from "@/lib/db/connect";
import { Flashcard } from "@/models/Flashcard";
import { Question } from "@/models/Question";
import { requireUser } from "@/lib/auth/session";
import { createFlashcardSchema } from "@/lib/validators/flashcard";
import { withErrorHandling, apiError } from "@/lib/api/handler";
import { sanitizeHtml } from "@/lib/utils/sanitize-html";

export const GET = withErrorHandling(async (req: Request) => {
  const { userId } = requireUser(req);
  const { searchParams } = new URL(req.url);
  const due = searchParams.get("due") === "true";

  await connectDB();

  const filter: Record<string, unknown> = { userId };
  if (due) filter.nextRevisionDate = { $lte: new Date() };

  const flashcards = await Flashcard.find(filter)
    .populate("topic", "name slug")
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json({ flashcards });
});

export const POST = withErrorHandling(async (req: Request) => {
  const { userId } = requireUser(req);
  const body = createFlashcardSchema.parse(await req.json());
  await connectDB();

  if (!Types.ObjectId.isValid(body.question)) return apiError("Invalid question id", 422);
  const question = await Question.findOne({ _id: body.question, userId });
  if (!question) return apiError("Question not found", 404);

  const flashcard = await Flashcard.create({
    userId,
    question: question._id,
    topic: question.topic,
    front: sanitizeHtml(body.front),
    back: sanitizeHtml(body.back),
    // New flashcards start due immediately so they show up in today's queue.
    nextRevisionDate: new Date(),
  });

  return NextResponse.json({ flashcard }, { status: 201 });
});
