import { NextResponse } from "next/server";
import crypto from "crypto";
import { connectDB } from "@/lib/db/connect";
import { User } from "@/models/User";
import { forgotPasswordSchema } from "@/lib/validators/auth";
import { hashToken } from "@/lib/auth/password";
import { withErrorHandling, apiError } from "@/lib/api/handler";
import { rateLimit, getClientKey } from "@/lib/auth/rate-limit";

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

export const POST = withErrorHandling(async (req: Request) => {
  const key = `forgot-password:${getClientKey(req)}`;
  if (!rateLimit(key, { limit: 5, windowMs: 60_000 }).success) {
    return apiError("Too many requests. Try again in a minute.", 429);
  }

  const { email } = forgotPasswordSchema.parse(await req.json());
  await connectDB();

  const user = await User.findOne({ email });

  // Always return success even if the user doesn't exist, so this endpoint
  // can't be used to enumerate registered emails.
  if (user) {
    const rawToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordTokenHash = await hashToken(rawToken);
    user.resetPasswordExpiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);
    await user.save();

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/reset-password?token=${rawToken}&email=${encodeURIComponent(
      email
    )}`;

    // FLAGGED FOR YOU: no transactional email provider is wired up yet.
    // This MVP logs the reset link server-side instead of emailing it.
    // To send real emails, add Resend (or similar) here — e.g.
    //   await resend.emails.send({ to: email, subject: "Reset your password", html: ... })
    console.log(`[password-reset] ${email} -> ${resetUrl}`);
  }

  return NextResponse.json({
    success: true,
    message: "If that email is registered, a reset link has been generated.",
  });
});
