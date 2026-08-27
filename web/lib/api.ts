import { getAccessToken } from "./auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

type ApiOptions = RequestInit & {
  authenticated?: boolean;
};

export async function api<T>(
  endpoint: string,
  options: ApiOptions = {},
): Promise<T> {
  const { authenticated = true, headers, ...fetchOptions } = options;

  const token = authenticated ? getAccessToken() : null;

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...fetchOptions,
    headers: {
      "Content-Type": "application/json",

      ...(token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {}),

      ...headers,
    },
  });

  if (!response.ok) {
    let message = "Something went wrong";

    try {
      const error = await response.json();

      if (Array.isArray(error.message)) {
        message = error.message.join(", ");
      } else {
        message = error.message ?? message;
      }
    } catch {
      // Ignore invalid JSON responses
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}
