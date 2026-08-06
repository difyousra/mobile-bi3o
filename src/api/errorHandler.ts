import type { ApiError } from "../types/auth";
import i18n from "../i18n";

export class AppApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly path?: string;
  readonly raw?: unknown;

  constructor(error: ApiError, raw?: unknown) {
    super(error.message || i18n.t("mobile.errors.generic"));
    this.name = "AppApiError";
    this.status = error.status;
    this.code = error.error;
    this.path = error.path;
    this.raw = raw;
  }
}

export function isApiError(value: unknown): value is ApiError {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return typeof v.message === "string" || typeof v.status === "number";
}

export function toApiError(
  status: number,
  data: unknown,
  fallbackMessage: string
): ApiError {
  if (isApiError(data)) {
    return {
      status: typeof data.status === "number" ? data.status : status,
      error:
        typeof data.error === "string"
          ? data.error
          : status === 401
            ? "UNAUTHORIZED"
            : "ERROR",
      message:
        typeof data.message === "string" ? data.message : fallbackMessage,
      path: typeof data.path === "string" ? data.path : undefined,
      timestamp:
        typeof data.timestamp === "string" ? data.timestamp : undefined,
    };
  }
  return {
    status,
    error: status === 401 ? "UNAUTHORIZED" : "ERROR",
    message: fallbackMessage,
  };
}

/** Messages UX pour codes documentés (mobile_api.md §3). */
export function userFacingMessage(error: AppApiError | ApiError): string {
  const status = "status" in error ? error.status : 500;
  const message = error.message;

  switch (status) {
    case 400:
      return message || i18n.t("mobile.errors.badRequest");
    case 401:
      return message || i18n.t("mobile.errors.unauthorized");
    case 403:
      return message || i18n.t("mobile.errors.forbidden");
    case 404:
      return message || i18n.t("mobile.errors.notFound");
    case 409:
      return message || i18n.t("mobile.errors.conflict");
    case 413:
      return message || i18n.t("mobile.errors.payloadTooLarge");
    case 422:
      return message || i18n.t("mobile.errors.moderationRejected");
    case 429:
      return i18n.t("mobile.errors.tooManyRequests");
    case 500:
    case 502:
    case 503:
      return i18n.t("mobile.errors.serverUnavailable");
    default:
      return message || i18n.t("mobile.errors.generic");
  }
}
