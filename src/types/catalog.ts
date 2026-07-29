import type { Page } from "./auth";

/** AdCard — mobile_api.md §5 (+ champs fréquents catalogue public) */
export type AdCard = {
  id: number;
  titre: string;
  prix?: number;
  ville?: string;
  coverUrl?: string;
  photosCount?: number;
  createdAt?: string;
  categorieId?: number;
  sousCategorieId?: number;
  userId?: number;
  vendeurPublicNom?: string;
  photos?: Array<{
    id?: number;
    url?: string;
    photoUrl?: string;
    chemin?: string;
    cover?: boolean;
  }>;
};

/** Sous-catégorie DTO plat — GET /taxo/sous-categories */
export type SousCategorieDto = {
  id: number;
  nom: string;
  categorieId: number;
};

/** Nœud d’arbre — GET /taxo/categories-tree (champs optionnels selon payload) */
export type CategoryTreeNode = {
  id: number;
  nom?: string;
  name?: string;
  label?: string;
  sousCategories?: CategoryTreeNode[];
  children?: CategoryTreeNode[];
};

/** Attribut dynamique d'une annonce (valeurs[]) */
export type AnnonceValeur = {
  id?: number;
  attributDefiniId?: number;
  attributNom?: string;
  valueText?: string;
  valueNumber?: number | string;
  valueDate?: string;
};

export type PublicAdDetail = AdCard & {
  description?: string;
  type?: string;
  codePostal?: string;
  /** URLs directes des photos (prioritaire) */
  photoUrls?: string[];
  photos?: Array<{
    id?: number;
    url?: string;
    photoUrl?: string;
    chemin?: string;
    cover?: boolean;
  }>;
  userId?: number;
  vendeurPublicNom?: string;
  vendeurEstPro?: boolean;
  user?: {
    id?: number;
    nom?: string;
    prenom?: string;
  };
  vendeur?: string;
  sousCategorieId?: number;
  categorieId?: number;
  categorieNom?: string;
  sousCategorieNom?: string;
  createdAt?: string;
  favorisCount?: number;
  views?: number;
  messagesCount?: number;
  /** Attributs catégorie spécifiques */
  valeurs?: AnnonceValeur[];
};

/** Stats publiques d'une annonce */
export type PublicAdStats = {
  favorisCount?: number;
  views?: number;
  messagesCount?: number;
};

/** Body Postman — POST /annonces/search/all-attributes */
export type SearchAllAttributesRequest = {
  titre?: string;
  categorieIds?: number[];
  sousCategorieIds?: number[];
  attributs?: Array<{
    attributDefiniId?: number;
    valueText?: string;
  }>;
};

export type ExchangeRate = {
  eurToDzd?: number;
  dzdToEur?: number;
  rate?: number;
  [key: string]: unknown;
};

export type PublicAdsPage = Page<AdCard>;
