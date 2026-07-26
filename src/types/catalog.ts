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

export type PublicAdDetail = AdCard & {
  description?: string;
  type?: string;
  codePostal?: string;
  photos?: Array<{
    id?: number;
    url?: string;
    photoUrl?: string;
    chemin?: string;
  }>;
  userId?: number;
  user?: {
    id?: number;
    nom?: string;
    prenom?: string;
  };
  vendeur?: string;
  sousCategorieId?: number;
  categorieNom?: string;
  sousCategorieNom?: string;
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
