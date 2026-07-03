import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { connectDB } from "@/lib/db/connect";
import { Question } from "@/models/Question";
import { Attempt } from "@/models/Attempt";
import { Mistake } from "@/models/Mistake";
import { requireUser } from "@/lib/auth/session";
import { logAttemptSchema } from "@/lib/validators/question";
import { withErrorHandling, apiError } from "@/lib/api/handler";
import { computeNextRevision } from "@/lib/srs/engine";

interface Params {
  params: { id: string };
}

export const POST = withErrorHandling(async (req: Request, { params }: Params) => {
  const { userId } = requireUser(req);
  if (!Types.ObjectId.isValid(params.id)) return apiError("Invalid question id", 400);
  const body = logAttemptSchema.parse(await req.json());
  await connectDB();

  const question = await Question.findOne({ _id: params.id, userId });
  if (!question) return apiError("Question not found", 404);

  const wasNeverSolved = !question.attempts.some((a) => a.status === "Solved");
  const attemptedAt = new Date();

  question.attempts.push({
    attemptedAt,
    status: body.status,
    timeTakenMinutes: body.timeTakenMinutes,
    mistakes: body.mistakes,
    notes: body.notes,
  } as any);

  if (body.mistakes.length) {
    question.mistakes = Array.from(new Set([...question.mistakes, ...body.mistakes]));
  }

  // First-ever solve: kick off the spaced repetition schedule at Day 1 and
  // bump status. Subsequent attempts don't touch the SRS schedule — that
  // only moves via the dedicated /revisions endpoint (Phase 3).
  if (body.status === "Solved") {
    question.status = question.status === "Mastered" ? "Mastered" : "Solved";
    if (wasNeverSolved) {
      const srs = computeNextRevision(
        { easeFactor: question.easeFactor, intervalDays: question.intervalDays },
        "confident",
        { isFirstSolve: true }
      );
      question.easeFactor = srs.easeFactor;
      question.intervalDays = srs.intervalDays;
      question.nextRevisionDate = srs.nextRevisionDate;
    }
  } else if (question.status === "Not Started") {
    question.status = "Attempted";
  }

  await question.save();

  // Denormalized writes for analytics — best-effort, don't block the
  // response if either fails (the embedded copies above are the source of
  // truth for the detail page).
  await Attempt.create({
    userId,
    question: question._id,
    topic: question.topic,
    patterns: question.patterns,
    status: body.status,
    timeTakenMinutes: body.timeTakenMinutes,
    mistakes: body.mistakes,
    attemptedAt,
  }).catch((err) => console.error("[attempt denorm]", err));

  if (body.mistakes.length) {
    await Mistake.insertMany(
      body.mistakes.map((tag) => ({
        userId,
        question: question._id,
        topic: question.topic,
        patterns: question.patterns,
        tag,
        loggedAt: attemptedAt,
      }))
    ).catch((err) => console.error("[mistake denorm]", err));
  }

  return NextResponse.json({ question });
});
