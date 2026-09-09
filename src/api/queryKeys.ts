export const queryKeys = {
  me: ["users", "me"] as const,
  profileMe: ["profiles", "me"] as const,
  taxoTree: ["taxo", "tree"] as const,
  sousCategories: ["taxo", "sous-categories"] as const,
  attributs: (id: number) => ["taxo", "attributs", id] as const,
  referentielMarquesModeles: ["taxo", "referentiel-marques-modeles"] as const,
  publicAds: (page: number, size: number, categorieId?: number | "all") =>
    ["annonces", "public", page, size, categorieId ?? "all"] as const,
  publicAdsInfinite: (
    size: number,
    categorieId?: number | "all",
    sousCategorieId?: number | null
  ) =>
    [
      "annonces",
      "public",
      "infinite",
      size,
      categorieId ?? "all",
      sousCategorieId ?? "none",
    ] as const,
  adPublic: (id: number | string) => ["annonces", "public", id] as const,
  searchAds: (
    titre: string,
    page: number,
    size: number,
    categorieId?: number | null,
    sousCategorieId?: number | null,
    attributs?: object[],
    prixMin?: number | null,
    prixMax?: number | null,
    type?: string | null,
    disponibiliteDateArrivee?: string | null,
    disponibiliteDateDepart?: string | null,
    vendeurType?: string | null
  ) =>
    [
      "annonces",
      "search",
      titre,
      page,
      size,
      categorieId ?? "all",
      sousCategorieId ?? "all",
      JSON.stringify(attributs ?? []),
      prixMin ?? null,
      prixMax ?? null,
      type ?? null,
      disponibiliteDateArrivee ?? null,
      disponibiliteDateDepart ?? null,
      vendeurType ?? null,
    ] as const,
  searchAdsInfinite: (
    titre: string,
    size: number,
    categorieId?: number | null,
    sousCategorieId?: number | null,
    attributs?: object[],
    prixMin?: number | null,
    prixMax?: number | null,
    type?: string | null,
    disponibiliteDateArrivee?: string | null,
    disponibiliteDateDepart?: string | null,
    vendeurType?: string | null
  ) =>
    [
      "annonces",
      "search",
      "infinite",
      titre,
      size,
      categorieId ?? "all",
      sousCategorieId ?? "all",
      JSON.stringify(attributs ?? []),
      prixMin ?? null,
      prixMax ?? null,
      type ?? null,
      disponibiliteDateArrivee ?? null,
      disponibiliteDateDepart ?? null,
      vendeurType ?? null,
    ] as const,
  suggestions: (q: string) => ["annonces", "suggestions", q] as const,
  sellerPublic: (id: number) => ["users", "public", id] as const,
  favorites: (page: number) => ["me", "favoris", page] as const,
  favoritesInfinite: (size: number) =>
    ["me", "favoris", "infinite", size] as const,
  favoriteIds: ["me", "favoris", "ids"] as const,
  followStatus: (sellerId: number | string) =>
    ["users", "follow", sellerId] as const,
  followedSellers: ["users", "follow", "list"] as const,
  followedSellersInfinite: (size: number) =>
    ["users", "follow", "list", "infinite", size] as const,
  sellerPublicAdsInfinite: (userId: number, size: number) =>
    ["users", "public", userId, "ads", "infinite", size] as const,
  notifications: (page: number) => ["me", "notifications", page] as const,
  notificationsInfinite: ["me", "notifications", "infinite"] as const,
  notificationsUnread: ["me", "notifications", "unread"] as const,
  savedSearches: ["me", "recherches"] as const,
  myAds: (page: number) => ["annonces", "me", "manage", page] as const,
  myAdsInfinite: (size: number) =>
    ["annonces", "me", "manage", "infinite", size] as const,
  conversations: ["messagerie", "conversations"] as const,
  messages: (id: number) => ["messagerie", "messages", id] as const,
  reservationCalendar: (annonceId: number | string) =>
    ["reservations", "calendar", annonceId] as const,
  myReservations: (page: number) => ["reservations", "me", page] as const,
  annonceReservations: (annonceId: number | string, page: number) =>
    ["reservations", "annonce", annonceId, page] as const,
  exchange: ["exchange", "current"] as const,
};
