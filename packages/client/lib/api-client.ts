import { useCallback } from "react";
import { useAuth } from "@clerk/nextjs";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export async function apiFetch<T>(
  path: string,
  options?: RequestInit & { json?: unknown },
): Promise<T> {
  const { json, ...rest } = options ?? {};
  const url = `${API_URL}${path}`;

  const response = await fetch(url, {
    credentials: "include",
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(rest.headers ?? {}),
    },
    body: json ? JSON.stringify(json) : rest.body,
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    const message = payload?.message ?? "Request failed";
    throw new Error(message);
  }

  return response.json();
}

export function useApiFetch() {
  const { getToken } = useAuth();

  const apiFetchWithAuth = useCallback(
    async function <T>(
      path: string,
      options?: RequestInit & { json?: unknown },
    ): Promise<T> {
      const token = await getToken();
      const { json, ...rest } = options ?? {};
      const url = `${API_URL}${path}`;

      const response = await fetch(url, {
        ...rest,
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
          ...(rest.headers ?? {}),
        },
        body: json ? JSON.stringify(json) : rest.body,
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        const message = payload?.message ?? "Request failed";
        throw new Error(message);
      }

      return response.json();
    },
    [getToken],
  );

  return apiFetchWithAuth;
}
