import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { z } from "zod";
import { connectDB } from "@/lib/db/connect";
import { Flashcard } from "@/models/Flashcard";
import { RevisionLog } from "@/models/RevisionLog";
import { requireUser } from "@/lib/auth/session";
import { withErrorHandling, apiError } from "@/lib/api/handler";
import { computeNextRevision } from "@/lib/srs/engine";
import { REVISION_OUTCOMES } from "@/lib/constants/question";

interface Params {
  params: { id: string };
}

const bodySchema = z.object({ outcome: z.enum(REVISION_OUTCOMES) });

export const POST = withErrorHandling(async (req: Request, { params }: Params) => {
  const { userId } = requireUser(req);
  if (!Types.ObjectId.isValid(params.id)) return apiError("Invalid flashcard id", 400);
  const { outcome } = bodySchema.parse(await req.json());
  await connectDB();

  const flashcard = await Flashcard.findOne({ _id: params.id, userId });
  if (!flashcard) return apiError("Flashcard not found", 404);

  const before = { easeFactor: flashcard.easeFactor, intervalDays: flashcard.intervalDays };
  const wasOnTime = !flashcard.nextRevisionDate || flashcard.nextRevisionDate.getTime() >= Date.now();
  const srs = computeNextRevision(before, outcome);

  flashcard.easeFactor = srs.easeFactor;
  flashcard.intervalDays = srs.intervalDays;
  flashcard.nextRevisionDate = srs.nextRevisionDate;
  await flashcard.save();

  await RevisionLog.create({
    userId,
    flashcard: flashcard._id,
    topic: flashcard.topic,
    outcome,
    intervalDaysBefore: before.intervalDays,
    intervalDaysAfter: srs.intervalDays,
    easeFactorBefore: before.easeFactor,
    easeFactorAfter: srs.easeFactor,
    wasOnTime,
  }).catch((err) => console.error("[flashcard revision log]", err));

  return NextResponse.json({ flashcard });
});
