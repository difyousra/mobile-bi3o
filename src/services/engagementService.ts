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

/** GET /me/recherches — charge toutes les pages. */
export async function fetchSavedSearches(): Promise<SavedSearch[]> {
  const pageSize = 100;
  const all: SavedSearch[] = [];
  let page = 0;
  let totalPages = 1;

  while (page < totalPages && page < 20) {
    const { data } = await apiClient.get<unknown>("/me/recherches", {
      params: { page, size: pageSize, sort: "updatedAt,desc" },
    });

    const rows = Array.isArray(data)
      ? data
      : asPage<SavedSearchRaw>(data).content;
    const mapped = rows
      .map((row: any) => {
        const idNum = Number(row?.id);
        if (!Number.isFinite(idNum)) return null;

        const name = String(row?.name ?? row?.label ?? row?.titre ?? "").trim();
        const queryJson = row?.queryJson ?? row?.query_json;
        let query: string | undefined;
        let filters: Record<string, unknown> | undefined;

        if (typeof queryJson === "string" && queryJson.trim()) {
          try {
            const parsed = JSON.parse(queryJson);
            if (parsed && typeof parsed === "object") {
              filters = parsed as Record<string, unknown>;
              query =
                (typeof parsed.q === "string" && parsed.q) ||
                (typeof parsed.search === "string" && parsed.search) ||
                (typeof parsed.query === "string" && parsed.query) ||
                undefined;
              if (typeof query === "string" && query.startsWith("?q=")) {
                query = decodeURIComponent(query.replace(/^\?q=/, ""));
              }
            }
          } catch {
            query = queryJson;
          }
        } else if (queryJson && typeof queryJson === "object") {
          filters = queryJson as Record<string, unknown>;
          query =
            (typeof (queryJson as any).q === "string" &&
              (queryJson as any).q) ||
            undefined;
        }

        return {
          id: idNum,
          label: name || query || `Recherche #${idNum}`,
          query: query || name || "",
          queryJson: typeof queryJson === "string" ? queryJson : undefined,
          filters,
          createdAt: row?.createdAt ?? row?.updatedAt,
        } as SavedSearch;
      })
      .filter((s): s is SavedSearch => s != null);

    all.push(...mapped);

    if (Array.isArray(data)) {
      break;
    }
    const p = asPage<SavedSearchRaw>(data);
    totalPages = Math.max(1, Number(p.totalPages) || 1);
    if (mapped.length === 0) break;
    page += 1;
  }

  // Déduplique par id (sécurité pagination).
  const byId = new Map<number, SavedSearch>();
  for (const s of all) byId.set(s.id, s);
  return [...byId.values()];
}

/**
 * POST /me/recherches
 * Corps backend : { name, queryJson } (pas query/label).
 */
export async function createSavedSearch(payload: {
  query: string;
  label?: string;
  filters?: Record<string, unknown>;
}): Promise<SavedSearch | unknown> {
  const q = String(payload.query ?? "").trim();
  const name = String(payload.label ?? q).trim().slice(0, 80);
  const queryJson = JSON.stringify({
    q,
    ...(payload.filters && typeof payload.filters === "object"
      ? payload.filters
      : {}),
  });

  const { data } = await apiClient.post("/me/recherches", {
    name: name || "Recherche",
    queryJson,
  });
  return data;
}

/**
 * GET /users/me/following — onglet « Mes vendeurs » (toutes les pages).
 */
export async function fetchFollowedSellers(params?: {
  page?: number;
  size?: number;
}): Promise<FollowedSellersPage> {
  const pageSize = params?.size ?? 100;
  const all: FollowedSellerDto[] = [];
  let page = params?.page ?? 0;
  let totalPages = 1;
  let lastPageMeta: ReturnType<typeof asPage<FollowedSellerDto>> | null = null;

  // Si un page précis est demandé, une seule page.
  const singlePage = params?.page != null;

  while (page < totalPages && page < 20) {
    const { data } = await apiClient.get<unknown>("/users/me/following", {
      params: { page, size: pageSize, sort: "createdAt,desc" },
    });
    const p = asPage<FollowedSellerDto>(data);
    lastPageMeta = p;
    const mapped = p.content
      .map((row) => {
        if (!row || typeof row !== "object") return null;
        const id = Number(
          (row as FollowedSellerDto).id ??
            (row as { userId?: number }).userId ??
            (row as { sellerId?: number }).sellerId
        );
        if (!Number.isFinite(id) || id <= 0) return null;
        return { ...(row as FollowedSellerDto), id };
      })
      .filter((s): s is FollowedSellerDto => s != null);
    all.push(...mapped);
    totalPages = Math.max(1, Number(p.totalPages) || 1);
    if (singlePage || mapped.length === 0) break;
    page += 1;
  }

  const byId = new Map<number, FollowedSellerDto>();
  for (const s of all) byId.set(s.id, s);
  const content = [...byId.values()];

  return {
    content,
    number: 0,
    size: content.length,
    totalElements: content.length,
    totalPages: 1,
    first: true,
    last: true,
    ...(lastPageMeta
      ? {
          totalElements: Number(lastPageMeta.totalElements) || content.length,
        }
      : {}),
  } as FollowedSellersPage;
}

/** DELETE /me/recherches/{id} */
export async function deleteSavedSearch(id: number | string): Promise<void> {
  await apiClient.delete(`/me/recherches/${id}`);
}
