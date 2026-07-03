import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { Pattern } from "@/models/Pattern";
import { requireUser } from "@/lib/auth/session";
import { createPatternSchema, slugify } from "@/lib/validators/taxonomy";
import { withErrorHandling } from "@/lib/api/handler";
import { computePatternStats } from "@/lib/analytics/group-stats";

export const GET = withErrorHandling(async (req: Request) => {
  const { userId } = requireUser(req);
  const { searchParams } = new URL(req.url);
  const sort = searchParams.get("sort");

  await connectDB();

  const [patterns, statsMap] = await Promise.all([
    Pattern.find({ userId }).sort({ name: 1 }).lean(),
    computePatternStats(userId),
  ]);

  let enriched = patterns.map((p) => {
    const stats = statsMap.get(String(p._id));
    return {
      ...p,
      total: stats?.totalQuestions ?? 0,
      solved: stats?.solvedQuestions ?? 0,
      revisionDueCount: stats?.revisionDueCount ?? 0,
      avgConfidence: stats?.avgConfidence ?? 0,
      avgTimeTakenMinutes: stats?.avgTimeTakenMinutes ?? null,
      masteryScore: stats?.masteryScore ?? 0,
      lastPracticedAt: stats?.lastPracticedAt ?? null,
    };
  });

  if (sort === "neglected") {
    enriched = enriched.sort((a, b) => {
      const aTime = a.lastPracticedAt ? new Date(a.lastPracticedAt).getTime() : 0;
      const bTime = b.lastPracticedAt ? new Date(b.lastPracticedAt).getTime() : 0;
      return aTime - bTime;
    });
  }

  return NextResponse.json({ patterns: enriched });
});

export const POST = withErrorHandling(async (req: Request) => {
  const { userId } = requireUser(req);
  const body = createPatternSchema.parse(await req.json());
  await connectDB();

  const slug = slugify(body.name);
  const existing = await Pattern.findOne({ userId, slug });
  if (existing) return NextResponse.json({ pattern: existing });

  const pattern = await Pattern.create({ userId, name: body.name, slug, description: body.description });
  return NextResponse.json({ pattern }, { status: 201 });
});
