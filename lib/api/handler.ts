import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { UnauthorizedError } from "@/lib/auth/session";

export function apiError(message: string, status = 400, details?: unknown) {
  return NextResponse.json({ error: message, details }, { status });
}

/**
 * Wraps a route handler so every thrown error becomes a consistent JSON
 * response instead of an unhandled 500 with a stack trace leaking to the
 * client.
 */
export function withErrorHandling<T extends (req: Request, ctx: any) => Promise<Response>>(
  handler: T
) {
  return async (req: Request, ctx: any): Promise<Response> => {
    try {
      return await handler(req, ctx);
    } catch (err) {
      if (err instanceof ZodError) {
        return apiError("Validation failed", 422, err.flatten());
      }
      if (err instanceof UnauthorizedError) {
        return apiError(err.message, 401);
      }
      if (err && typeof err === "object" && "code" in err && (err as any).code === 11000) {
        return apiError("That email is already registered", 409);
      }
      console.error("[api error]", err);
      return apiError("Something went wrong. Please try again.", 500);
    }
  };
}
