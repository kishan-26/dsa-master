import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { User } from "@/models/User";
import { verifyRefreshToken, signAccessToken } from "@/lib/auth/jwt";
import { getRefreshCookie, clearRefreshCookie } from "@/lib/auth/cookies";
import { withErrorHandling, apiError } from "@/lib/api/handler";

export const POST = withErrorHandling(async () => {
  const refreshToken = getRefreshCookie();
  if (!refreshToken) return apiError("Not authenticated", 401);

  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    clearRefreshCookie();
    return apiError("Session expired, please log in again", 401);
  }

  await connectDB();
  const user = await User.findById(payload.sub);

  // tokenVersion mismatch means the user hit "logout all devices" or
  // changed their password since this refresh token was issued.
  if (!user || user.tokenVersion !== payload.tokenVersion) {
    clearRefreshCookie();
    return apiError("Session expired, please log in again", 401);
  }

  const accessToken = signAccessToken({ sub: user.id, email: user.email });

  return NextResponse.json({
    accessToken,
    user: { id: user.id, name: user.name, email: user.email, avatarUrl: user.avatarUrl },
  });
});
