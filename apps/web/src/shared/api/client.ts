import { ApiError, parseApiErrorMessage } from "@/shared/api/error";
import { env } from "@/shared/config/env";

type HttpMethod = "GET" | "POST" | "PATCH" | "DELETE";

type ApiClientOptions<TBody> = {
  method?: HttpMethod;
  body?: TBody;
  token?: string | null;
};

async function readJsonSafely(response: Response) {
  const contentType = response.headers.get("content-type");

  if (!contentType?.includes("application/json")) {
    return null;
  }

  try {
    return await response.json();
  } catch {
    return null;
  }
}

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

  const payload = await readJsonSafely(response);

  if (!response.ok) {
    const fallbackMessage = `Request failed with status ${response.status}`;
    const message = parseApiErrorMessage(payload, fallbackMessage);

    throw new ApiError({
      status: response.status,
      message,
      payload,
    });
  }

  return payload as TResponse;
}