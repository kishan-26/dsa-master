import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { Pattern } from "@/models/Pattern";
import { Question } from "@/models/Question";
import { requireUser } from "@/lib/auth/session";
import { withErrorHandling, apiError } from "@/lib/api/handler";
import { computePatternStats } from "@/lib/analytics/group-stats";

interface Params {
  params: { slug: string };
}

export const GET = withErrorHandling(async (req: Request, { params }: Params) => {
  const { userId } = requireUser(req);
  await connectDB();

  const pattern = await Pattern.findOne({ userId, slug: params.slug }).lean();
  if (!pattern) return apiError("Pattern not found", 404);

  const [statsMap, questions] = await Promise.all([
    computePatternStats(userId),
    Question.find({ userId, patterns: pattern._id })
      .select("title difficulty status confidence nextRevisionDate leetcodeSlug isFavorite")
      .sort({ updatedAt: -1 })
      .lean(),
  ]);

  const stats = statsMap.get(String(pattern._id));

  return NextResponse.json({
    pattern: {
      ...pattern,
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
