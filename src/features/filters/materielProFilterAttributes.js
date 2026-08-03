/** IDs sous-catégories Matériel professionnel — alignés dépôt + taxo API + new front. */

import { getMaterielProfessionnelSubcategoryConfig } from '../annonces/config/materielProfessionnelSubcategories';

export const MATERIEL_PRO_SOUS_CATEGORIES = {
  TRACTEUR: 45,
  AUTRE_MATERIEL: 46,
};

export const MATERIEL_PRO_SUBCATEGORY_IDS = new Set(
  Object.values(MATERIEL_PRO_SOUS_CATEGORIES)
);

export const MATERIEL_PRO_DEDICATED_FILTER_SUBCATEGORY_IDS = MATERIEL_PRO_SUBCATEGORY_IDS;

export function isMaterielProCategorie(categorieId) {
  return Number(categorieId) === 13;
}

export function isMaterielProSousCategorie(sousCategorieId) {
  return MATERIEL_PRO_SUBCATEGORY_IDS.has(Number(sousCategorieId));
}

export function hasDedicatedMaterielProFilterSchema(sousCategorieId) {
  if (sousCategorieId == null || sousCategorieId === '') return false;
  return MATERIEL_PRO_DEDICATED_FILTER_SUBCATEGORY_IDS.has(Number(sousCategorieId));
}

export function getMaterielProAttributeIds(sousCategorieId) {
  const config = getMaterielProfessionnelSubcategoryConfig(sousCategorieId);
  if (!config?.fields?.length) return {};

  return Object.fromEntries(
    config.fields
      .filter((field) => field.attrId != null)
      .map((field) => [field.name, Number(field.attrId)])
  );
}
