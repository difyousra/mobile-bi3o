/**
 * AuthService — routes documentées mobile_api.md §2 / Postman « Auth ».
 * Ne pas inventer d’URL.
 */
import { apiClient } from "../api/client";
import { clearSession, getRefreshToken, saveSession } from "../api/tokenManager";
import { AppApiError, userFacingMessage } from "../api/errorHandler";
import type {
  AuthTokensResponse,
  ForgotPasswordRequest,
  LoginRequest,
  MessageResponse,
  OAuthExchangeRequest,
  RegisterRequest,
  ResetPasswordRequest,
  User,
  VerifyEmailRequest,
} from "../types/auth";

export type AuthResult<T> =
  | { ok: true; data: T }
  | { ok: false; statusCode: number; message: string; error?: string };

function fail(error: unknown): AuthResult<never> {
  if (error instanceof AppApiError) {
    return {
      ok: false,
      statusCode: error.status,
      message: userFacingMessage(error),
      error: error.code,
    };
  }
  return {
    ok: false,
    statusCode: 500,
    message: "Une erreur est survenue.",
  };
}

function parseSessionBody(data: AuthTokensResponse): AuthResult<AuthTokensResponse> {
  const statusCode =
    data.statusCode != null ? Number(data.statusCode) : data.token ? 200 : 401;

  if (data.token && data.refreshToken && (statusCode === 200 || !data.statusCode)) {
    return { ok: true, data };
  }

  if (statusCode === 401 || statusCode === 403) {
    return {
      ok: false,
      statusCode,
      message: data.message ?? "Identifiants incorrects.",
      error: data.message ?? data.error,
    };
  }

  if (data.token && data.refreshToken) {
    return { ok: true, data };
  }

  return {
    ok: false,
    statusCode: statusCode || 401,
    message: data.message ?? data.error ?? "Identifiants incorrects.",
    error: data.error ?? data.message,
  };
}

async function persistSession(data: AuthTokensResponse): Promise<void> {
  if (!data.token || !data.refreshToken) {
    throw new Error("SESSION_INCOMPLETE");
  }
  await saveSession({
    token: data.token,
    refreshToken: data.refreshToken,
  });
}

/** POST /auth/login */
export async function login(
  email: string,
  password: string
): Promise<AuthResult<AuthTokensResponse>> {
  try {
    const body: LoginRequest = {
      email: email.trim().toLowerCase(),
      password,
    };
    const { data } = await apiClient.post<AuthTokensResponse>(
      "/auth/login",
      body,
      { validateStatus: () => true }
    );
    const parsed = parseSessionBody(data);
    if (!parsed.ok) return parsed;
    await persistSession(parsed.data);
    return parsed;
  } catch (error) {
    return fail(error);
  }
}

/** POST /auth/refresh */
export async function refresh(
  refreshToken: string
): Promise<AuthResult<AuthTokensResponse>> {
  try {
    const { data } = await apiClient.post<AuthTokensResponse>(
      "/auth/refresh",
      { refreshToken },
      { validateStatus: () => true }
    );
    const parsed = parseSessionBody(data);
    if (!parsed.ok) {
      await clearSession();
      return parsed;
    }
    await persistSession(parsed.data);
    return parsed;
  } catch (error) {
    await clearSession();
    return fail(error);
  }
}

/** POST /auth/oauth/exchange */
export async function oauthExchange(
  code: string
): Promise<AuthResult<AuthTokensResponse>> {
  try {
    const body: OAuthExchangeRequest = { code };
    const { data } = await apiClient.post<AuthTokensResponse>(
      "/auth/oauth/exchange",
      body,
      { validateStatus: () => true }
    );
    const parsed = parseSessionBody(data);
    if (!parsed.ok) return parsed;
    await persistSession(parsed.data);
    return parsed;
  } catch (error) {
    return fail(error);
  }
}

/** POST /auth/register */
export async function register(
  payload: RegisterRequest
): Promise<AuthResult<User>> {
  try {
    const { data } = await apiClient.post<User>("/auth/register", {
      ...payload,
      email: payload.email.trim().toLowerCase(),
    });
    return { ok: true, data };
  } catch (error) {
    return fail(error);
  }
}

/** POST /auth/verify-email */
export async function verifyEmail(
  email: string,
  code: string
): Promise<AuthResult<MessageResponse>> {
  try {
    const body: VerifyEmailRequest = {
      email: email.trim().toLowerCase(),
      code: code.trim(),
    };
    const { data } = await apiClient.post<MessageResponse>(
      "/auth/verify-email",
      body
    );
    return { ok: true, data };
  } catch (error) {
    return fail(error);
  }
}

/** POST /auth/resend-otp */
export async function resendOtp(
  email: string
): Promise<AuthResult<MessageResponse>> {
  try {
    const { data } = await apiClient.post<MessageResponse>("/auth/resend-otp", {
      email: email.trim().toLowerCase(),
    });
    return { ok: true, data };
  } catch (error) {
    return fail(error);
  }
}

/** POST /auth/password/forgot */
export async function forgotPassword(
  email: string
): Promise<AuthResult<MessageResponse>> {
  try {
    const body: ForgotPasswordRequest = {
      email: email.trim().toLowerCase(),
    };
    const { data } = await apiClient.post<MessageResponse>(
      "/auth/password/forgot",
      body
    );
    return { ok: true, data };
  } catch (error) {
    return fail(error);
  }
}

/** POST /auth/password/reset */
export async function resetPassword(
  token: string,
  newPassword: string
): Promise<AuthResult<MessageResponse>> {
  try {
    const body: ResetPasswordRequest = { token, newPassword };
    const { data } = await apiClient.post<MessageResponse>(
      "/auth/password/reset",
      body
    );
    return { ok: true, data };
  } catch (error) {
    return fail(error);
  }
}

/** GET /users/me */
export async function getMe(): Promise<AuthResult<User>> {
  try {
    const { data } = await apiClient.get<User>("/users/me");
    return { ok: true, data };
  } catch (error) {
    return fail(error);
  }
}

/**
 * POST /auth/logout — efface d’abord la session locale (UI réactive),
 * puis notifie l’API (best-effort, ne doit jamais bloquer la déconnexion).
 */
export async function logout(): Promise<void> {
  const refreshToken = await getRefreshToken();
  await clearSession();
  try {
    await apiClient.post(
      "/auth/logout",
      refreshToken ? { refreshToken } : {},
      { validateStatus: () => true, timeout: 5000 }
    );
  } catch {
    // déjà déconnecté localement
  }
}

export function userFromLoginData(
  loginData: AuthTokensResponse | null | undefined
): Partial<User> | null {
  if (!loginData?.email) return null;
  return {
    email: loginData.email,
    nom: loginData.name ?? "",
    role: loginData.role ?? "USER",
    emailValide: true,
    compteActive: true,
    typeCompte: "PARTICULIER",
    prenom: "",
    id: 0,
  };
}

/** Alias legacy tokenStorage path. */
export { clearSession as clearToken, getAccessToken as getToken } from "../api/tokenManager";
