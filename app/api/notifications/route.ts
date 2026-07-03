import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { connectDB } from "@/lib/db/connect";
import { User } from "@/models/User";
import { Question } from "@/models/Question";
import { Attempt } from "@/models/Attempt";
import { requireUser } from "@/lib/auth/session";
import { withErrorHandling, apiError } from "@/lib/api/handler";

export interface NotificationItem {
  id: string;
  type: "revision_due" | "daily_goal" | "missed_goal";
  message: string;
  severity: "info" | "warning";
}

export const GET = withErrorHandling(async (req: Request) => {
  const { userId } = requireUser(req);
  await connectDB();
  const uid = new Types.ObjectId(userId);

  const user = await User.findById(userId);
  if (!user) return apiError("User not found", 404);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const [revisionDueCount, solvedToday, solvedYesterday] = await Promise.all([
    Question.countDocuments({ userId: uid, nextRevisionDate: { $lte: new Date() } }),
    Attempt.countDocuments({ userId: uid, status: "Solved", attemptedAt: { $gte: today } }),
    Attempt.countDocuments({ userId: uid, status: "Solved", attemptedAt: { $gte: yesterday, $lt: today } }),
  ]);

  // These are computed fresh on every request rather than stored/pushed —
  // there's no background job or push/email service wired up (flagged in
  // the README), so "reminders" here mean "what's true right now."
  const notifications: NotificationItem[] = [];

  if (revisionDueCount > 0) {
    notifications.push({
      id: "revision_due",
      type: "revision_due",
      message: `${revisionDueCount} revision${revisionDueCount === 1 ? "" : "s"} due today`,
      severity: "info",
    });
  }

  if (solvedToday < user.dailyGoal.questions) {
    notifications.push({
      id: "daily_goal",
      type: "daily_goal",
      message: `${solvedToday}/${user.dailyGoal.questions} questions solved today — keep going`,
      severity: "info",
    });
  }

  if (solvedYesterday === 0 && today.getTime() - user.createdAt.getTime() > 24 * 60 * 60 * 1000) {
    notifications.push({
      id: "missed_goal",
      type: "missed_goal",
      message: "No questions solved yesterday — your streak needs today's solve",
      severity: "warning",
    });
  }

  return NextResponse.json({ notifications });
});
