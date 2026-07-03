import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { User } from "@/models/User";
import { Question } from "@/models/Question";
import { Topic } from "@/models/Topic";
import { Pattern } from "@/models/Pattern";
import { Flashcard } from "@/models/Flashcard";
import { Attempt } from "@/models/Attempt";
import { Mistake } from "@/models/Mistake";
import { RevisionLog } from "@/models/RevisionLog";
import { requireUser } from "@/lib/auth/session";
import { withErrorHandling, apiError } from "@/lib/api/handler";

export const GET = withErrorHandling(async (req: Request) => {
  const { userId } = requireUser(req);
  await connectDB();

  const user = await User.findById(userId);
  if (!user) return apiError("User not found", 404);

  const [questions, topics, patterns, flashcards, attempts, mistakes, revisionLogs] = await Promise.all([
    Question.find({ userId }).lean(),
    Topic.find({ userId }).lean(),
    Pattern.find({ userId }).lean(),
    Flashcard.find({ userId }).lean(),
    Attempt.find({ userId }).lean(),
    Mistake.find({ userId }).lean(),
    RevisionLog.find({ userId }).lean(),
  ]);

  const exportPayload = {
    exportedAt: new Date().toISOString(),
    profile: {
      name: user.name,
      email: user.email,
      accentColor: user.accentColor,
      theme: user.theme,
      dailyGoal: user.dailyGoal,
      createdAt: user.createdAt,
    },
    questions,
    topics,
    patterns,
    flashcards,
    attempts,
    mistakes,
    revisionLogs,
  };

  return new NextResponse(JSON.stringify(exportPayload, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="dsa-master-export-${new Date().toISOString().slice(0, 10)}.json"`,
    },
  });
});
