import { Types } from "mongoose";
import { connectDB } from "@/lib/db/connect";
import { Question } from "@/models/Question";
import { Attempt } from "@/models/Attempt";
import { RevisionLog } from "@/models/RevisionLog";
import { Mistake } from "@/models/Mistake";

export interface GroupStat {
  id: string;
  totalQuestions: number;
  solvedQuestions: number;
  avgConfidence: number; // 1-5
  revisionDueCount: number;
  lastPracticedAt: Date | null;
  totalAttempts: number;
  solvedAttempts: number;
  avgTimeTakenMinutes: number | null;
  totalRevisions: number;
  revisionSuccessRate: number; // 0-1, weighted: confident=1, struggled=0.5, failed=0
  /** accuracy(0-1) * confidenceNorm(0-1) * revisionSuccessRate(0-1) * 100 */
  masteryScore: number;
  topMistakes: { tag: string; count: number }[];
}

const OUTCOME_WEIGHT: Record<string, number> = { confident: 1, struggled: 0.5, failed: 0 };

/**
 * Computes per-group (topic or pattern) stats by aggregating the Question,
 * Attempt, RevisionLog, and Mistake collections independently, then joining
 * in application code. Mastery score formula (ASSUMPTION, not fully spec'd):
 *   accuracy * confidenceNorm * revisionSuccessRate * 100
 * A group with no attempts/revisions yet defaults those factors to neutral
 * values (1) rather than 0, so a freshly-added topic doesn't show as "0%
 * mastery" before the learner has had a chance to attempt anything.
 */
async function computeGroupStats(
  userId: string,
  groupField: "topic" | "patterns"
): Promise<Map<string, GroupStat>> {
  await connectDB();
  const uid = new Types.ObjectId(userId);
  const now = new Date();

  const questionMatch = { userId: uid };
  const unwind = groupField === "patterns" ? [{ $unwind: "$patterns" }] : [];
  const groupKey = groupField === "patterns" ? "$patterns" : "$topic";

  const [questionStats, attemptStats, revisionStats, mistakeStats] = await Promise.all([
    Question.aggregate([
      { $match: questionMatch },
      ...unwind,
      {
        $group: {
          _id: groupKey,
          totalQuestions: { $sum: 1 },
          solvedQuestions: { $sum: { $cond: [{ $in: ["$status", ["Solved", "Mastered"]] }, 1, 0] } },
          avgConfidence: { $avg: "$confidence" },
          revisionDueCount: {
            $sum: { $cond: [{ $and: ["$nextRevisionDate", { $lte: ["$nextRevisionDate", now] }] }, 1, 0] },
          },
          lastPracticedAt: { $max: "$updatedAt" },
        },
      },
    ]),
    Attempt.aggregate([
      { $match: { userId: uid } },
      groupField === "patterns" ? { $unwind: "$patterns" } : { $match: {} },
      {
        $group: {
          _id: groupField === "patterns" ? "$patterns" : "$topic",
          totalAttempts: { $sum: 1 },
          solvedAttempts: { $sum: { $cond: [{ $eq: ["$status", "Solved"] }, 1, 0] } },
          avgTimeTakenMinutes: { $avg: "$timeTakenMinutes" },
        },
      },
    ]),
    RevisionLog.aggregate([
      { $match: { userId: uid, topic: { $ne: null } } },
      {
        $group: {
          _id: "$topic",
          totalRevisions: { $sum: 1 },
          weightedScore: {
            $sum: {
              $switch: {
                branches: [
                  { case: { $eq: ["$outcome", "confident"] }, then: 1 },
                  { case: { $eq: ["$outcome", "struggled"] }, then: 0.5 },
                ],
                default: 0,
              },
            },
          },
        },
      },
    ]),
    Mistake.aggregate([
      { $match: { userId: uid } },
      groupField === "patterns" ? { $unwind: "$patterns" } : { $match: {} },
      {
        $group: {
          _id: { group: groupField === "patterns" ? "$patterns" : "$topic", tag: "$tag" },
          count: { $sum: 1 },
        },
      },
    ]),
  ]);

  const attemptMap = new Map(attemptStats.map((a) => [String(a._id), a]));
  // RevisionLog is only denormalized with `topic`, not `patterns`, so
  // pattern-level revisionSuccessRate isn't available — patterns default to
  // a neutral rate (see fallback below). This is a known gap, flagged in
  // the README.
  const revisionMap = new Map(revisionStats.map((r) => [String(r._id), r]));

  const mistakeMap = new Map<string, { tag: string; count: number }[]>();
  for (const m of mistakeStats as { _id: { group: Types.ObjectId; tag: string }; count: number }[]) {
    const key = String(m._id.group);
    const list = mistakeMap.get(key) ?? [];
    list.push({ tag: m._id.tag, count: m.count });
    mistakeMap.set(key, list);
  }

  const result = new Map<string, GroupStat>();

  for (const q of questionStats) {
    const id = String(q._id);
    const attempts = attemptMap.get(id);
    const revisions = revisionMap.get(id);

    const accuracy = attempts && attempts.totalAttempts > 0 ? attempts.solvedAttempts / attempts.totalAttempts : 1;
    const confidenceNorm = q.avgConfidence ? q.avgConfidence / 5 : 0.2;
    const revisionSuccessRate =
      revisions && revisions.totalRevisions > 0 ? revisions.weightedScore / revisions.totalRevisions : 1;

    const topMistakes = (mistakeMap.get(id) ?? []).sort((a, b) => b.count - a.count).slice(0, 3);

    result.set(id, {
      id,
      totalQuestions: q.totalQuestions,
      solvedQuestions: q.solvedQuestions,
      avgConfidence: q.avgConfidence ?? 0,
      revisionDueCount: q.revisionDueCount,
      lastPracticedAt: q.lastPracticedAt ?? null,
      totalAttempts: attempts?.totalAttempts ?? 0,
      solvedAttempts: attempts?.solvedAttempts ?? 0,
      avgTimeTakenMinutes: attempts?.avgTimeTakenMinutes ?? null,
      totalRevisions: revisions?.totalRevisions ?? 0,
      revisionSuccessRate,
      masteryScore: Math.round(accuracy * confidenceNorm * revisionSuccessRate * 100),
      topMistakes,
    });
  }

  return result;
}

export function computeTopicStats(userId: string) {
  return computeGroupStats(userId, "topic");
}

export function computePatternStats(userId: string) {
  return computeGroupStats(userId, "patterns");
}
