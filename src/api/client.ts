/**
 * ApiClient Axios — Bearer + refresh rotatif sur 401.
 * Contrats : mobile_api.md §2 · Postman Auth.
 */
import axios, {
  type AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";
import {
  API_BASE_URL,
  CONNECT_TIMEOUT_MS,
  UPLOAD_TIMEOUT_MS,
} from "../config/api";
import type { AuthTokensResponse } from "../types/auth";
import {
  clearSession,
  getAccessToken,
  getRefreshToken,
  saveSession,
} from "./tokenManager";
import { AppApiError, toApiError } from "./errorHandler";

type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

let refreshPromise: Promise<string | null> | null = null;

const AUTH_PUBLIC_PATHS = [
  "/auth/login",
  "/auth/register",
  "/auth/refresh",
  "/auth/oauth/exchange",
  "/auth/resend-otp",
  "/auth/verify-email",
  "/auth/password/forgot",
  "/auth/password/reset",
];

function isPublicAuthPath(url: string | undefined): boolean {
  if (!url) return false;
  return AUTH_PUBLIC_PATHS.some((p) => url.includes(p));
}

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) {
    await clearSession();
    return null;
  }

  try {
    const { data, status } = await axios.post<AuthTokensResponse>(
      `${API_BASE_URL}/auth/refresh`,
      { refreshToken },
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        timeout: CONNECT_TIMEOUT_MS,
        validateStatus: () => true,
      }
    );

    if (status >= 200 && status < 300 && data?.token && data?.refreshToken) {
      await saveSession({
        token: data.token,
        refreshToken: data.refreshToken,
      });
      return data.token;
    }

    await clearSession();
    return null;
  } catch {
    await clearSession();
    return null;
  }
}

function scheduleRefresh(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = refreshAccessToken().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: CONNECT_TIMEOUT_MS,
  /** Évite POST→GET sur 302 nginx (sinon search renvoie « GET not supported »). */
  maxRedirects: 0,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
  validateStatus: (status) => status >= 200 && status < 400,
});

apiClient.interceptors.request.use(async (config) => {
  if (config.data instanceof FormData) {
    config.timeout = UPLOAD_TIMEOUT_MS;
    if (config.headers) {
      delete config.headers["Content-Type"];
    }
  }

  if (!isPublicAuthPath(config.url)) {
    const token = await getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    // 3xx non suivis (maxRedirects: 0) → traiter comme erreur API
    if (response.status >= 300 && response.status < 400) {
      const apiError = toApiError(
        response.status,
        response.data,
        "Redirection serveur (endpoint peut exiger une autre URL / auth edge)."
      );
      return Promise.reject(new AppApiError(apiError, response.data));
    }
    return response;
  },
  async (error: AxiosError) => {
    const original = error.config as RetriableConfig | undefined;
    const status = error.response?.status;

    if (
      status === 401 &&
      original &&
      !original._retry &&
      !isPublicAuthPath(original.url)
    ) {
      original._retry = true;
      const nextToken = await scheduleRefresh();
      if (nextToken) {
        original.headers.Authorization = `Bearer ${nextToken}`;
        return apiClient(original);
      }
    }

    const apiError = toApiError(
      status ?? 500,
      error.response?.data,
      error.message === "Network Error"
        ? "Impossible de joindre le serveur. Vérifiez votre connexion."
        : error.code === "ECONNABORTED"
          ? "Délai dépassé. Le serveur ne répond pas."
          : "Une erreur est survenue."
    );
    return Promise.reject(new AppApiError(apiError, error.response?.data));
  }
);

/** Alias historique pour imports existants. */
export default apiClient;
