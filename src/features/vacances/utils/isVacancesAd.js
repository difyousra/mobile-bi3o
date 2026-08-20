import {
  isVacancesCategorie,
  isVacancesSousCategorie,
  VACANCES_SOUS_CATEGORIES,
} from "../../filters/vacancesFilterAttributes";

export function isVacancesAd(ad) {
  if (!ad) return false;
  if (isVacancesCategorie(ad.categorieId)) return true;
  return isVacancesSousCategorie(ad.sousCategorieId);
}

/** Comme l’ancien front : widget réservation uniquement pour Locations saisonnières (40). */
export function isLocationsSaisonnieresAd(ad) {
  return Number(ad?.sousCategorieId) === VACANCES_SOUS_CATEGORIES.LOCATIONS_SAISONNIERES;
}
