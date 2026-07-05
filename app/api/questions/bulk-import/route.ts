import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { Question } from "@/models/Question";
import { Topic } from "@/models/Topic";
import { Pattern } from "@/models/Pattern";
import { requireUser } from "@/lib/auth/session";
import { bulkImportSchema } from "@/lib/validators/question";
import { slugify } from "@/lib/validators/taxonomy";
import { withErrorHandling } from "@/lib/api/handler";

export const POST = withErrorHandling(async (req: Request) => {
  const { userId } = requireUser(req);
  const { items } = bulkImportSchema.parse(await req.json());
  await connectDB();

  // Load existing topics/patterns/questions once, then resolve everything
  // in memory instead of round-tripping per item (items can be up to 500).
  const [existingTopics, existingPatterns, existingQuestions] = await Promise.all([
    Topic.find({ userId }).lean(),
    Pattern.find({ userId }).lean(),
    Question.find({ userId }).select("leetcodeSlug").lean(),
  ]);

  const topicBySlug = new Map<string, any>(existingTopics.map((t) => [t.slug, t]));
  const patternBySlug = new Map<string, any>(existingPatterns.map((p) => [p.slug, p]));
  const existingSlugs = new Set(existingQuestions.map((q) => q.leetcodeSlug).filter(Boolean));

  const topicsToCreate = new Map<string, string>(); // slug -> name
  const patternsToCreate = new Map<string, string>();

  for (const item of items) {
    const topicSlug = slugify(item.topic);
    if (!topicBySlug.has(topicSlug)) topicsToCreate.set(topicSlug, item.topic);
    for (const patternName of item.patterns) {
      const patternSlug = slugify(patternName);
      if (!patternBySlug.has(patternSlug)) patternsToCreate.set(patternSlug, patternName);
    }
  }

  const [createdTopics, createdPatterns] = await Promise.all([
    topicsToCreate.size
      ? Topic.insertMany(
          Array.from(topicsToCreate.entries()).map(([slug, name]) => ({ userId, name, slug }))
        )
      : Promise.resolve([]),
    patternsToCreate.size
      ? Pattern.insertMany(
          Array.from(patternsToCreate.entries()).map(([slug, name]) => ({ userId, name, slug }))
        )
      : Promise.resolve([]),
  ]);

  for (const t of createdTopics) topicBySlug.set(t.slug, t);
  for (const p of createdPatterns) patternBySlug.set(p.slug, p);

  const toInsert = [];
  let skipped = 0;

  for (const item of items) {
    if (item.leetcodeSlug && existingSlugs.has(item.leetcodeSlug)) {
      skipped++;
      continue;
    }
    const topic = topicBySlug.get(slugify(item.topic));
    if (!topic) {
      skipped++;
      continue;
    }
    const patternIds = item.patterns
      .map((p) => patternBySlug.get(slugify(p))?._id)
      .filter(Boolean);

    toInsert.push({
      userId,
      title: item.title,
      difficulty: item.difficulty,
      topic: topic._id,
      patterns: patternIds,
      platform: "LeetCode",
      leetcodeSlug: item.leetcodeSlug,
    });
    // Prevent duplicate slugs within the same import batch too.
    if (item.leetcodeSlug) existingSlugs.add(item.leetcodeSlug);
  }

  const created = toInsert.length ? await Question.insertMany(toInsert) : [];

  return NextResponse.json({ created: created.length, skipped });
});
