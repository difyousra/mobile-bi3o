import type { CreateAnnonceDto, LocalPhoto } from "../types/publish";

type PublishDraft = {
  title?: string;
  description?: string;
  adType?: string;
  price?: string | number;
  city?: string;
  postalCode?: string;
  sousCategorieId?: number;
  category?: string;
  photos?: Record<string, string | LocalPhoto>;
  condition?: string;
  surface?: string;
  [key: string]: unknown;
};

function buildDescription(draft: PublishDraft): string {
  if (draft.description && String(draft.description).trim()) {
    return String(draft.description).trim();
  }
  const parts = [
    draft.condition,
    draft.surface ? `Surface: ${draft.surface}` : null,
    draft.roomsCount ? `Pièces: ${draft.roomsCount}` : null,
    draft.mileage ? `Km: ${draft.mileage}` : null,
    draft.job ? `Métier: ${draft.job}` : null,
  ].filter(Boolean);
  if (parts.length > 0) return parts.join(" · ");
  return draft.title ? `Annonce : ${draft.title}` : "Annonce Bi3oo";
}

/** Mappe le brouillon UI → CreateAnnonceDto (contrat §4.3). */
export function draftToCreateDto(draft: PublishDraft): CreateAnnonceDto {
  const sousCategorieId = Number(draft.sousCategorieId);
  if (!Number.isFinite(sousCategorieId) || sousCategorieId <= 0) {
    throw new Error(
      "Sous-catégorie requise (sousCategorieId). Sélectionnez une catégorie API."
    );
  }

  const prix = Number(String(draft.price ?? "").replace(/\s/g, "").replace(",", "."));
  if (!Number.isFinite(prix) || prix < 0) {
    throw new Error("Prix invalide.");
  }

  const type =
    draft.adType === "request" || draft.adType === "DEMANDE"
      ? "DEMANDE"
      : "OFFRE";

  return {
    titre: String(draft.title ?? "").trim(),
    description: buildDescription(draft),
    type,
    prix,
    ville: String(draft.city ?? "").trim() || "Alger",
    codePostal: String(draft.postalCode ?? "").trim() || "16000",
    sousCategorieId,
    valeurs: [],
  };
}

export function collectLocalPhotos(
  photos: PublishDraft["photos"]
): LocalPhoto[] {
  if (!photos) return [];
  const order = ["primary", "front", "rear", "interior"];
  const result: LocalPhoto[] = [];

  for (const key of order) {
    const value = photos[key];
    if (!value) continue;
    if (typeof value === "string") {
      if (value.startsWith("file:") || value.startsWith("content:")) {
        result.push({ uri: value, mimeType: "image/jpeg" });
      }
      // URLs distantes (Unsplash) : non uploadées
      continue;
    }
    if (value.uri) {
      result.push({
        uri: value.uri,
        mimeType: value.mimeType ?? "image/jpeg",
        fileName: value.fileName,
      });
    }
  }

  return result;
}
