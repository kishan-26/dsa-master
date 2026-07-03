import { NextResponse } from "next/server";
import { Types, type FilterQuery } from "mongoose";
import { connectDB } from "@/lib/db/connect";
import { Question, type IQuestion } from "@/models/Question";
import { requireUser } from "@/lib/auth/session";
import { createQuestionSchema, questionListQuerySchema } from "@/lib/validators/question";
import { withErrorHandling, apiError } from "@/lib/api/handler";

const SORT_MAP: Record<string, Record<string, 1 | -1>> = {
  newest: { createdAt: -1 },
  oldest: { createdAt: 1 },
  title: { title: 1 },
  difficulty: { difficulty: 1 },
  confidence: { confidence: -1 },
  revisionDue: { nextRevisionDate: 1 },
};

export const GET = withErrorHandling(async (req: Request) => {
  const { userId } = requireUser(req);
  const { searchParams } = new URL(req.url);
  const query = questionListQuerySchema.parse(Object.fromEntries(searchParams));
  await connectDB();

  const filter: FilterQuery<IQuestion> = { userId: new Types.ObjectId(userId) };

  if (query.search) {
    // Case-insensitive substring match across title and tags gives an
    // "instant fuzzy" feel without needing a dedicated search engine —
    // combined with debouncing on the client this reads as live filtering.
    const escaped = query.search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    filter.$or = [
      { title: { $regex: escaped, $options: "i" } },
      { tags: { $regex: escaped, $options: "i" } },
    ];
  }
  if (query.difficulty) filter.difficulty = query.difficulty;
  if (query.status) filter.status = query.status;
  if (query.favorite) filter.isFavorite = true;
  if (query.revisionDue) filter.nextRevisionDate = { $lte: new Date() };
  if (query.topic) filter.topic = new Types.ObjectId(query.topic);
  if (query.pattern) filter.patterns = new Types.ObjectId(query.pattern);

  const skip = (query.page - 1) * query.limit;

  const [items, total] = await Promise.all([
    Question.find(filter)
      .populate("topic", "name slug color")
      .populate("patterns", "name slug")
      .sort(SORT_MAP[query.sort])
      .skip(skip)
      .limit(query.limit)
      .lean(),
    Question.countDocuments(filter),
  ]);

  return NextResponse.json({
    items,
    pagination: { page: query.page, limit: query.limit, total, pages: Math.ceil(total / query.limit) },
  });
});

export const POST = withErrorHandling(async (req: Request) => {
  const { userId } = requireUser(req);
  const body = createQuestionSchema.parse(await req.json());
  await connectDB();

  if (!Types.ObjectId.isValid(body.topic)) return apiError("Invalid topic", 422);

  const question = await Question.create({
    userId,
    title: body.title,
    difficulty: body.difficulty,
    topic: body.topic,
    patterns: body.patterns.filter((p) => Types.ObjectId.isValid(p)),
    platform: body.platform,
    leetcodeId: body.leetcodeId,
    leetcodeSlug: body.leetcodeSlug,
    tags: body.tags,
  });

  return NextResponse.json({ question }, { status: 201 });
});
