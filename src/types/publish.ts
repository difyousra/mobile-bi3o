/** DTO création — mobile_api.md §4.3 */

export type AnnonceType = "OFFRE" | "DEMANDE";

export type AnnonceValeur = {
  attributDefiniId: number;
  valueText?: string;
};

export type CreateAnnonceDto = {
  titre: string;
  description: string;
  type: AnnonceType;
  prix: number;
  ville: string;
  codePostal: string;
  sousCategorieId: number;
  valeurs?: AnnonceValeur[];
};

export type ModerationCheckRequest = {
  titre: string;
  description: string;
};

export type ModerationCheckResponse = {
  allowed?: boolean;
  score?: number;
  reason?: string;
  message?: string;
};

export type ManagedAnnonce = {
  id: number;
  titre?: string;
  title?: string;
  prix?: number;
  price?: number;
  ville?: string;
  coverUrl?: string;
  image?: string;
  status?: string;
  statut?: string;
  views?: number;
  vues?: number;
  messages?: number;
  createdAt?: string;
};

export type LocalPhoto = {
  uri: string;
  mimeType?: string;
  fileName?: string;
};
