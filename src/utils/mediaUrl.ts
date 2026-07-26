import { API_BASE_URL } from "../config/api";

/** Résout `/uploads/...` contre l’origine API (mobile_api.md). */
export function resolveMediaUrl(
  path: string | null | undefined
): string | undefined {
  if (!path) return undefined;
  if (/^https?:\/\//i.test(path)) return path;
  const origin = API_BASE_URL.replace(/\/api\/?$/, "");
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${origin}${normalized}`;
}

export function getApiOrigin(): string {
  return API_BASE_URL.replace(/\/api\/?$/, "");
}
