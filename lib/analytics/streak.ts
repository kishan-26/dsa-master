import { Types } from "mongoose";
import { Attempt } from "@/models/Attempt";

function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10); // YYYY-MM-DD in UTC
}

/**
 * Current streak = consecutive days (ending today or yesterday) with at
 * least one Solved attempt. If nothing was solved today, the streak isn't
 * broken until the day fully passes with zero solves — so a streak counted
 * as "still alive" includes yesterday even if nothing's solved yet today.
 */
export async function computeCurrentStreak(userId: string): Promise<number> {
  const uid = new Types.ObjectId(userId);

  const oneYearAgo = new Date();
  oneYearAgo.setDate(oneYearAgo.getDate() - 366);

  const solvedDays = await Attempt.aggregate([
    { $match: { userId: uid, status: "Solved", attemptedAt: { $gte: oneYearAgo } } },
    { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$attemptedAt" } } } },
  ]);

  const daySet = new Set(solvedDays.map((d) => d._id as string));
  if (daySet.size === 0) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Start counting from today if it has a solve, otherwise from yesterday
  // (today not being done yet shouldn't zero out an active streak).
  let cursor = new Date(today);
  if (!daySet.has(toDateKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
    if (!daySet.has(toDateKey(cursor))) return 0;
  }

  let streak = 0;
  while (daySet.has(toDateKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

/**
 * Longest streak ever achieved (for permanent achievements like "30-day
 * streak" that shouldn't un-unlock just because today's streak reset).
 */
export async function computeLongestStreak(userId: string): Promise<number> {
  const uid = new Types.ObjectId(userId);

  const solvedDays = await Attempt.aggregate([
    { $match: { userId: uid, status: "Solved" } },
    { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$attemptedAt" } } } },
    { $sort: { _id: 1 } },
  ]);

  if (solvedDays.length === 0) return 0;

  let longest = 1;
  let current = 1;
  let prev = new Date(solvedDays[0]._id);

  for (let i = 1; i < solvedDays.length; i++) {
    const day = new Date(solvedDays[i]._id);
    const diffDays = Math.round((day.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));
    current = diffDays === 1 ? current + 1 : 1;
    longest = Math.max(longest, current);
    prev = day;
  }

  return longest;
}

export interface HeatmapDay {
  date: string; // YYYY-MM-DD
  count: number;
}

/** Last 365 days of solved-question counts, for the GitHub-style heatmap. */
export async function computeHeatmap(userId: string): Promise<HeatmapDay[]> {
  const uid = new Types.ObjectId(userId);
  const start = new Date();
  start.setDate(start.getDate() - 364);
  start.setHours(0, 0, 0, 0);

  const rows = await Attempt.aggregate([
    { $match: { userId: uid, status: "Solved", attemptedAt: { $gte: start } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$attemptedAt" } },
        count: { $sum: 1 },
      },
    },
  ]);

  const countMap = new Map(rows.map((r) => [r._id as string, r.count as number]));
  const days: HeatmapDay[] = [];
  const cursor = new Date(start);
  const today = new Date();

  while (cursor <= today) {
    const key = toDateKey(cursor);
    days.push({ date: key, count: countMap.get(key) ?? 0 });
    cursor.setDate(cursor.getDate() + 1);
  }

  return days;
}
