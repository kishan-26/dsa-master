import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { User } from "@/models/User";
import { loginSchema } from "@/lib/validators/auth";
import { verifyPassword } from "@/lib/auth/password";
import { signAccessToken, signRefreshToken } from "@/lib/auth/jwt";
import { setRefreshCookie } from "@/lib/auth/cookies";
import { withErrorHandling, apiError } from "@/lib/api/handler";
import { rateLimit, getClientKey } from "@/lib/auth/rate-limit";

export const POST = withErrorHandling(async (req: Request) => {
  const key = `login:${getClientKey(req)}`;
  if (!rateLimit(key, { limit: 8, windowMs: 60_000 }).success) {
    return apiError("Too many login attempts. Try again in a minute.", 429);
  }

  const body = loginSchema.parse(await req.json());
  await connectDB();

  const user = await User.findOne({ email: body.email }).select("+passwordHash");
  if (!user || !user.passwordHash) {
    return apiError("Invalid email or password", 401);
  }

  const valid = await verifyPassword(body.password, user.passwordHash);
  if (!valid) return apiError("Invalid email or password", 401);

  const accessToken = signAccessToken({ sub: user.id, email: user.email });
  const refreshToken = signRefreshToken({ sub: user.id, tokenVersion: user.tokenVersion });
  setRefreshCookie(refreshToken);

  return NextResponse.json({
    accessToken,
    user: { id: user.id, name: user.name, email: user.email, avatarUrl: user.avatarUrl },
  });
});
