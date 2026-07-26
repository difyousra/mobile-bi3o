import type { ApiError } from "../types/auth";

export class AppApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly path?: string;
  readonly raw?: unknown;

  constructor(error: ApiError, raw?: unknown) {
    super(error.message || "Une erreur est survenue.");
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
      return message || "Requête invalide.";
    case 401:
      return message || "Authentification requise.";
    case 403:
      return message || "Accès refusé.";
    case 404:
      return message || "Ressource introuvable.";
    case 409:
      return message || "Conflit.";
    case 413:
      return message || "Fichier trop volumineux.";
    case 422:
      return message || "Contenu refusé par la modération.";
    case 429:
      return "Trop de requêtes. Réessayez plus tard.";
    case 500:
    case 502:
    case 503:
      return "Serveur indisponible. Réessayez plus tard.";
    default:
      return message || "Une erreur est survenue.";
  }
}
