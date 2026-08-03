/** IDs sous-catégories Mode — alignés dépôt + taxo API + new front. */

import { getModeSubcategoryConfig } from '../annonces/config/modeSubcategories';

export const MODE_SOUS_CATEGORIES = {
  VETEMENTS: 16,
  CHAUSSURES: 17,
  ACCESSOIRES_BAGAGERIE: 18,
  MONTRES_BIJOUX: 19,
};

export const MODE_SUBCATEGORY_IDS = new Set(Object.values(MODE_SOUS_CATEGORIES));

export const MODE_DEDICATED_FILTER_SUBCATEGORY_IDS = MODE_SUBCATEGORY_IDS;

export function isModeCategorie(categorieId) {
  return Number(categorieId) === 9;
}

export function isModeSousCategorie(sousCategorieId) {
  return MODE_SUBCATEGORY_IDS.has(Number(sousCategorieId));
}

export function hasDedicatedModeFilterSchema(sousCategorieId) {
  if (sousCategorieId == null || sousCategorieId === '') return false;
  return MODE_DEDICATED_FILTER_SUBCATEGORY_IDS.has(Number(sousCategorieId));
}

export function getModeAttributeIds(sousCategorieId) {
  const config = getModeSubcategoryConfig(sousCategorieId);
  if (!config?.fields?.length) return {};

  return Object.fromEntries(
    config.fields
      .filter((field) => field.attrId != null)
      .map((field) => [field.name, Number(field.attrId)])
  );
}
