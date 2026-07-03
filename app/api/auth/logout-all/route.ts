import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { User } from "@/models/User";
import { requireUser } from "@/lib/auth/session";
import { clearRefreshCookie } from "@/lib/auth/cookies";
import { withErrorHandling } from "@/lib/api/handler";

export const POST = withErrorHandling(async (req: Request) => {
  const { userId } = requireUser(req);
  await connectDB();

  await User.findByIdAndUpdate(userId, { $inc: { tokenVersion: 1 } });
  clearRefreshCookie();

  return NextResponse.json({ success: true });
});
