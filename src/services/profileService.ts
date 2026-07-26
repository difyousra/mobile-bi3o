import { apiClient } from "../api/client";
import { API_BASE_URL, UPLOAD_TIMEOUT_MS } from "../config/api";
import { getAccessToken } from "../api/tokenManager";
import type { User } from "../types/auth";
import type { LocalPhoto } from "../types/publish";

/**
 * Mapping doc : `{ currentPassword?, newPassword }`
 * mobile_api.md : « ancien/nouveau MDP »
 */
export type ChangePasswordRequest = {
  currentPassword?: string;
  newPassword: string;
};

/** PATCH /users/me/password */
export async function changePassword(
  body: ChangePasswordRequest
): Promise<void> {
  await apiClient.patch("/users/me/password", body);
}

/**
 * POST /users/me/avatar — multipart `file` (mobile_api.md §2 / mapping).
 */
export async function uploadAvatar(photo: LocalPhoto): Promise<User | unknown> {
  const token = await getAccessToken();
  const form = new FormData();
  form.append("file", {
    uri: photo.uri,
    type: photo.mimeType ?? "image/jpeg",
    name: photo.fileName ?? "avatar.jpg",
  } as unknown as Blob);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), UPLOAD_TIMEOUT_MS);

  try {
    const response = await fetch(`${API_BASE_URL}/users/me/avatar`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: form,
      signal: controller.signal,
    });

    const text = await response.text();
    const data = text ? JSON.parse(text) : null;
    if (!response.ok) {
      throw Object.assign(
        new Error(data?.message ?? `Upload avatar (${response.status})`),
        { status: response.status, data }
      );
    }
    return data;
  } finally {
    clearTimeout(timer);
  }
}

/** GET /profiles/users/me — profil étendu (mapping Phase 2). */
export async function fetchProfileMe(): Promise<unknown> {
  const { data } = await apiClient.get("/profiles/users/me");
  return data;
}

/**
 * PATCH /profiles/account/{userId}
 * Corps non détaillé Postman — ne passer que les champs édités.
 */
export async function patchAccountProfile(
  userId: number | string,
  body: Record<string, unknown>
): Promise<unknown> {
  const { data } = await apiClient.patch(`/profiles/account/${userId}`, body);
  return data;
}
