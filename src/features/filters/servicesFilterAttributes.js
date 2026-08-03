/** IDs sous-catégories Services — alignés dépôt + taxo API + new front. */

import { getServiceSubcategoryConfig } from '../annonces/config/serviceSubcategories';

export const SERVICES_SOUS_CATEGORIES = {
  SERVICES: 50,
};

export const SERVICES_SUBCATEGORY_IDS = new Set(Object.values(SERVICES_SOUS_CATEGORIES));

export const SERVICES_DEDICATED_FILTER_SUBCATEGORY_IDS = SERVICES_SUBCATEGORY_IDS;

export function isServicesCategorie(categorieId) {
  return Number(categorieId) === 14;
}

export function isServicesSousCategorie(sousCategorieId) {
  return SERVICES_SUBCATEGORY_IDS.has(Number(sousCategorieId));
}

export function hasDedicatedServicesFilterSchema(sousCategorieId) {
  if (sousCategorieId == null || sousCategorieId === '') return false;
  return SERVICES_DEDICATED_FILTER_SUBCATEGORY_IDS.has(Number(sousCategorieId));
}

export function getServicesAttributeIds(sousCategorieId) {
  const config = getServiceSubcategoryConfig(sousCategorieId);
  if (!config?.fields?.length) return {};

  return Object.fromEntries(
    config.fields
      .filter((field) => field.attrId != null)
      .map((field) => [field.name, Number(field.attrId)])
  );
}
