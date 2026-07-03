import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { Topic } from "@/models/Topic";
import { requireUser } from "@/lib/auth/session";
import { createTopicSchema, slugify } from "@/lib/validators/taxonomy";
import { withErrorHandling } from "@/lib/api/handler";
import { computeTopicStats } from "@/lib/analytics/group-stats";

export const GET = withErrorHandling(async (req: Request) => {
  const { userId } = requireUser(req);
  const { searchParams } = new URL(req.url);
  const sort = searchParams.get("sort"); // "neglected" | null

  await connectDB();

  const [topics, statsMap] = await Promise.all([
    Topic.find({ userId }).sort({ name: 1 }).lean(),
    computeTopicStats(userId),
  ]);

  let enriched = topics.map((t) => {
    const stats = statsMap.get(String(t._id));
    return {
      ...t,
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
      return aTime - bTime; // oldest last-practiced first
    });
  }

  return NextResponse.json({ topics: enriched });
});

export const POST = withErrorHandling(async (req: Request) => {
  const { userId } = requireUser(req);
  const body = createTopicSchema.parse(await req.json());
  await connectDB();

  const slug = slugify(body.name);
  const existing = await Topic.findOne({ userId, slug });
  if (existing) return NextResponse.json({ topic: existing });

  const topic = await Topic.create({ userId, name: body.name, slug, description: body.description, color: body.color });
  return NextResponse.json({ topic }, { status: 201 });
});
