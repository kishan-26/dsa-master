import { NextResponse } from "next/server";
import { clearRefreshCookie } from "@/lib/auth/cookies";
import { withErrorHandling } from "@/lib/api/handler";

export const POST = withErrorHandling(async () => {
  clearRefreshCookie();
  return NextResponse.json({ success: true });
});
