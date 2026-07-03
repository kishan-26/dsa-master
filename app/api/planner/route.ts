import { NextResponse } from "next/server";
import { z } from "zod";
import { Types } from "mongoose";
import { connectDB } from "@/lib/db/connect";
import { User } from "@/models/User";
import { Attempt } from "@/models/Attempt";
import { RevisionLog } from "@/models/RevisionLog";
import { requireUser } from "@/lib/auth/session";
import { withErrorHandling, apiError } from "@/lib/api/handler";

const goalSchema = z.object({
  questions: z.number().min(0).max(50),
  revisions: z.number().min(0).max(100),
  studyMinutes: z.number().min(0).max(1440),
});

export const GET = withErrorHandling(async (req: Request) => {
  const { userId } = requireUser(req);
  await connectDB();
  const uid = new Types.ObjectId(userId);

  const user = await User.findById(userId);
  if (!user) return apiError("User not found", 404);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [solvedToday, revisionsToday, studyMinutesAgg] = await Promise.all([
    Attempt.countDocuments({ userId: uid, status: "Solved", attemptedAt: { $gte: today } }),
    RevisionLog.countDocuments({ userId: uid, revisedAt: { $gte: today } }),
    Attempt.aggregate([
      { $match: { userId: uid, attemptedAt: { $gte: today }, timeTakenMinutes: { $ne: null } } },
      { $group: { _id: null, total: { $sum: "$timeTakenMinutes" } } },
    ]),
  ]);

  return NextResponse.json({
    goal: user.dailyGoal,
    progress: {
      questions: solvedToday,
      revisions: revisionsToday,
      studyMinutes: studyMinutesAgg[0]?.total ?? 0,
    },
  });
});

export const PATCH = withErrorHandling(async (req: Request) => {
  const { userId } = requireUser(req);
  const body = goalSchema.parse(await req.json());
  await connectDB();

  const user = await User.findByIdAndUpdate(userId, { dailyGoal: body }, { new: true });
  if (!user) return apiError("User not found", 404);

  return NextResponse.json({ goal: user.dailyGoal });
});
