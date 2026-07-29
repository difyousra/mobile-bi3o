/**
 * Dispatcher de schémas de filtres par slug de catégorie.
 * Aligné sur le web : categoryFilterSchemas.js + resolveCategoryFilterSchema.js
 */
import { buildImmobilierFilterSchema } from './buildImmobilierFilterSchema';
import { buildVehiculeFilterSchema } from './buildVehiculeFilterSchema';
import { buildEmploiFilterSchema } from './buildEmploiFilterSchema';
import {
  isImmobilierSousCategorie,
  IMMOBILIER_SOUS_CATEGORIES,
} from './immobilierFilterAttributes';
import {
  isVehiculeSousCategorie,
  isVehiculeCategorie,
} from './vehiculeFilterAttributes';
import {
  isEmploiCategorie,
  isEmploiSousCategorie,
  EMPLOI_SOUS_CATEGORIES,
} from './emploiFilterAttributes';

/** IDs catégories API par slug (alignés sur le web). */
export const CATEGORY_SLUG_TO_ID = {
  vehicules: 1,
  immobilier: 5,
  vacances: 12,
  emploi: 7,
  mode: 9,
  'maison-jardin': 15,
  famille: 8,
  electronique: 11,
  loisirs: 10,
  services: 14,
  animaux: 16,
  'materiel-professionnel': 13,
};

export const CATEGORY_ID_TO_SLUG = Object.fromEntries(
  Object.entries(CATEGORY_SLUG_TO_ID).map(([slug, id]) => [id, slug])
);

/** Détermine le slug depuis un categorieId. */
export function getCategorySlug(categorieId) {
  return CATEGORY_ID_TO_SLUG[Number(categorieId)] ?? null;
}

/**
 * Retourne le schéma de filtres pour une combinaison catégorie/sous-catégorie.
 *
 * @param {{ categorieId?: number|null, sousCategorieId?: number|null, taxoAttributs?: Array }} params
 * @returns {Array|null}
 */
export function getFilterSchema({ categorieId, sousCategorieId, taxoAttributs = [] } = {}) {
  const slug = getCategorySlug(categorieId);

  if (slug === 'immobilier' || isImmobilierSousCategorie(sousCategorieId)) {
    return buildImmobilierFilterSchema(sousCategorieId);
  }

  if (slug === 'vehicules' || isVehiculeCategorie(categorieId) || isVehiculeSousCategorie(sousCategorieId)) {
    return buildVehiculeFilterSchema(sousCategorieId);
  }

  if (slug === 'emploi' || isEmploiCategorie(categorieId) || isEmploiSousCategorie(sousCategorieId)) {
    return buildEmploiFilterSchema(sousCategorieId, taxoAttributs);
  }

  return null;
}

/**
 * Retourne true si la catégorie/sous-catégorie a des filtres dynamiques.
 */
export function hasDynamicFilters({ categorieId, sousCategorieId } = {}) {
  const slug = getCategorySlug(categorieId);
  return (
    slug === 'immobilier' ||
    slug === 'vehicules' ||
    slug === 'emploi' ||
    isImmobilierSousCategorie(sousCategorieId) ||
    isVehiculeCategorie(categorieId) ||
    isVehiculeSousCategorie(sousCategorieId) ||
    isEmploiCategorie(categorieId) ||
    isEmploiSousCategorie(sousCategorieId)
  );
}

/**
 * Label de section pour les filtres dynamiques.
 */
export function getDynamicFiltersLabel({ categorieId, sousCategorieId } = {}) {
  const slug = getCategorySlug(categorieId);

  if (slug === 'vehicules' || isVehiculeSousCategorie(sousCategorieId)) {
    const subId = Number(sousCategorieId);
    if (subId === 52) return 'Critères moto';
    return 'Critères véhicule';
  }

  if (slug === 'immobilier' || isImmobilierSousCategorie(sousCategorieId)) {
    const subId = Number(sousCategorieId);
    if (subId === IMMOBILIER_SOUS_CATEGORIES.LOCATIONS) return 'Critères location';
    if (subId === IMMOBILIER_SOUS_CATEGORIES.COLOCATIONS) return 'Critères colocation';
    if (subId === IMMOBILIER_SOUS_CATEGORIES.BUREAUX) return 'Critères bureaux/commerces';
    return 'Critères du bien';
  }

  if (slug === 'emploi' || isEmploiCategorie(categorieId) || isEmploiSousCategorie(sousCategorieId)) {
    const subId = Number(sousCategorieId);
    if (subId === EMPLOI_SOUS_CATEGORIES.OFFRE_FORMATION) return 'Critères formation';
    if (subId === EMPLOI_SOUS_CATEGORIES.OFFRE_CANDIDATURE) return 'Critères candidature';
    if (subId === EMPLOI_SOUS_CATEGORIES.OFFRE_EMPLOI) return "Critères d'emploi";
    return 'Critères emploi';
  }

  return 'Critères';
}
