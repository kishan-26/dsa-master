import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { User } from "@/models/User";
import { resetPasswordSchema } from "@/lib/validators/auth";
import { hashPassword, verifyToken } from "@/lib/auth/password";
import { withErrorHandling, apiError } from "@/lib/api/handler";
import { z } from "zod";

// token here is `${rawToken}` — email is included separately since we don't
// index on the raw token (only its hash is stored).
const bodySchema = resetPasswordSchema.extend({ email: z.string().email() });

export const POST = withErrorHandling(async (req: Request) => {
  const { token, email, password } = bodySchema.parse(await req.json());
  await connectDB();

  const user = await User.findOne({ email }).select(
    "+resetPasswordTokenHash +resetPasswordExpiresAt"
  );

  if (
    !user ||
    !user.resetPasswordTokenHash ||
    !user.resetPasswordExpiresAt ||
    user.resetPasswordExpiresAt.getTime() < Date.now()
  ) {
    return apiError("This reset link is invalid or has expired.", 400);
  }

  const valid = await verifyToken(token, user.resetPasswordTokenHash);
  if (!valid) return apiError("This reset link is invalid or has expired.", 400);

  user.passwordHash = await hashPassword(password);
  user.resetPasswordTokenHash = undefined;
  user.resetPasswordExpiresAt = undefined;
  // Invalidate all existing sessions since the password changed.
  user.tokenVersion += 1;
  await user.save();

  return NextResponse.json({ success: true });
});
