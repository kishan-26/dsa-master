import { verifyAccessToken } from "./jwt";

export class UnauthorizedError extends Error {
  constructor(message = "Unauthorized") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

/**
 * Extracts and verifies the access token from the Authorization header.
 * Throws UnauthorizedError if missing/invalid/expired — callers should
 * catch this and return a 401 (see lib/api/handler.ts).
 */
export function requireUser(req: Request): { userId: string; email: string } {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    throw new UnauthorizedError("Missing access token");
  }

  const token = authHeader.slice("Bearer ".length);

  try {
    const payload = verifyAccessToken(token);
    return { userId: payload.sub, email: payload.email };
  } catch {
    throw new UnauthorizedError("Invalid or expired access token");
  }
}
