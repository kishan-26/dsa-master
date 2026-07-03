import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { User } from "@/models/User";
import { requireUser } from "@/lib/auth/session";
import { updateProfileSchema, changePasswordSchema } from "@/lib/validators/auth";
import { verifyPassword, hashPassword } from "@/lib/auth/password";
import { withErrorHandling, apiError } from "@/lib/api/handler";
import { clearRefreshCookie } from "@/lib/auth/cookies";

export const GET = withErrorHandling(async (req: Request) => {
  const { userId } = requireUser(req);
  await connectDB();
  const user = await User.findById(userId);
  if (!user) return apiError("User not found", 404);

  return NextResponse.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
      theme: user.theme,
      accentColor: user.accentColor,
      dailyGoal: user.dailyGoal,
      createdAt: user.createdAt,
    },
  });
});

export const PATCH = withErrorHandling(async (req: Request) => {
  const { userId } = requireUser(req);
  const body = await req.json();
  await connectDB();

  // Password change goes through its own validated branch.
  if (body.currentPassword && body.newPassword) {
    const { currentPassword, newPassword } = changePasswordSchema.parse(body);
    const user = await User.findById(userId).select("+passwordHash");
    if (!user?.passwordHash) return apiError("This account has no password set", 400);

    const valid = await verifyPassword(currentPassword, user.passwordHash);
    if (!valid) return apiError("Current password is incorrect", 401);

    user.passwordHash = await hashPassword(newPassword);
    user.tokenVersion += 1; // log out other sessions on password change
    await user.save();
    clearRefreshCookie();
    return NextResponse.json({ success: true, message: "Password updated. Please log in again." });
  }

  const updates = updateProfileSchema.parse(body);
  const user = await User.findByIdAndUpdate(userId, updates, { new: true });
  if (!user) return apiError("User not found", 404);

  return NextResponse.json({
    user: { id: user.id, name: user.name, email: user.email, avatarUrl: user.avatarUrl, accentColor: user.accentColor },
  });
});

export const DELETE = withErrorHandling(async (req: Request) => {
  const { userId } = requireUser(req);
  await connectDB();
  await User.findByIdAndDelete(userId);
  // NOTE: cascading deletes for Question/Topic/Pattern/Attempt/Mistake/
  // Flashcard/RevisionLog belonging to this user are wired up in Phase 2
  // once those routes exist, so we don't leave orphaned documents.
  clearRefreshCookie();
  return NextResponse.json({ success: true });
});
