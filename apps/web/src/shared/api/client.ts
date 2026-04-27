import { env } from "@/shared/config/env";

type HttpMethod = "GET" | "POST" | "PATCH" | "DELETE";

type ApiClientOptions<TBody> = {
  method?: HttpMethod;
  body?: TBody;
  token?: string | null;
};

export async function apiClient<TResponse, TBody = unknown>(
  path: string,
  options: ApiClientOptions<TBody> = {},
): Promise<TResponse> {
  const response = await fetch(`${env.apiBaseUrl}${path}`, {
    method: options.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    cache: "no-store",
  });

  if (!response.ok) {
    const message = await response.text();

    throw new Error(message || `Request failed with status ${response.status}`);
  }

  return response.json() as Promise<TResponse>;
}