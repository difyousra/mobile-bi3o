/** IDs sous-catégories Électronique — alignés dépôt + taxo API + new front. */

import { getElectroniqueSubcategoryConfig } from '../annonces/config/electroniqueSubcategories';

export const ELECTRONIQUE_SOUS_CATEGORIES = {
  ORDINATEURS: 32,
  ACCESSOIRES_INFORMATIQUES: 33,
  TABLETTES_LISEUSES: 34,
  PHOTO_AUDIO_VIDEO: 35,
  TELEPHONES_OBJETS_CONNECTES: 36,
  ACCESSOIRES_TELEPHONE: 37,
  CONSOLES: 38,
  JEUX_VIDEO: 39,
};

export const ELECTRONIQUE_SUBCATEGORY_IDS = new Set(
  Object.values(ELECTRONIQUE_SOUS_CATEGORIES)
);

export const ELECTRONIQUE_DEDICATED_FILTER_SUBCATEGORY_IDS = ELECTRONIQUE_SUBCATEGORY_IDS;

export function isElectroniqueCategorie(categorieId) {
  return Number(categorieId) === 11;
}

export function isElectroniqueSousCategorie(sousCategorieId) {
  return ELECTRONIQUE_SUBCATEGORY_IDS.has(Number(sousCategorieId));
}

export function hasDedicatedElectroniqueFilterSchema(sousCategorieId) {
  if (sousCategorieId == null || sousCategorieId === '') return false;
  return ELECTRONIQUE_DEDICATED_FILTER_SUBCATEGORY_IDS.has(Number(sousCategorieId));
}

export function getElectroniqueAttributeIds(sousCategorieId) {
  const config = getElectroniqueSubcategoryConfig(sousCategorieId);
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
