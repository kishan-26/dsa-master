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
  console.log("🚀 Signup request received");

  const key = `signup:${getClientKey(req)}`;
  console.log("📌 Client Key:", key);

  const result = rateLimit(key, { limit: 5, windowMs: 60_000 });

  if (!result.success) {
    console.log("❌ Rate limit exceeded");
    return apiError("Too many signup attempts. Try again in a minute.", 429);
  }

  console.log("✅ Rate limit passed");

  console.log("📥 Reading request body...");
  const body = signupSchema.parse(await req.json());

  console.log("✅ Body parsed:", {
    name: body.name,
    email: body.email,
  });

  console.log("🔌 Connecting to MongoDB...");
  await connectDB();
  console.log("✅ MongoDB connected");

  console.log("🔍 Checking existing user...");
  const existing = await User.findOne({ email: body.email });

  if (existing) {
    console.log("❌ User already exists");
    return apiError("That email is already registered", 409);
  }

  console.log("🔒 Hashing password...");
  const passwordHash = await hashPassword(body.password);
  console.log("✅ Password hashed");

  console.log("👤 Creating user...");
  const user = await User.create({
    name: body.name,
    email: body.email,
    passwordHash,
  });

  console.log("✅ User created:", user.email);

  console.log("🎫 Generating Access Token...");
  const accessToken = signAccessToken({
    sub: user.id,
    email: user.email,
  });

  console.log("🎫 Generating Refresh Token...");
  const refreshToken = signRefreshToken({
    sub: user.id,
    tokenVersion: user.tokenVersion,
  });

  console.log("🍪 Setting refresh cookie...");
  setRefreshCookie(refreshToken);

  console.log("🍪 Cookie set");
  console.log("🎉 Signup completed successfully");

  return NextResponse.json({
    accessToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
    },
  });
});