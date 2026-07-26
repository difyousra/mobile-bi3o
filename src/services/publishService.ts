import { apiClient } from "../api/client";
import { API_BASE_URL, UPLOAD_TIMEOUT_MS } from "../config/api";
import { getAccessToken } from "../api/tokenManager";
import type { Page } from "../types/auth";
import type {
  CreateAnnonceDto,
  LocalPhoto,
  ManagedAnnonce,
  ModerationCheckRequest,
  ModerationCheckResponse,
} from "../types/publish";

function asPage<T>(data: unknown): Page<T> {
  if (data && typeof data === "object" && Array.isArray((data as Page<T>).content)) {
    return data as Page<T>;
  }
  if (Array.isArray(data)) {
    return {
      content: data as T[],
      number: 0,
      size: data.length,
      totalElements: data.length,
      totalPages: 1,
      first: true,
      last: true,
    };
  }
  return {
    content: [],
    number: 0,
    size: 0,
    totalElements: 0,
    totalPages: 0,
    first: true,
    last: true,
  };
}

/** POST /moderation/check */
export async function checkModeration(
  body: ModerationCheckRequest
): Promise<ModerationCheckResponse> {
  const { data, status } = await apiClient.post<ModerationCheckResponse>(
    "/moderation/check",
    body,
    { validateStatus: () => true }
  );
  if (status === 422) {
    return {
      allowed: false,
      reason:
        data?.reason ??
        data?.message ??
        "Cette annonce contient un contenu interdit.",
      score: data?.score,
    };
  }
  if (status >= 200 && status < 300) {
    return {
      allowed: data?.allowed !== false,
      reason: data?.reason,
      score: data?.score,
      message: data?.message,
    };
  }
  return {
    allowed: false,
    reason: data?.message ?? data?.reason ?? `Erreur modération (${status})`,
  };
}

/** POST /annonces/json */
export async function createAnnonceJson(
  dto: CreateAnnonceDto
): Promise<{ id: number } & Record<string, unknown>> {
  const { data } = await apiClient.post("/annonces/json", dto);
  return data as { id: number } & Record<string, unknown>;
}

/**
 * POST /annonces — multipart `dto` + `files`
 * Suit l’exemple React Native de mobile_api.md (FormData + Bearer).
 */
export async function createAnnonceMultipart(
  dto: CreateAnnonceDto,
  images: LocalPhoto[]
): Promise<{ id: number } & Record<string, unknown>> {
  const token = await getAccessToken();
  const form = new FormData();

  form.append("dto", {
    string: JSON.stringify(dto),
    type: "application/json",
    name: "dto.json",
  } as unknown as Blob);

  images.forEach((image, index) => {
    form.append("files", {
      uri: image.uri,
      type: image.mimeType ?? "image/jpeg",
      name: image.fileName ?? `photo-${index}.jpg`,
    } as unknown as Blob);
  });

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), UPLOAD_TIMEOUT_MS);

  try {
    const response = await fetch(`${API_BASE_URL}/annonces`, {
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
      const message =
        data?.message ?? data?.reason ?? `Upload échoué (${response.status})`;
      throw Object.assign(new Error(message), {
        status: response.status,
        data,
      });
    }

    return data as { id: number } & Record<string, unknown>;
  } finally {
    clearTimeout(timer);
  }
}

/** GET /annonces/me/manage */
export async function fetchMyManagedAds(params?: {
  page?: number;
  size?: number;
}): Promise<Page<ManagedAnnonce>> {
  const { data } = await apiClient.get("/annonces/me/manage", {
    params: { page: params?.page ?? 0, size: params?.size ?? 20 },
  });
  return asPage<ManagedAnnonce>(data);
}

/** POST /annonces/{id}/pause */
export async function pauseAnnonce(id: number | string): Promise<void> {
  await apiClient.post(`/annonces/${id}/pause`);
}

/** POST /annonces/{id}/reactivate */
export async function reactivateAnnonce(id: number | string): Promise<void> {
  await apiClient.post(`/annonces/${id}/reactivate`);
}

/** DELETE /annonces/{id} */
export async function deleteAnnonce(id: number | string): Promise<void> {
  await apiClient.delete(`/annonces/${id}`);
}

/** GET /annonces/{id}/performance */
export async function fetchAnnoncePerformance(
  id: number | string
): Promise<unknown> {
  const { data } = await apiClient.get(`/annonces/${id}/performance`);
  return data;
}

/** POST /annonces/{id}/photos — multipart files */
export async function uploadAnnoncePhotos(
  id: number | string,
  images: LocalPhoto[]
): Promise<unknown> {
  const token = await getAccessToken();
  const form = new FormData();
  images.forEach((image, index) => {
    form.append("files", {
      uri: image.uri,
      type: image.mimeType ?? "image/jpeg",
      name: image.fileName ?? `photo-${index}.jpg`,
    } as unknown as Blob);
  });

  const response = await fetch(`${API_BASE_URL}/annonces/${id}/photos`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: form,
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) {
    throw Object.assign(
      new Error(data?.message ?? `Upload photos (${response.status})`),
      { status: response.status, data }
    );
  }
  return data;
}
