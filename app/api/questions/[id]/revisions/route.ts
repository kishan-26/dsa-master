import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { z } from "zod";
import { connectDB } from "@/lib/db/connect";
import { Question, REVISION_OUTCOMES } from "@/models/Question";
import { RevisionLog } from "@/models/RevisionLog";
import { requireUser } from "@/lib/auth/session";
import { withErrorHandling, apiError } from "@/lib/api/handler";
import { computeNextRevision } from "@/lib/srs/engine";

interface Params {
  params: { id: string };
}

const bodySchema = z.object({ outcome: z.enum(REVISION_OUTCOMES) });

export const POST = withErrorHandling(async (req: Request, { params }: Params) => {
  const { userId } = requireUser(req);
  if (!Types.ObjectId.isValid(params.id)) return apiError("Invalid question id", 400);
  const { outcome } = bodySchema.parse(await req.json());
  await connectDB();

  const question = await Question.findOne({ _id: params.id, userId });
  if (!question) return apiError("Question not found", 404);

  const before = { easeFactor: question.easeFactor, intervalDays: question.intervalDays };
  const wasOnTime = !question.nextRevisionDate || question.nextRevisionDate.getTime() >= Date.now();
  const srs = computeNextRevision(before, outcome);

  question.revisionHistory.push({
    revisedAt: new Date(),
    outcome,
    intervalDaysBefore: before.intervalDays,
    intervalDaysAfter: srs.intervalDays,
    easeFactorBefore: before.easeFactor,
    easeFactorAfter: srs.easeFactor,
  } as any);

  question.easeFactor = srs.easeFactor;
  question.intervalDays = srs.intervalDays;
  question.nextRevisionDate = srs.nextRevisionDate;
  question.confidence = outcome === "confident" ? Math.min(5, question.confidence + 1) : outcome === "failed" ? Math.max(1, question.confidence - 1) : question.confidence;

  await question.save();

  await RevisionLog.create({
    userId,
    question: question._id,
    topic: question.topic,
    outcome,
    intervalDaysBefore: before.intervalDays,
    intervalDaysAfter: srs.intervalDays,
    easeFactorBefore: before.easeFactor,
    easeFactorAfter: srs.easeFactor,
    wasOnTime,
  }).catch((err) => console.error("[revision log denorm]", err));

  return NextResponse.json({ question });
});
