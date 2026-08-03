/** IDs sous-catégories Maison & Jardin — alignés dépôt + taxo API + new front. */

import { getMaisonJardinSubcategoryConfig } from '../annonces/config/maisonJardinSubcategories';

export const MAISON_JARDIN_SOUS_CATEGORIES = {
  AMEUBLEMENT: 53,
  PAPETERIE_FOURNITURES: 54,
  ELECTROMENAGER: 55,
  ARTS_DE_LA_TABLE: 56,
  DECORATION: 57,
  LINGE_MAISON: 58,
  BRICOLAGE: 59,
  JARDIN_PLANTES: 60,
};

export const MAISON_JARDIN_SUBCATEGORY_IDS = new Set(
  Object.values(MAISON_JARDIN_SOUS_CATEGORIES)
);

export const MAISON_JARDIN_DEDICATED_FILTER_SUBCATEGORY_IDS = MAISON_JARDIN_SUBCATEGORY_IDS;

export function isMaisonJardinCategorie(categorieId) {
  return Number(categorieId) === 15;
}

export function isMaisonJardinSousCategorie(sousCategorieId) {
  return MAISON_JARDIN_SUBCATEGORY_IDS.has(Number(sousCategorieId));
}

export function hasDedicatedMaisonJardinFilterSchema(sousCategorieId) {
  if (sousCategorieId == null || sousCategorieId === '') return false;
  return MAISON_JARDIN_DEDICATED_FILTER_SUBCATEGORY_IDS.has(Number(sousCategorieId));
}

export function getMaisonJardinSubcategoryMeta(sousCategorieId) {
  const config = getMaisonJardinSubcategoryConfig(sousCategorieId);
  if (!config) return null;
  return {
    primaryKey: config.primaryKey ?? null,
    linkedProductMode: config.linkedProductMode ?? 'none',
  };
}
