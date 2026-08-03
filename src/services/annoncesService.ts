import { apiClient } from "../api/client";
import type {
  AdCard,
  PublicAdDetail,
  PublicAdStats,
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
  const payload: Record<string, unknown> = {
    titre: body.titre ?? "",
    attributs: body.attributs ?? [],
  };
  // Singuliers requis par AnnonceSearchRequest (filtre dispo saisonnière inclus)
  if (body.categorieId != null) payload.categorieId = body.categorieId;
  if (body.sousCategorieId != null) payload.sousCategorieId = body.sousCategorieId;
  if (body.prixMin != null) payload.prixMin = body.prixMin;
  if (body.prixMax != null) payload.prixMax = body.prixMax;
  if (body.type) payload.type = body.type;
  if (body.disponibiliteDateArrivee) {
    payload.disponibiliteDateArrivee = body.disponibiliteDateArrivee;
  }
  if (body.disponibiliteDateDepart) {
    payload.disponibiliteDateDepart = body.disponibiliteDateDepart;
  }

  const { data } = await apiClient.post<unknown>(
    "/annonces/search/all-attributes",
    payload,
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

/** GET /annonces/public/{id}/stats — favorisCount, vues (public, sans JWT) */
export async function fetchPublicAdStats(id: number | string): Promise<PublicAdStats> {
  const { data } = await apiClient.get<PublicAdStats>(`/annonces/public/${id}/stats`);
  return data ?? {};
}

/** GET /annonces/public/users/{userId}?page&size — annonces d'un vendeur */
export async function fetchSellerPublicAds(
  userId: number | string,
  params?: { page?: number; size?: number }
): Promise<PublicAdsPage> {
  const { data } = await apiClient.get<unknown>(
    `/annonces/public/users/${userId}`,
    { params: { page: params?.page ?? 0, size: params?.size ?? 6 } }
  );
  return asPage<AdCard>(data);
}

/** POST /annonces/{id}/signalements — signaler une annonce (JWT) */
export async function signalAnnonce(
  id: number | string,
  reason: string
): Promise<void> {
  await apiClient.post(`/annonces/${id}/signalements`, { raison: reason });
}

/**
 * Annonces similaires — cascade comme le web :
 * 1. sous-catégorie → 2. catégorie → 3. catalogue public
 */
export async function fetchSimilarAds(options: {
  sousCategorieId?: number | null;
  categorieId?: number | null;
  excludeId?: number | string;
  size?: number;
}): Promise<PublicAdsPage> {
  const size = options.size ?? 8;
  let page: PublicAdsPage;

  try {
    if (options.sousCategorieId) {
      const { data } = await apiClient.get<unknown>(
        `/annonces/sous-categorie/${options.sousCategorieId}`,
        { params: { page: 0, size: size + 1, sort: "id,desc" } }
      );
      page = asPage<AdCard>(data);
    } else if (options.categorieId) {
      const { data } = await apiClient.get<unknown>(
        `/annonces/public/by-categorie/${options.categorieId}`,
        { params: { page: 0, size: size + 1, sort: "createdAt,desc" } }
      );
      page = asPage<AdCard>(data);
    } else {
      const { data } = await apiClient.get<unknown>("/annonces/public", {
        params: { page: 0, size: size + 1, sort: "createdAt,desc" },
      });
      page = asPage<AdCard>(data);
    }
  } catch {
    return asPage<AdCard>([]);
  }

  const filtered = (page.content ?? []).filter(
    (ad) => String(ad.id) !== String(options.excludeId)
  );

  return { ...page, content: filtered.slice(0, size) };
}

/** GET /annonces/public/{id}/whatsapp-click — tracking clic WhatsApp */
export async function recordWhatsappClick(id: number | string): Promise<void> {
  try {
    await apiClient.get(`/annonces/public/${id}/whatsapp-click`);
  } catch {
    // tracking — on ignore les erreurs silencieusement
  }
}
