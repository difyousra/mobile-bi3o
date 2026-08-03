/** IDs sous-catégories Animaux — alignés dépôt + taxo API + new front. */

import { getAnimauxSubcategoryConfig } from '../annonces/config/animauxSubcategories';

export const ANIMAUX_SOUS_CATEGORIES = {
  ANIMAUX_VIVANTS: 61,
  ACCESSOIRES_ANIMAUX: 62,
};

export const ANIMAUX_SUBCATEGORY_IDS = new Set(Object.values(ANIMAUX_SOUS_CATEGORIES));

export const ANIMAUX_DEDICATED_FILTER_SUBCATEGORY_IDS = ANIMAUX_SUBCATEGORY_IDS;

export function isAnimauxCategorie(categorieId) {
  return Number(categorieId) === 16;
}

export function isAnimauxSousCategorie(sousCategorieId) {
  return ANIMAUX_SUBCATEGORY_IDS.has(Number(sousCategorieId));
}

export function hasDedicatedAnimauxFilterSchema(sousCategorieId) {
  if (sousCategorieId == null || sousCategorieId === '') return false;
  return ANIMAUX_DEDICATED_FILTER_SUBCATEGORY_IDS.has(Number(sousCategorieId));
}

export function getAnimauxAttributeIds(sousCategorieId) {
  const config = getAnimauxSubcategoryConfig(sousCategorieId);
  if (!config?.fields?.length) return {};

  const attrs = {};
  config.fields.forEach((field) => {
    if (field.attrId != null) attrs[field.name] = Number(field.attrId);
    Object.values(field.variantByValue || {}).forEach((variant) => {
      if (variant?.attrId != null && field.name) {
        attrs[field.name] = Number(variant.attrId);
      }
    });
  });
  return attrs;
}
