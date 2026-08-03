/** IDs sous-catégories Famille — alignés dépôt + taxo API + new front. */

import { getFamilleSubcategoryConfig } from '../annonces/config/familleSubcategories';

export const FAMILLE_SOUS_CATEGORIES = {
  EQUIPEMENTS_BEBE: 13,
  MOBILIERS_ENFANT: 14,
  VETEMENTS_BEBE: 15,
};

export const FAMILLE_SUBCATEGORY_IDS = new Set(Object.values(FAMILLE_SOUS_CATEGORIES));

export const FAMILLE_DEDICATED_FILTER_SUBCATEGORY_IDS = FAMILLE_SUBCATEGORY_IDS;

export function isFamilleCategorie(categorieId) {
  return Number(categorieId) === 8;
}

export function isFamilleSousCategorie(sousCategorieId) {
  return FAMILLE_SUBCATEGORY_IDS.has(Number(sousCategorieId));
}

export function hasDedicatedFamilleFilterSchema(sousCategorieId) {
  if (sousCategorieId == null || sousCategorieId === '') return false;
  return FAMILLE_DEDICATED_FILTER_SUBCATEGORY_IDS.has(Number(sousCategorieId));
}

export function getFamilleAttributeIds(sousCategorieId) {
  const config = getFamilleSubcategoryConfig(sousCategorieId);
  if (!config?.fields?.length) return {};

  return Object.fromEntries(
    config.fields
      .filter((field) => field.attrId != null)
      .map((field) => [field.name, Number(field.attrId)])
  );
}
