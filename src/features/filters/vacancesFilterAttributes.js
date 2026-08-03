/** IDs sous-catégories et attributs Locations et vacances — alignés dépôt + new front. */

export const VACANCES_SOUS_CATEGORIES = {
  LOCATIONS_SAISONNIERES: 40,
  AGENCES: 90,
  VISAS: 91,
};

export const VACANCES_SUBCATEGORY_IDS = new Set(Object.values(VACANCES_SOUS_CATEGORIES));

export const VACANCES_LOCATIONS_SAISONNIERES_ATTR = {
  type_residence: 205,
  nature_logement: 206,
  type_logement: 207,
  nombre_etoiles: 208,
  capacite: 209,
  nombre_chambres: 210,
  horaire_arrivee: 211,
  horaire_depart: 212,
  equipements: 213,
  exterieur: 214,
  services_accessibilite: 215,
  fumeurs_acceptes: 216,
  location_avec_piscine: 556,
  animaux_acceptes: 557,
};

export const VACANCES_DEDICATED_FILTER_SUBCATEGORY_IDS = VACANCES_SUBCATEGORY_IDS;

export function isVacancesCategorie(categorieId) {
  return Number(categorieId) === 12;
}

export function isVacancesSousCategorie(sousCategorieId) {
  return VACANCES_SUBCATEGORY_IDS.has(Number(sousCategorieId));
}

export function hasDedicatedVacancesFilterSchema(sousCategorieId) {
  if (sousCategorieId == null || sousCategorieId === '') return false;
  return VACANCES_DEDICATED_FILTER_SUBCATEGORY_IDS.has(Number(sousCategorieId));
}

export function getVacancesAttributeIds(sousCategorieId) {
  const id = Number(sousCategorieId);
  if (id === VACANCES_SOUS_CATEGORIES.LOCATIONS_SAISONNIERES) {
    return { ...VACANCES_LOCATIONS_SAISONNIERES_ATTR };
  }
  return {};
}
