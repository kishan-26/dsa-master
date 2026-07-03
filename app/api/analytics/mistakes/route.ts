import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { connectDB } from "@/lib/db/connect";
import { Mistake } from "@/models/Mistake";
import { requireUser } from "@/lib/auth/session";
import { withErrorHandling } from "@/lib/api/handler";

export const GET = withErrorHandling(async (req: Request) => {
  const { userId } = requireUser(req);
  const { searchParams } = new URL(req.url);
  const topic = searchParams.get("topic");
  const pattern = searchParams.get("pattern");

  await connectDB();
  const uid = new Types.ObjectId(userId);

  const match: Record<string, unknown> = { userId: uid };
  if (topic && Types.ObjectId.isValid(topic)) match.topic = new Types.ObjectId(topic);
  if (pattern && Types.ObjectId.isValid(pattern)) match.patterns = new Types.ObjectId(pattern);

  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 89);
  ninetyDaysAgo.setHours(0, 0, 0, 0);

  const [mostCommon, trend, total] = await Promise.all([
    Mistake.aggregate([
      { $match: match },
      { $group: { _id: "$tag", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
    Mistake.aggregate([
      { $match: { ...match, loggedAt: { $gte: ninetyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$loggedAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    Mistake.countDocuments(match),
  ]);

  return NextResponse.json({
    total,
    mostCommon: mostCommon.map((m) => ({ tag: m._id, count: m.count })),
    trend: trend.map((t) => ({ date: t._id, count: t.count })),
  });
});
