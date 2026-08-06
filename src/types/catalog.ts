import type { Page } from "./auth";

/** AdCard — mobile_api.md §5 (+ champs fréquents catalogue public) */
export type AdCard = {
  id: number;
  titre: string;
  prix?: number;
  ville?: string;
  codePostal?: string;
  coverUrl?: string;
  photosCount?: number;
  createdAt?: string;
  categorieId?: number;
  sousCategorieId?: number;
  userId?: number;
  vendeurPublicNom?: string;
  vendeurPublicPhotoUrl?: string;
  vendeurPhotoUrl?: string;
  vendeurEstPro?: boolean;
  favorisCount?: number;
  views?: number;
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
  /** Singuliers — format backend AnnonceSearchRequest */
  categorieId?: number;
  sousCategorieId?: number;
  /** Pluriels legacy (ignorés par le backend Jackson si inconnus) */
  categorieIds?: number[];
  sousCategorieIds?: number[];
  prixMin?: number;
  prixMax?: number;
  type?: string;
  disponibiliteDateArrivee?: string;
  disponibiliteDateDepart?: string;
  attributs?: Array<{
    attributDefiniId?: number;
    nom?: string;
    type?: string;
    equalsText?: string;
    valueText?: string;
    min?: string | number;
    max?: string | number;
    dateMin?: string;
    dateMax?: string;
  }>;
};

export type ExchangeRate = {
  /** 1 EUR = X DZD (taux officiel). */
  officialRate?: number;
  /** 1 EUR = X DZD (marché parallèle, achat). */
  parallelBuy?: number;
  /** 1 EUR = X DZD (marché parallèle, vente). */
  parallelSell?: number;
  displayRateType?: string;
  updatedAt?: string;
  /** Alias legacy */
  eurToDzd?: number;
  dzdToEur?: number;
  rate?: number;
  [key: string]: unknown;
};

export type PublicAdsPage = Page<AdCard>;
