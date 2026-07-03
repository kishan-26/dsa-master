import { useAuthStore } from "@/store/auth-store";

export class ApiError extends Error {
  status: number;
  details?: unknown;
  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

async function refreshAccessToken(): Promise<string | null> {
  const res = await fetch("/api/auth/refresh", { method: "POST", credentials: "include" });
  if (!res.ok) return null;
  const data = await res.json();
  useAuthStore.getState().setSession(data.user, data.accessToken);
  return data.accessToken as string;
}

interface ApiFetchOptions extends RequestInit {
  skipAuthRetry?: boolean;
}

/**
 * Central fetch wrapper for all authenticated API calls. On a 401 it makes
 * one attempt to refresh the access token (via the httpOnly refresh
 * cookie) and retries the original request before giving up.
 */
export async function apiFetch<T = unknown>(
  url: string,
  options: ApiFetchOptions = {}
): Promise<T> {
  const { accessToken } = useAuthStore.getState();

  const doFetch = async (token: string | null) => {
    return fetch(url, {
      ...options,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });
  };

  let res = await doFetch(accessToken);

  if (res.status === 401 && !options.skipAuthRetry) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      res = await doFetch(newToken);
    } else {
      useAuthStore.getState().clearSession();
    }
  }

  const contentType = res.headers.get("content-type");
  const body = contentType?.includes("application/json") ? await res.json() : null;

  if (!res.ok) {
    throw new ApiError(body?.error ?? "Request failed", res.status, body?.details);
  }

  return body as T;
}
