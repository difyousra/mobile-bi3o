import { apiClient } from "../api/client";
import type { AdCard } from "../types/catalog";
import type { Page } from "../types/auth";
import type {
  FavoritePage,
  FollowStatus,
  FollowedSellerDto,
  NotificationItem,
  NotificationsPage,
  SavedSearch,
  SavedSearchRaw,
  FollowedSellersPage,
  UnreadCount,
} from "../types/engagement";

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

function extractAdFromFavorite(item: unknown): AdCard | null {
  if (!item || typeof item !== "object") return null;
  const row = item as Record<string, unknown>;
  if (typeof row.id === "number" && typeof row.titre === "string") {
    return row as unknown as AdCard;
  }
  const nested =
    row.annonce ?? row.ad ?? row.listing ?? row.product ?? null;
  if (nested && typeof nested === "object") {
    const ad = nested as Record<string, unknown>;
    if (typeof ad.id === "number") {
      return {
        id: ad.id,
        titre: String(ad.titre ?? ad.title ?? "Annonce"),
        prix: typeof ad.prix === "number" ? ad.prix : undefined,
        ville: typeof ad.ville === "string" ? ad.ville : undefined,
        coverUrl:
          typeof ad.coverUrl === "string"
            ? ad.coverUrl
            : typeof ad.image === "string"
              ? ad.image
              : undefined,
      };
    }
  }
  if (typeof row.annonceId === "number") {
    return {
      id: row.annonceId,
      titre: String(row.titre ?? "Annonce"),
      coverUrl: typeof row.coverUrl === "string" ? row.coverUrl : undefined,
    };
  }
  return null;
}

/** GET /me/favoris */
export async function fetchFavorites(params?: {
  page?: number;
  size?: number;
}): Promise<FavoritePage> {
  const { data } = await apiClient.get<unknown>("/me/favoris", {
    params: { page: params?.page ?? 0, size: params?.size ?? 24 },
  });
  const page = asPage<unknown>(data);
  return {
    ...page,
    content: page.content
      .map(extractAdFromFavorite)
      .filter((ad): ad is AdCard => ad != null),
  };
}

/** POST /me/favoris/{annonceId} */
export async function addFavorite(annonceId: number | string): Promise<void> {
  await apiClient.post(`/me/favoris/${annonceId}`);
}

/** DELETE /me/favoris/{annonceId} */
export async function removeFavorite(annonceId: number | string): Promise<void> {
  await apiClient.delete(`/me/favoris/${annonceId}`);
}

/** POST /users/{sellerId}/follow */
export async function followSeller(sellerId: number | string): Promise<void> {
  await apiClient.post(`/users/${sellerId}/follow`);
}

/** DELETE /users/{sellerId}/follow */
export async function unfollowSeller(sellerId: number | string): Promise<void> {
  await apiClient.delete(`/users/${sellerId}/follow`);
}

/** GET /users/{sellerId}/follow/status */
export async function fetchFollowStatus(
  sellerId: number | string
): Promise<boolean> {
  const { data } = await apiClient.get<FollowStatus>(
    `/users/${sellerId}/follow/status`
  );
  return Boolean(data.following ?? data.isFollowing ?? data.suivi);
}

/** GET /me/notifications */
export async function fetchNotifications(params?: {
  page?: number;
  size?: number;
}): Promise<NotificationsPage> {
  const { data } = await apiClient.get<unknown>("/me/notifications", {
    params: { page: params?.page ?? 0, size: params?.size ?? 20 },
  });
  return asPage<NotificationItem>(data);
}

/** GET /me/notifications/unread-count */
export async function fetchUnreadCount(): Promise<number> {
  const { data } = await apiClient.get<UnreadCount>(
    "/me/notifications/unread-count"
  );
  return Number(data.count ?? data.unreadCount ?? data.total ?? 0);
}

/** PATCH /me/notifications/{id}/read */
export async function markNotificationRead(id: number | string): Promise<void> {
  await apiClient.patch(`/me/notifications/${id}/read`);
}

/** POST /me/notifications/read-all */
export async function markAllNotificationsRead(): Promise<void> {
  await apiClient.post("/me/notifications/read-all");
}

/** GET /me/recherches */
export async function fetchSavedSearches(): Promise<SavedSearch[]> {
  const { data } = await apiClient.get<unknown>("/me/recherches");
  const rows = Array.isArray(data) ? data : asPage<SavedSearchRaw>(data).content;

  return rows
    .map((row: any) => {
      const id = row?.id;
      const name = row?.name ?? row?.label ?? row?.titre;
      const queryJson = row?.queryJson ?? row?.query_json;
      let query: string | undefined;
      if (typeof queryJson === "string" && queryJson.trim()) {
        try {
          const parsed = JSON.parse(queryJson);
          query =
            (typeof parsed?.q === "string" && parsed.q) ||
            (typeof parsed?.search === "string" && parsed.search) ||
            undefined;
          // Normalisation simple: si c’est '?q=Audi', garder 'Audi'
          if (typeof query === "string" && query.startsWith("?q=")) {
            query = query.replace("?q=", "");
          }
        } catch {
          // ignore: on garde query undefined
        }
      }
      return {
        id,
        label: name,
        query,
        createdAt: row?.createdAt,
      } as SavedSearch;
    })
    .filter((s): s is SavedSearch => typeof s?.id === "number");
}

/**
 * GET /users/me/following
 * Used by the "vendeurs" tab in Favorites.
 */
export async function fetchFollowedSellers(params?: {
  page?: number;
  size?: number;
}): Promise<FollowedSellersPage> {
  const { data } = await apiClient.get<unknown>("/users/me/following", {
    params: { page: params?.page ?? 0, size: params?.size ?? 50 },
  });
  return asPage<FollowedSellerDto>(data) as FollowedSellersPage;
}

/**
 * POST /me/recherches
 * Corps minimal aligné sur l’usage recherche (query texte).
 * Si 400 → afficher l’erreur API sans inventer d’autres champs.
 */
export async function createSavedSearch(payload: {
  query: string;
  label?: string;
}): Promise<SavedSearch | unknown> {
  const { data } = await apiClient.post("/me/recherches", payload);
  return data;
}

/** DELETE /me/recherches/{id} */
export async function deleteSavedSearch(id: number | string): Promise<void> {
  await apiClient.delete(`/me/recherches/${id}`);
}
