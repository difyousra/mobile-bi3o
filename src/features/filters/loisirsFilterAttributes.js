/** IDs sous-catégories Loisirs — alignés dépôt + taxo API + new front. */

import { getLoisirsSubcategoryConfig } from '../annonces/config/loisirsSubcategories';

export const LOISIRS_SOUS_CATEGORIES = {
  ANTIQUITES: 20,
  COLLECTION: 21,
  CD_MUSIQUE: 22,
  DVD_FILMS: 23,
  INSTRUMENTS_MUSIQUE: 24,
  LIVRES: 25,
  MODELISME: 26,
  JEUX_JOUETS: 27,
  LOISIRS_CREATIFS: 28,
  SPORT_PLEIN_AIR: 29,
  VELOS: 30,
  EQUIPEMENTS_VELOS: 31,
  PLATS_GASTRONOMIE: 89,
};

export const LOISIRS_SUBCATEGORY_IDS = new Set(Object.values(LOISIRS_SOUS_CATEGORIES));

export const LOISIRS_DEDICATED_FILTER_SUBCATEGORY_IDS = LOISIRS_SUBCATEGORY_IDS;

export function isLoisirsCategorie(categorieId) {
  return Number(categorieId) === 10;
}

export function isLoisirsSousCategorie(sousCategorieId) {
  return LOISIRS_SUBCATEGORY_IDS.has(Number(sousCategorieId));
}

export function hasDedicatedLoisirsFilterSchema(sousCategorieId) {
  if (sousCategorieId == null || sousCategorieId === '') return false;
  return LOISIRS_DEDICATED_FILTER_SUBCATEGORY_IDS.has(Number(sousCategorieId));
}

export function getLoisirsAttributeIds(sousCategorieId) {
  const config = getLoisirsSubcategoryConfig(sousCategorieId);
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
