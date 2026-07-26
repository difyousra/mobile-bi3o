import { apiClient } from "../api/client";
import type {
  AdCard,
  PublicAdDetail,
  PublicAdsPage,
  SearchAllAttributesRequest,
} from "../types/catalog";
import type { Page } from "../types/auth";

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

/** GET /annonces/public?page&size&sort */
export async function fetchPublicAds(params?: {
  page?: number;
  size?: number;
  sort?: string;
}): Promise<PublicAdsPage> {
  const page = params?.page ?? 0;
  const size = params?.size ?? 24;
  const sort = params?.sort ?? "id,desc";
  const { data } = await apiClient.get<unknown>("/annonces/public", {
    params: { page, size, sort },
  });
  return asPage<AdCard>(data);
}

/** GET /annonces/public/{id}?maxPhotos=10 */
export async function fetchPublicAd(
  id: number | string,
  maxPhotos = 10
): Promise<PublicAdDetail> {
  const { data } = await apiClient.get<PublicAdDetail>(
    `/annonces/public/${id}`,
    { params: { maxPhotos } }
  );
  return data;
}

/** GET /annonces/by-categorie/{id} */
export async function fetchAdsByCategorie(
  categorieId: number,
  params?: { page?: number; size?: number }
): Promise<PublicAdsPage> {
  const { data } = await apiClient.get<unknown>(
    `/annonces/by-categorie/${categorieId}`,
    {
      params: {
        page: params?.page ?? 0,
        size: params?.size ?? 24,
      },
    }
  );
  return asPage<AdCard>(data);
}

/** GET /annonces/sous-categorie/{id} */
export async function fetchAdsBySousCategorie(
  sousCategorieId: number,
  params?: { page?: number; size?: number }
): Promise<PublicAdsPage> {
  const { data } = await apiClient.get<unknown>(
    `/annonces/sous-categorie/${sousCategorieId}`,
    {
      params: {
        page: params?.page ?? 0,
        size: params?.size ?? 24,
      },
    }
  );
  return asPage<AdCard>(data);
}

/** POST /annonces/search/all-attributes?page&size */
export async function searchAllAttributes(
  body: SearchAllAttributesRequest,
  params?: { page?: number; size?: number }
): Promise<PublicAdsPage> {
  const { data } = await apiClient.post<unknown>(
    "/annonces/search/all-attributes",
    {
      titre: body.titre ?? "",
      categorieIds: body.categorieIds ?? [],
      sousCategorieIds: body.sousCategorieIds ?? [],
      attributs: body.attributs ?? [],
    },
    {
      params: {
        page: params?.page ?? 0,
        size: params?.size ?? 24,
      },
    }
  );
  return asPage<AdCard>(data);
}

/** GET /annonces/suggestions?q&limit */
export async function fetchSuggestions(
  q: string,
  limit = 6
): Promise<unknown> {
  const { data } = await apiClient.get<unknown>("/annonces/suggestions", {
    params: { q, limit },
  });
  return data;
}

/** GET /users/public/{id} */
export async function fetchPublicSeller(sellerId: number): Promise<unknown> {
  const { data } = await apiClient.get(`/users/public/${sellerId}`);
  return data;
}
