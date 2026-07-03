import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { connectDB } from "@/lib/db/connect";
import { User } from "@/models/User";
import { Question } from "@/models/Question";
import { Attempt } from "@/models/Attempt";
import { requireUser } from "@/lib/auth/session";
import { withErrorHandling, apiError } from "@/lib/api/handler";
import { computeCurrentStreak, computeHeatmap } from "@/lib/analytics/streak";
import { computeTopicStats } from "@/lib/analytics/group-stats";
import { Topic } from "@/models/Topic";

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export const GET = withErrorHandling(async (req: Request) => {
  const { userId } = requireUser(req);
  await connectDB();
  const uid = new Types.ObjectId(userId);

  const user = await User.findById(userId);
  if (!user) return apiError("User not found", 404);

  const now = new Date();
  const today = startOfDay(now);
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

  const [
    solvedTodayCount,
    revisionDueCount,
    totalSolved,
    weeklyRows,
    streak,
    heatmap,
    topicStatsMap,
    topics,
  ] = await Promise.all([
    Attempt.countDocuments({ userId: uid, status: "Solved", attemptedAt: { $gte: today } }),
    Question.countDocuments({ userId: uid, nextRevisionDate: { $lte: now } }),
    Question.countDocuments({ userId: uid, status: { $in: ["Solved", "Mastered"] } }),
    Attempt.aggregate([
      { $match: { userId: uid, status: "Solved", attemptedAt: { $gte: sevenDaysAgo } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$attemptedAt" } }, count: { $sum: 1 } } },
    ]),
    computeCurrentStreak(userId),
    computeHeatmap(userId),
    computeTopicStats(userId),
    Topic.find({ userId }).lean(),
  ]);

  // Fill in the last 7 days so the chart always has 7 points even on quiet days.
  const weeklyMap = new Map(weeklyRows.map((r) => [r._id as string, r.count as number]));
  const weeklyTrend: { date: string; count: number }[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(sevenDaysAgo);
    d.setDate(d.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    weeklyTrend.push({ date: key, count: weeklyMap.get(key) ?? 0 });
  }

  const topicNameMap = new Map(topics.map((t) => [String(t._id), { name: t.name, slug: t.slug }]));
  const rankedTopics = Array.from(topicStatsMap.values())
    .filter((t) => t.totalQuestions > 0)
    .map((t) => ({ ...t, name: topicNameMap.get(t.id)?.name ?? "Unknown", slug: topicNameMap.get(t.id)?.slug ?? "" }))
    .sort((a, b) => b.masteryScore - a.masteryScore);

  return NextResponse.json({
    dailyGoal: user.dailyGoal,
    solvedToday: solvedTodayCount,
    revisionDueCount,
    totalSolved,
    currentStreak: streak,
    weeklyTrend,
    heatmap,
    strongTopics: rankedTopics.slice(0, 3),
    weakTopics: rankedTopics.slice(-3).reverse(),
  });
});
