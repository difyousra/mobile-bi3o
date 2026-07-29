import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../api/queryKeys";
import * as taxoService from "../services/taxoService";
import * as annoncesService from "../services/annoncesService";
import * as exchangeService from "../services/exchangeService";
import {
  flattenCategoryTree,
  mapAdCardToUi,
  mapPublicAdToUi,
} from "../models/adMapper";
import type { AdCard, PublicAdsPage } from "../types/catalog";

const STALE_TAXO_MS = 30 * 60 * 1000;
const STALE_ADS_MS = 5 * 60 * 1000;

function filterByTitre(page: PublicAdsPage, titre: string): PublicAdsPage {
  const q = titre.trim().toLowerCase();
  if (!q) return page;
  const content = (page.content ?? []).filter((ad) =>
    String(ad.titre ?? "")
      .toLowerCase()
      .includes(q)
  );
  return {
    ...page,
    content,
    totalElements: content.length,
    number: 0,
    size: content.length,
    totalPages: 1,
    first: true,
    last: true,
  };
}

/**
 * Recherche catalogue :
 * 1) tente POST /annonces/search/all-attributes (Postman)
 * 2) si 302/erreur edge → fallback GET by-categorie | sous-categorie | public + filtre titre local
 */
async function searchCatalog(options: {
  titre: string;
  page: number;
  size: number;
  categorieId?: number | null;
  sousCategorieId?: number | null;
  attributs?: object[];
  prixMin?: number | null;
  prixMax?: number | null;
  type?: string | null;
}): Promise<PublicAdsPage> {
  const { titre, page, size, categorieId, sousCategorieId, attributs = [], prixMin, prixMax, type } = options;
  const trimmed = titre.trim();

  try {
    const body: Record<string, unknown> = {
      titre: trimmed,
      categorieIds: categorieId ? [categorieId] : [],
      sousCategorieIds: sousCategorieId ? [sousCategorieId] : [],
      attributs,
    };
    if (prixMin) body.prixMin = prixMin;
    if (prixMax) body.prixMax = prixMax;
    if (type) body.type = type;

    const remote = await annoncesService.searchAllAttributes(body as Parameters<typeof annoncesService.searchAllAttributes>[0], { page, size });
    return remote;
  } catch {
    // Nginx préprod renvoie souvent 302→dev-login sur search/suggestions.
  }

  let base: PublicAdsPage;
  if (sousCategorieId) {
    base = await annoncesService.fetchAdsBySousCategorie(sousCategorieId, {
      page,
      size,
    });
  } else if (categorieId) {
    base = await annoncesService.fetchAdsByCategorie(categorieId, {
      page,
      size,
    });
  } else {
    base = await annoncesService.fetchPublicAds({ page, size: Math.max(size, 48) });
  }

  return filterByTitre(base, trimmed);
}

export function useCategoriesTree() {
  return useQuery({
    queryKey: queryKeys.taxoTree,
    queryFn: taxoService.fetchCategoriesTree,
    staleTime: STALE_TAXO_MS,
  });
}

export function useSousCategories() {
  return useQuery({
    queryKey: queryKeys.sousCategories,
    queryFn: taxoService.fetchSousCategories,
    staleTime: STALE_TAXO_MS,
  });
}

export function useCategoryChips() {
  const query = useCategoriesTree();
  const chips = flattenCategoryTree(query.data);
  return { ...query, chips };
}

export function useExchangeRate() {
  return useQuery({
    queryKey: queryKeys.exchange,
    queryFn: exchangeService.fetchExchangeCurrent,
    staleTime: STALE_TAXO_MS,
  });
}

export function usePublicAds(options?: {
  page?: number;
  size?: number;
  categorieId?: number | "all";
  sousCategorieId?: number | null;
}) {
  const page = options?.page ?? 0;
  const size = options?.size ?? 24;
  const categorieId = options?.categorieId ?? "all";
  const sousCategorieId = options?.sousCategorieId ?? null;
  const eurToDzd = exchangeService.extractEurToDzd(useExchangeRate().data);

  const query = useQuery({
    queryKey: [
      ...queryKeys.publicAds(
        page,
        size,
        sousCategorieId
          ? (`sc-${sousCategorieId}` as unknown as number)
          : categorieId
      ),
      sousCategorieId ?? "none",
    ],
    queryFn: () => {
      if (sousCategorieId) {
        return annoncesService.fetchAdsBySousCategorie(sousCategorieId, {
          page,
          size,
        });
      }
      if (categorieId !== "all" && typeof categorieId === "number" && !Number.isNaN(categorieId)) {
        return annoncesService.fetchAdsByCategorie(categorieId, { page, size });
      }
      return annoncesService.fetchPublicAds({ page, size });
    },
    staleTime: STALE_ADS_MS,
  });

  const products =
    query.data?.content.map((ad: AdCard) => mapAdCardToUi(ad, { eurToDzd })) ??
    [];

  return { ...query, products, pageData: query.data };
}

export function usePublicAd(id: number | string | undefined) {
  const eurToDzd = exchangeService.extractEurToDzd(useExchangeRate().data);

  const query = useQuery({
    queryKey: queryKeys.adPublic(id ?? "none"),
    queryFn: () => annoncesService.fetchPublicAd(id as string | number),
    enabled:
      id != null && String(id).length > 0 && !String(id).startsWith("draft-"),
    staleTime: STALE_ADS_MS,
  });

  const product = query.data
    ? mapPublicAdToUi(query.data, { eurToDzd })
    : undefined;

  return { ...query, product };
}

export function useSearchAds(
  titre: string,
  page = 0,
  size = 24,
  options?: {
    categorieId?: number | null;
    sousCategorieId?: number | null;
    attributs?: object[];
    prixMin?: number | null;
    prixMax?: number | null;
    type?: string | null;
  }
) {
  const trimmed = titre.trim();
  const categorieId = options?.categorieId ?? null;
  const sousCategorieId = options?.sousCategorieId ?? null;
  const attributs = options?.attributs ?? [];
  const prixMin = options?.prixMin ?? null;
  const prixMax = options?.prixMax ?? null;
  const type = options?.type ?? null;
  const eurToDzd = exchangeService.extractEurToDzd(useExchangeRate().data);

  const hasAttributeCriteria = attributs.length > 0 || prixMin != null || prixMax != null || type != null;
  const hasCriteria =
    trimmed.length > 0 || categorieId != null || sousCategorieId != null || hasAttributeCriteria;

  const query = useQuery({
    queryKey: queryKeys.searchAds(trimmed, page, categorieId, sousCategorieId, attributs, prixMin, prixMax, type),
    queryFn: () =>
      searchCatalog({
        titre: trimmed,
        page,
        size,
        categorieId,
        sousCategorieId,
        attributs,
        prixMin,
        prixMax,
        type,
      }),
    enabled: true,
    staleTime: STALE_ADS_MS,
  });

  // Sans critère : catalogue public (évite search 302 inutile)
  const publicFallback = useQuery({
    queryKey: queryKeys.publicAds(page, size, "all"),
    queryFn: () => annoncesService.fetchPublicAds({ page, size }),
    enabled: !hasCriteria,
    staleTime: STALE_ADS_MS,
  });

  const pageData = hasCriteria ? query.data : publicFallback.data;
  const products =
    pageData?.content.map((ad: AdCard) => mapAdCardToUi(ad, { eurToDzd })) ??
    [];

  return {
    ...(hasCriteria ? query : publicFallback),
    products,
    pageData,
    isLoading: hasCriteria ? query.isLoading : publicFallback.isLoading,
    isError: hasCriteria ? query.isError : publicFallback.isError,
    isFetching: hasCriteria ? query.isFetching : publicFallback.isFetching,
  };
}

/** GET /annonces/public/{id}/stats — favorisCount + vues */
export function usePublicAdStats(id: number | string | undefined) {
  return useQuery({
    queryKey: [...queryKeys.adPublic(id ?? "none"), "stats"],
    queryFn: () => annoncesService.fetchPublicAdStats(id!),
    enabled: id != null && String(id).length > 0 && !String(id).startsWith("draft-"),
    staleTime: 60_000,
  });
}

/** GET /annonces/public/users/{userId} — annonces d'un vendeur */
export function useSellerPublicAds(
  userId: number | string | undefined,
  size = 6
) {
  const eurToDzd = exchangeService.extractEurToDzd(useExchangeRate().data);
  return useQuery({
    queryKey: [...queryKeys.sellerPublic(Number(userId) || 0), "ads"],
    queryFn: () => annoncesService.fetchSellerPublicAds(userId!, { size }),
    enabled: userId != null && Number(userId) > 0,
    staleTime: 60_000,
    select: (data) => ({
      ...data,
      products: (data.content ?? []).map((ad: AdCard) =>
        mapAdCardToUi(ad, { eurToDzd })
      ),
    }),
  });
}

/**
 * Annonces similaires à une annonce donnée.
 * Cascade : sous-catégorie → catégorie → public (aligné web).
 */
export function useSimilarAds(options: {
  sousCategorieId?: number | null;
  categorieId?: number | null;
  excludeId?: number | string;
  size?: number;
}) {
  const eurToDzd = exchangeService.extractEurToDzd(useExchangeRate().data);
  const { sousCategorieId, categorieId, excludeId, size = 8 } = options;

  return useQuery({
    queryKey: [
      "annonces",
      "similar",
      sousCategorieId ?? null,
      categorieId ?? null,
      excludeId ?? "none",
    ],
    queryFn: () =>
      annoncesService.fetchSimilarAds({ sousCategorieId, categorieId, excludeId, size }),
    enabled: true,
    staleTime: 60_000,
    select: (data) => ({
      ...data,
      products: (data.content ?? []).map((ad: AdCard) =>
        mapAdCardToUi(ad, { eurToDzd })
      ),
    }),
  });
}

/** POST /annonces/{id}/signalements */
export function useSignalAnnonce() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: number | string; reason: string }) =>
      annoncesService.signalAnnonce(id, reason),
    onSettled: (_d, _e, { id }) => {
      qc.invalidateQueries({ queryKey: queryKeys.adPublic(id) });
    },
  });
}

export function useSuggestions(q: string, limit = 6) {
  const trimmed = q.trim();
  return useQuery({
    queryKey: queryKeys.suggestions(trimmed),
    queryFn: async () => {
      try {
        return await annoncesService.fetchSuggestions(trimmed, limit);
      } catch {
        // Fallback : suggestions locales depuis recherche catalogue
        const page = await searchCatalog({
          titre: trimmed,
          page: 0,
          size: limit,
        });
        return (page.content ?? []).map((ad) => ad.titre).filter(Boolean);
      }
    },
    enabled: trimmed.length >= 2,
    staleTime: 60_000,
  });
}
