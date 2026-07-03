import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { z } from "zod";
import { connectDB } from "@/lib/db/connect";
import { Attempt } from "@/models/Attempt";
import { RevisionLog } from "@/models/RevisionLog";
import { requireUser } from "@/lib/auth/session";
import { withErrorHandling, apiError } from "@/lib/api/handler";

const querySchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/, "month must be YYYY-MM"),
});

export const GET = withErrorHandling(async (req: Request) => {
  const { userId } = requireUser(req);
  const { searchParams } = new URL(req.url);
  const parsed = querySchema.safeParse({ month: searchParams.get("month") });
  if (!parsed.success) return apiError("Invalid or missing ?month=YYYY-MM", 400);

  await connectDB();
  const uid = new Types.ObjectId(userId);

  const [year, month] = parsed.data.month.split("-").map(Number);
  const start = new Date(Date.UTC(year!, month! - 1, 1));
  const end = new Date(Date.UTC(year!, month!, 1));

  const [solvedRows, revisionRows] = await Promise.all([
    Attempt.aggregate([
      { $match: { userId: uid, status: "Solved", attemptedAt: { $gte: start, $lt: end } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$attemptedAt" } }, count: { $sum: 1 } } },
    ]),
    RevisionLog.aggregate([
      { $match: { userId: uid, revisedAt: { $gte: start, $lt: end } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$revisedAt" } }, count: { $sum: 1 } } },
    ]),
  ]);

  const solvedMap = new Map(solvedRows.map((r) => [r._id as string, r.count as number]));
  const revisionMap = new Map(revisionRows.map((r) => [r._id as string, r.count as number]));

  const days: { date: string; solved: number; revisions: number }[] = [];
  const cursor = new Date(start);
  while (cursor < end) {
    const key = cursor.toISOString().slice(0, 10);
    days.push({ date: key, solved: solvedMap.get(key) ?? 0, revisions: revisionMap.get(key) ?? 0 });
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return NextResponse.json({ days });
});
