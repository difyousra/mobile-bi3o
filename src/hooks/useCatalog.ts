import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
import { useAppLanguage } from "../i18n/LanguageProvider";

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

/** Fallback client si GET catalogue (sans POST search) : particulier | professionnel. */
function filterByVendeurType(
  page: PublicAdsPage,
  vendeurType?: string | null
): PublicAdsPage {
  const wanted = String(vendeurType || "").trim().toLowerCase();
  if (!wanted) return page;
  const wantPro = wanted === "professionnel" || wanted === "pro";
  const wantPart =
    wanted === "particulier" || wanted === "individual" || wanted === "part";
  if (!wantPro && !wantPart) return page;

  const content = (page.content ?? []).filter((ad) => {
    const isPro = Boolean(ad.vendeurEstPro);
    return wantPro ? isPro : !isPro;
  });
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
 * - Catégorie / sous-catégorie seule → GET léger (coverUrl / photos), pas le POST lourd.
 * - Texte / attributs / prix → POST /annonces/search/all-attributes, fallback GET si échec.
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
  vendeurType?: string | null;
  disponibiliteDateArrivee?: string | null;
  disponibiliteDateDepart?: string | null;
}): Promise<PublicAdsPage> {
  const {
    titre,
    page,
    size,
    categorieId,
    sousCategorieId,
    attributs = [],
    prixMin,
    prixMax,
    type,
    vendeurType,
    disponibiliteDateArrivee,
    disponibiliteDateDepart,
  } = options;
  const trimmed = titre.trim();
  const vendeur = String(vendeurType || "").trim() || null;
  const needsFullSearch =
    trimmed.length > 0 ||
    attributs.length > 0 ||
    prixMin != null ||
    prixMax != null ||
    Boolean(type) ||
    Boolean(vendeur) ||
    Boolean(disponibiliteDateArrivee && disponibiliteDateDepart);

  // Parcours catégorie (Home → résultats) : endpoint public rapide avec coverUrl.
  if (!needsFullSearch) {
    if (sousCategorieId) {
      return annoncesService.fetchAdsBySousCategorie(sousCategorieId, {
        page,
        size,
      });
    }
    if (categorieId) {
      return annoncesService.fetchAdsByCategorie(categorieId, { page, size });
    }
    return annoncesService.fetchPublicAds({ page, size });
  }

  try {
    const body: Record<string, unknown> = {
      titre: trimmed,
      attributs,
    };
    if (categorieId) body.categorieId = categorieId;
    if (sousCategorieId) body.sousCategorieId = sousCategorieId;
    if (prixMin) body.prixMin = prixMin;
    if (prixMax) body.prixMax = prixMax;
    if (type) body.type = type;
    if (vendeur) body.vendeurType = vendeur;
    if (disponibiliteDateArrivee) {
      body.disponibiliteDateArrivee = disponibiliteDateArrivee;
    }
    if (disponibiliteDateDepart) {
      body.disponibiliteDateDepart = disponibiliteDateDepart;
    }

    return await annoncesService.searchAllAttributes(
      body as Parameters<typeof annoncesService.searchAllAttributes>[0],
      { page, size }
    );
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
    base = await annoncesService.fetchPublicAds({
      page,
      size: Math.max(size, 48),
    });
  }

  return filterByVendeurType(filterByTitre(base, trimmed), vendeur);
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
  const { t } = useAppLanguage();
  const chips = flattenCategoryTree(query.data, t);
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
  const eurToDzd = exchangeService.resolveExchangeRates(useExchangeRate().data).eurToDzd;

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

/** Catalogue public paginé à l’infini (Home). */
export function useInfinitePublicAds(options?: {
  size?: number;
  categorieId?: number | "all";
  sousCategorieId?: number | null;
}) {
  const size = options?.size ?? 24;
  const categorieId = options?.categorieId ?? "all";
  const sousCategorieId = options?.sousCategorieId ?? null;
  const eurToDzd = exchangeService.resolveExchangeRates(useExchangeRate().data).eurToDzd;

  const query = useInfiniteQuery({
    queryKey: queryKeys.publicAdsInfinite(size, categorieId, sousCategorieId),
    queryFn: ({ pageParam }) => {
      if (sousCategorieId) {
        return annoncesService.fetchAdsBySousCategorie(sousCategorieId, {
          page: pageParam,
          size,
        });
      }
      if (
        categorieId !== "all" &&
        typeof categorieId === "number" &&
        !Number.isNaN(categorieId)
      ) {
        return annoncesService.fetchAdsByCategorie(categorieId, {
          page: pageParam,
          size,
        });
      }
      return annoncesService.fetchPublicAds({ page: pageParam, size });
    },
    initialPageParam: 0,
    getNextPageParam: (last) => {
      if (!last) return undefined;
      if (last.last === true) return undefined;
      const number = last.number ?? 0;
      const totalPages = last.totalPages;
      if (typeof totalPages === "number" && number + 1 >= totalPages) {
        return undefined;
      }
      if ((last.content?.length ?? 0) === 0) return undefined;
      return number + 1;
    },
    staleTime: STALE_ADS_MS,
  });

  const ads =
    query.data?.pages.flatMap((page) => page.content ?? []) ?? [];
  const products = ads.map((ad: AdCard) => mapAdCardToUi(ad, { eurToDzd }));
  const firstPage = query.data?.pages?.[0];
  const lastPage = query.data?.pages?.[query.data.pages.length - 1];

  const pageData: PublicAdsPage | undefined = firstPage
    ? {
        ...lastPage!,
        content: ads,
        totalElements: firstPage.totalElements ?? ads.length,
        totalPages: firstPage.totalPages ?? lastPage?.totalPages,
        number: lastPage?.number ?? 0,
        size: firstPage.size ?? size,
        first: true,
        last: lastPage?.last ?? true,
      }
    : undefined;

  return {
    ...query,
    products,
    ads,
    pageData,
  };
}

export function usePublicAd(id: number | string | undefined) {
  const eurToDzd = exchangeService.resolveExchangeRates(useExchangeRate().data).eurToDzd;

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
    vendeurType?: string | null;
    disponibiliteDateArrivee?: string | null;
    disponibiliteDateDepart?: string | null;
  }
) {
  const trimmed = titre.trim();
  const categorieId = options?.categorieId ?? null;
  const sousCategorieId = options?.sousCategorieId ?? null;
  const attributs = options?.attributs ?? [];
  const prixMin = options?.prixMin ?? null;
  const prixMax = options?.prixMax ?? null;
  const type = options?.type ?? null;
  const vendeurType = options?.vendeurType ?? null;
  const disponibiliteDateArrivee = options?.disponibiliteDateArrivee ?? null;
  const disponibiliteDateDepart = options?.disponibiliteDateDepart ?? null;
  const eurToDzd = exchangeService.resolveExchangeRates(useExchangeRate().data).eurToDzd;

  const hasAttributeCriteria =
    attributs.length > 0 ||
    prixMin != null ||
    prixMax != null ||
    type != null ||
    Boolean(vendeurType) ||
    Boolean(disponibiliteDateArrivee && disponibiliteDateDepart);
  const hasCriteria =
    trimmed.length > 0 || categorieId != null || sousCategorieId != null || hasAttributeCriteria;

  const query = useQuery({
    queryKey: queryKeys.searchAds(
      trimmed,
      page,
      size,
      categorieId,
      sousCategorieId,
      attributs,
      prixMin,
      prixMax,
      type,
      disponibiliteDateArrivee,
      disponibiliteDateDepart,
      vendeurType
    ),
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
        vendeurType,
        disponibiliteDateArrivee,
        disponibiliteDateDepart,
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

/**
 * Recherche / catalogue paginé à l’infini (scroll bas de page → page suivante).
 */
export function useInfiniteSearchAds(
  titre: string,
  size = 24,
  options?: {
    categorieId?: number | null;
    sousCategorieId?: number | null;
    attributs?: object[];
    prixMin?: number | null;
    prixMax?: number | null;
    type?: string | null;
    vendeurType?: string | null;
    disponibiliteDateArrivee?: string | null;
    disponibiliteDateDepart?: string | null;
  }
) {
  const trimmed = titre.trim();
  const categorieId = options?.categorieId ?? null;
  const sousCategorieId = options?.sousCategorieId ?? null;
  const attributs = options?.attributs ?? [];
  const prixMin = options?.prixMin ?? null;
  const prixMax = options?.prixMax ?? null;
  const type = options?.type ?? null;
  const vendeurType = options?.vendeurType ?? null;
  const disponibiliteDateArrivee = options?.disponibiliteDateArrivee ?? null;
  const disponibiliteDateDepart = options?.disponibiliteDateDepart ?? null;
  const eurToDzd = exchangeService.resolveExchangeRates(useExchangeRate().data).eurToDzd;

  const query = useInfiniteQuery({
    queryKey: queryKeys.searchAdsInfinite(
      trimmed,
      size,
      categorieId,
      sousCategorieId,
      attributs,
      prixMin,
      prixMax,
      type,
      disponibiliteDateArrivee,
      disponibiliteDateDepart,
      vendeurType
    ),
    queryFn: ({ pageParam }) =>
      searchCatalog({
        titre: trimmed,
        page: pageParam,
        size,
        categorieId,
        sousCategorieId,
        attributs,
        prixMin,
        prixMax,
        type,
        vendeurType,
        disponibiliteDateArrivee,
        disponibiliteDateDepart,
      }),
    initialPageParam: 0,
    getNextPageParam: (last) => {
      if (!last) return undefined;
      if (last.last === true) return undefined;
      const number = last.number ?? 0;
      const totalPages = last.totalPages;
      if (typeof totalPages === "number" && number + 1 >= totalPages) {
        return undefined;
      }
      if ((last.content?.length ?? 0) === 0) return undefined;
      return number + 1;
    },
    staleTime: STALE_ADS_MS,
  });

  const ads =
    query.data?.pages.flatMap((page) => page.content ?? []) ?? [];
  const products = ads.map((ad: AdCard) => mapAdCardToUi(ad, { eurToDzd }));
  const firstPage = query.data?.pages?.[0];
  const lastPage = query.data?.pages?.[query.data.pages.length - 1];

  const pageData: PublicAdsPage | undefined = firstPage
    ? {
        ...lastPage!,
        content: ads,
        totalElements: firstPage.totalElements ?? ads.length,
        totalPages: firstPage.totalPages ?? lastPage?.totalPages,
        number: lastPage?.number ?? 0,
        size: firstPage.size ?? size,
        first: true,
        last: lastPage?.last ?? true,
      }
    : undefined;

  return {
    ...query,
    products,
    ads,
    pageData,
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
  const eurToDzd = exchangeService.resolveExchangeRates(useExchangeRate().data).eurToDzd;
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

/** Infinite scroll — annonces d’un vendeur (profil / abonnés). */
export function useInfiniteSellerPublicAds(
  userId: number | string | undefined,
  size = 24
) {
  const eurToDzd = exchangeService.resolveExchangeRates(useExchangeRate().data).eurToDzd;
  const id = Number(userId) || 0;

  const query = useInfiniteQuery({
    queryKey: queryKeys.sellerPublicAdsInfinite(id, size),
    queryFn: ({ pageParam }) =>
      annoncesService.fetchSellerPublicAds(userId!, {
        page: pageParam,
        size,
      }),
    initialPageParam: 0,
    getNextPageParam: (last) => {
      if (!last) return undefined;
      if (last.last === true) return undefined;
      const number = last.number ?? 0;
      const totalPages = last.totalPages;
      if (typeof totalPages === "number" && number + 1 >= totalPages) {
        return undefined;
      }
      if ((last.content?.length ?? 0) === 0) return undefined;
      return number + 1;
    },
    enabled: userId != null && id > 0,
    staleTime: 60_000,
  });

  const ads =
    query.data?.pages.flatMap((page) => page.content ?? []) ?? [];
  const products = ads.map((ad: AdCard) => mapAdCardToUi(ad, { eurToDzd }));
  const firstPage = query.data?.pages?.[0];
  const lastPage = query.data?.pages?.[query.data.pages.length - 1];

  return {
    ...query,
    products,
    ads,
    pageData: firstPage
      ? {
          ...lastPage!,
          content: ads,
          totalElements: firstPage.totalElements ?? ads.length,
          totalPages: firstPage.totalPages ?? lastPage?.totalPages,
          number: lastPage?.number ?? 0,
          size: firstPage.size ?? size,
          first: true,
          last: lastPage?.last ?? true,
        }
      : undefined,
  };
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
  const eurToDzd = exchangeService.resolveExchangeRates(useExchangeRate().data).eurToDzd;
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
