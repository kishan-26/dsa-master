import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { Topic } from "@/models/Topic";
import { Question } from "@/models/Question";
import { requireUser } from "@/lib/auth/session";
import { withErrorHandling, apiError } from "@/lib/api/handler";
import { computeTopicStats } from "@/lib/analytics/group-stats";

interface Params {
  params: { slug: string };
}

export const GET = withErrorHandling(async (req: Request, { params }: Params) => {
  const { userId } = requireUser(req);
  await connectDB();

  const topic = await Topic.findOne({ userId, slug: params.slug }).lean();
  if (!topic) return apiError("Topic not found", 404);

  const [statsMap, questions] = await Promise.all([
    computeTopicStats(userId),
    Question.find({ userId, topic: topic._id })
      .select("title difficulty status confidence nextRevisionDate leetcodeSlug isFavorite")
      .sort({ updatedAt: -1 })
      .lean(),
  ]);

  const stats = statsMap.get(String(topic._id));

  return NextResponse.json({
    topic: {
      ...topic,
      total: stats?.totalQuestions ?? 0,
      solved: stats?.solvedQuestions ?? 0,
      revisionDueCount: stats?.revisionDueCount ?? 0,
      avgConfidence: stats?.avgConfidence ?? 0,
      avgTimeTakenMinutes: stats?.avgTimeTakenMinutes ?? null,
      masteryScore: stats?.masteryScore ?? 0,
      lastPracticedAt: stats?.lastPracticedAt ?? null,
      weakAreas: stats?.topMistakes ?? [],
    },
    questions,
  });
});
