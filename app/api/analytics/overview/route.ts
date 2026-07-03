import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { connectDB } from "@/lib/db/connect";
import { Question } from "@/models/Question";
import { Attempt } from "@/models/Attempt";
import { RevisionLog } from "@/models/RevisionLog";
import { Topic } from "@/models/Topic";
import { requireUser } from "@/lib/auth/session";
import { withErrorHandling } from "@/lib/api/handler";
import { computeTopicStats } from "@/lib/analytics/group-stats";

export const GET = withErrorHandling(async (req: Request) => {
  const { userId } = requireUser(req);
  await connectDB();
  const uid = new Types.ObjectId(userId);

  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 89);
  ninetyDaysAgo.setHours(0, 0, 0, 0);

  const [
    questionsPerTopic,
    difficultyDistribution,
    dailySolvedTrend,
    avgSolveTimeAgg,
    revisionOutcomeAgg,
    confidenceOverTimeAgg,
    topicStatsMap,
    topics,
  ] = await Promise.all([
    Question.aggregate([
      { $match: { userId: uid } },
      { $group: { _id: "$topic", count: { $sum: 1 } } },
      { $lookup: { from: "topics", localField: "_id", foreignField: "_id", as: "topic" } },
      { $unwind: "$topic" },
      { $project: { _id: 0, topic: "$topic.name", count: 1 } },
    ]),
    Question.aggregate([
      { $match: { userId: uid } },
      { $group: { _id: "$difficulty", count: { $sum: 1 } } },
    ]),
    Attempt.aggregate([
      { $match: { userId: uid, status: "Solved", attemptedAt: { $gte: ninetyDaysAgo } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$attemptedAt" } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
    Attempt.aggregate([
      { $match: { userId: uid, timeTakenMinutes: { $ne: null } } },
      { $group: { _id: null, avg: { $avg: "$timeTakenMinutes" } } },
    ]),
    RevisionLog.aggregate([
      { $match: { userId: uid } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          onTime: { $sum: { $cond: ["$wasOnTime", 1, 0] } },
        },
      },
    ]),
    // Confidence over time: average Question.confidence as of each day,
    // approximated via revision log entries (each revision nudges
    // confidence) bucketed by day.
    RevisionLog.aggregate([
      { $match: { userId: uid, revisedAt: { $gte: ninetyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$revisedAt" } },
          avgEase: { $avg: "$easeFactorAfter" },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    computeTopicStats(userId),
    Topic.find({ userId }).lean(),
  ]);

  const topicNameMap = new Map(topics.map((t) => [String(t._id), t.name]));
  const topicMastery = Array.from(topicStatsMap.values())
    .filter((t) => t.totalQuestions > 0)
    .map((t) => ({
      topic: topicNameMap.get(t.id) ?? "Unknown",
      masteryScore: t.masteryScore,
      solvedQuestions: t.solvedQuestions,
      totalQuestions: t.totalQuestions,
    }))
    .sort((a, b) => b.masteryScore - a.masteryScore);

  // Consistency: how many of the last 90 days had at least one solve.
  const activeDays = new Set(dailySolvedTrend.map((d) => d._id as string));
  const consistencyPct = Math.round((activeDays.size / 90) * 100);

  return NextResponse.json({
    questionsPerTopic,
    difficultyDistribution: difficultyDistribution.map((d) => ({ difficulty: d._id, count: d.count })),
    dailySolvedTrend: dailySolvedTrend.map((d) => ({ date: d._id, count: d.count })),
    avgSolveTimeMinutes: avgSolveTimeAgg[0]?.avg ? Math.round(avgSolveTimeAgg[0].avg) : null,
    revisionCompletionRate: revisionOutcomeAgg[0]
      ? Math.round((revisionOutcomeAgg[0].onTime / revisionOutcomeAgg[0].total) * 100)
      : null,
    confidenceOverTime: confidenceOverTimeAgg.map((d) => ({ date: d._id, avgEase: Number(d.avgEase.toFixed(2)) })),
    topicMastery,
    consistencyPct,
  });
});
