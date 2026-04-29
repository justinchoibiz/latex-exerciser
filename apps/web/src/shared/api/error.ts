export type ApiErrorPayload = {
  detail?: unknown;
  message?: unknown;
};

type FastApiValidationDetail = {
  msg?: string;
  loc?: Array<string | number>;
  type?: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isValidationDetailArray(value: unknown): value is FastApiValidationDetail[] {
  return (
    Array.isArray(value) &&
    value.every((item) => typeof item === "object" && item !== null)
  );
}

function formatValidationDetail(details: FastApiValidationDetail[]) {
  const messages = details
    .map((detail) => {
      const path = detail.loc?.join(".");
      const message = detail.msg ?? "Validation error";

      return path ? `${path}: ${message}` : message;
    })
    .filter(Boolean);

  if (messages.length === 0) {
    return "Validation error.";
  }

  return messages.join(" ");
}

export class ApiError extends Error {
  status: number;
  payload: unknown;

  constructor({
    status,
    message,
    payload,
  }: {
    status: number;
    message: string;
    payload: unknown;
  }) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

export function parseApiErrorMessage(payload: unknown, fallbackMessage: string) {
  if (!isRecord(payload)) {
    return fallbackMessage;
  }

  const detail = payload.detail;
  const message = payload.message;

  if (typeof detail === "string" && detail.trim()) {
    return detail;
  }

  if (isValidationDetailArray(detail)) {
    return formatValidationDetail(detail);
  }

  if (typeof message === "string" && message.trim()) {
    return message;
  }

  return fallbackMessage;
}

export function getErrorMessage(error: unknown, fallbackMessage: string) {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallbackMessage;
}