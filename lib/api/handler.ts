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
      // Validation Error
      if (err instanceof ZodError) {
        console.error("❌ Zod Validation Error");
        console.error(err.flatten());

        return apiError("Validation failed", 422, err.flatten());
      }

      // Unauthorized
      if (err instanceof UnauthorizedError) {
        console.error("❌ Unauthorized Error");
        console.error(err.message);

        return apiError(err.message, 401);
      }

      // Duplicate Email
      if (
        err &&
        typeof err === "object" &&
        "code" in err &&
        (err as any).code === 11000
      ) {
        console.error("❌ Duplicate Email Error");

        return apiError("That email is already registered", 409);
      }

      // Unknown Error
      console.error("======================================");
      console.error("❌ API ERROR START");
      console.error("======================================");
      console.error(err);

      if (err instanceof Error) {
        console.error("Message:", err.message);
        console.error("Stack:");
        console.error(err.stack);
      }

      console.error("======================================");
      console.error("❌ API ERROR END");
      console.error("======================================");

      return apiError("Something went wrong. Please try again.", 500);
    }
  };
}