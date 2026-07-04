import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { User } from "@/models/User";
import { signupSchema } from "@/lib/validators/auth";
import { hashPassword } from "@/lib/auth/password";
import { signAccessToken, signRefreshToken } from "@/lib/auth/jwt";
import { setRefreshCookie } from "@/lib/auth/cookies";
import { withErrorHandling, apiError } from "@/lib/api/handler";
import { rateLimit, getClientKey } from "@/lib/auth/rate-limit";

export const POST = withErrorHandling(async (req: Request) => {
  const key = `signup:${getClientKey(req)}`;
  if (!rateLimit(key, { limit: 5, windowMs: 60_000 }).success) {
    return apiError("Too many signup attempts. Try again in a minute.", 429);
  }

  const body = signupSchema.parse(await req.json());
  await connectDB();

  const existing = await User.findOne({ email: body.email });
  if (existing) return apiError("That email is already registered", 409);

  const passwordHash = await hashPassword(body.password);
  const user = await User.create({
    name: body.name,
    email: body.email,
    passwordHash,
  });

  const accessToken = signAccessToken({ sub: user.id, email: user.email });
  const refreshToken = signRefreshToken({ sub: user.id, tokenVersion: user.tokenVersion });
  setRefreshCookie(refreshToken);

  return NextResponse.json({
    accessToken,
    user: { id: user.id, name: user.name, email: user.email, avatarUrl: user.avatarUrl },
  });
});
