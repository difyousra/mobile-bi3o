import type { CreateAnnonceDto, LocalPhoto } from "../types/publish";
import { getSubcategoryFormConfig } from "../features/annonces/config/subcategoryFormRegistry";
import { buildValeursFromAttributs } from "../features/annonces/utils/buildValeursFromAttributs";
import { buildValeursFromTaxonomyDynamic } from "../features/annonces/utils/maisonJardinTaxonomyHelpers";
import { appendLivraisonFinalizerValeurs } from "../features/annonces/utils/livraisonFinalizer";

type PublishDraft = {
  title?: string;
  description?: string;
  adType?: string;
  price?: string | number;
  isDonation?: boolean;
  city?: string;
  postalCode?: string;
  location?: string;
  sousCategorieId?: number;
  category?: string;
  photos?: Record<string, string | LocalPhoto>;
  condition?: string;
  surface?: string;
  attributs?: Record<string, unknown>;
  attributeAttrIds?: Record<string, number>;
  attributeTypes?: Record<string, string>;
  [key: string]: unknown;
};

function buildDescription(draft: PublishDraft): string {
  if (draft.description && String(draft.description).trim()) {
    return String(draft.description).trim();
  }
  const attrs = draft.attributs || {};
  const parts = [
    draft.condition,
    attrs.type_bien ? `Type: ${attrs.type_bien}` : null,
    attrs.type_transaction ? `Transaction: ${attrs.type_transaction}` : null,
    attrs.surface_habitable
      ? `Surface: ${attrs.surface_habitable} m²`
      : draft.surface
        ? `Surface: ${draft.surface}`
        : null,
    attrs.nombre_pieces
      ? `Pièces: ${attrs.nombre_pieces}`
      : draft.roomsCount
        ? `Pièces: ${draft.roomsCount}`
        : null,
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

  const formConfig = getSubcategoryFormConfig(sousCategorieId);
  const isDonation = Boolean(draft.isDonation);
  const priceOptional = Boolean(formConfig?.priceOptional);
  const rawPrice = String(draft.price ?? "").replace(/\s/g, "").replace(",", ".");
  const prix = isDonation || (!rawPrice && priceOptional) ? 0 : Number(rawPrice);
  if (!isDonation && !priceOptional && (!Number.isFinite(prix) || prix < 1)) {
    throw new Error("Prix invalide. Indiquez un prix d'au moins 1 Da, ou cochez « Je fais un don ».");
  }
  if (!isDonation && priceOptional && rawPrice && (!Number.isFinite(prix) || prix < 0)) {
    throw new Error("Prix invalide.");
  }

  const type =
    draft.adType === "request" || draft.adType === "DEMANDE"
      ? "DEMANDE"
      : "OFFRE";

  const baseValeurs = formConfig
    ? formConfig.taxonomyDynamic
      ? buildValeursFromTaxonomyDynamic(
          (draft.attributs || {}) as Record<string, unknown>,
          draft.attributeAttrIds || {},
          draft.attributeTypes || {}
        )
      : buildValeursFromAttributs(
          (draft.attributs || {}) as Record<string, unknown>,
          formConfig,
          draft.attributeAttrIds || {},
          draft.attributeTypes || {}
        )
    : [];
  const valeurs = appendLivraisonFinalizerValeurs(
    baseValeurs,
    (draft.attributs || {}) as Record<string, unknown>,
    draft.attributeAttrIds || {},
    draft.attributeTypes || {}
  );

  return {
    titre: String(draft.title ?? "").trim(),
    description: buildDescription(draft),
    type,
    prix: isDonation ? 0 : prix,
    ville: String(draft.city ?? "").trim() || "16",
    codePostal: String(draft.postalCode ?? "").trim() || "16000",
    sousCategorieId,
    valeurs,
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
      if (
        value.startsWith("file:") ||
        value.startsWith("content:") ||
        value.startsWith("blob:") ||
        value.startsWith("data:") ||
        value.startsWith("http")
      ) {
        result.push({ uri: value, mimeType: "image/jpeg" });
      }
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
