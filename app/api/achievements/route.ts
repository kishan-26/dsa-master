import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { connectDB } from "@/lib/db/connect";
import { Question } from "@/models/Question";
import { RevisionLog } from "@/models/RevisionLog";
import { Topic } from "@/models/Topic";
import { requireUser } from "@/lib/auth/session";
import { withErrorHandling } from "@/lib/api/handler";
import { computeLongestStreak } from "@/lib/analytics/streak";
import { computeAchievements, type AchievementStats } from "@/lib/achievements/definitions";

export const GET = withErrorHandling(async (req: Request) => {
  const { userId } = requireUser(req);
  await connectDB();
  const uid = new Types.ObjectId(userId);

  const [totalSolved, onTimeRevisions, longestStreak, solvedByTopic, topics] = await Promise.all([
    Question.countDocuments({ userId: uid, status: { $in: ["Solved", "Mastered"] } }),
    RevisionLog.countDocuments({ userId: uid, wasOnTime: true }),
    computeLongestStreak(userId),
    Question.aggregate([
      { $match: { userId: uid, status: { $in: ["Solved", "Mastered"] } } },
      { $group: { _id: "$topic", count: { $sum: 1 } } },
    ]),
    Topic.find({ userId }).lean(),
  ]);

  const topicNameMap = new Map(topics.map((t) => [String(t._id), t.name.toLowerCase()]));
  const topicSolvedByName = new Map<string, number>();
  for (const row of solvedByTopic) {
    const name = topicNameMap.get(String(row._id));
    if (name) topicSolvedByName.set(name, row.count);
  }

  const stats: AchievementStats = { totalSolved, longestStreak, onTimeRevisions, topicSolvedByName };
  const achievements = computeAchievements(stats);

  return NextResponse.json({ achievements });
});
