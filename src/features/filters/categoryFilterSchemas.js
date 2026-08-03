/**
 * Dispatcher de schémas de filtres par slug de catégorie.
 * Aligné sur le web : categoryFilterSchemas.js + resolveCategoryFilterSchema.js
 */
import { buildImmobilierFilterSchema } from './buildImmobilierFilterSchema';
import { buildVehiculeFilterSchema } from './buildVehiculeFilterSchema';
import { buildEmploiFilterSchema } from './buildEmploiFilterSchema';
import { buildVacancesFilterSchema } from './buildVacancesFilterSchema';
import { buildElectroniqueFilterSchema } from './buildElectroniqueFilterSchema';
import { buildMaisonJardinFilterSchema } from './buildMaisonJardinFilterSchema';
import { buildFamilleFilterSchema } from './buildFamilleFilterSchema';
import { buildModeFilterSchema } from './buildModeFilterSchema';
import { buildLoisirsFilterSchema } from './buildLoisirsFilterSchema';
import { buildAnimauxFilterSchema } from './buildAnimauxFilterSchema';
import { buildMaterielProFilterSchema } from './buildMaterielProFilterSchema';
import { buildServicesFilterSchema } from './buildServicesFilterSchema';
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
import {
  isVacancesCategorie,
  isVacancesSousCategorie,
  VACANCES_SOUS_CATEGORIES,
} from './vacancesFilterAttributes';
import {
  isElectroniqueCategorie,
  isElectroniqueSousCategorie,
  ELECTRONIQUE_SOUS_CATEGORIES,
} from './electroniqueFilterAttributes';
import {
  isMaisonJardinCategorie,
  isMaisonJardinSousCategorie,
  MAISON_JARDIN_SOUS_CATEGORIES,
} from './maisonJardinFilterAttributes';
import {
  isFamilleCategorie,
  isFamilleSousCategorie,
  FAMILLE_SOUS_CATEGORIES,
} from './familleFilterAttributes';
import {
  isModeCategorie,
  isModeSousCategorie,
  MODE_SOUS_CATEGORIES,
} from './modeFilterAttributes';
import {
  isLoisirsCategorie,
  isLoisirsSousCategorie,
  LOISIRS_SOUS_CATEGORIES,
} from './loisirsFilterAttributes';
import {
  isAnimauxCategorie,
  isAnimauxSousCategorie,
  ANIMAUX_SOUS_CATEGORIES,
} from './animauxFilterAttributes';
import {
  isMaterielProCategorie,
  isMaterielProSousCategorie,
  MATERIEL_PRO_SOUS_CATEGORIES,
} from './materielProFilterAttributes';
import {
  isServicesCategorie,
  isServicesSousCategorie,
  SERVICES_SOUS_CATEGORIES,
} from './servicesFilterAttributes';

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

  if (slug === 'vacances' || isVacancesCategorie(categorieId) || isVacancesSousCategorie(sousCategorieId)) {
    return buildVacancesFilterSchema(sousCategorieId, taxoAttributs);
  }

  if (
    slug === 'electronique' ||
    isElectroniqueCategorie(categorieId) ||
    isElectroniqueSousCategorie(sousCategorieId)
  ) {
    return buildElectroniqueFilterSchema(sousCategorieId, taxoAttributs);
  }

  if (
    slug === 'maison-jardin' ||
    isMaisonJardinCategorie(categorieId) ||
    isMaisonJardinSousCategorie(sousCategorieId)
  ) {
    return buildMaisonJardinFilterSchema(sousCategorieId, taxoAttributs);
  }

  if (
    slug === 'famille' ||
    isFamilleCategorie(categorieId) ||
    isFamilleSousCategorie(sousCategorieId)
  ) {
    return buildFamilleFilterSchema(sousCategorieId, taxoAttributs);
  }

  if (
    slug === 'mode' ||
    isModeCategorie(categorieId) ||
    isModeSousCategorie(sousCategorieId)
  ) {
    return buildModeFilterSchema(sousCategorieId, taxoAttributs);
  }

  if (
    slug === 'loisirs' ||
    isLoisirsCategorie(categorieId) ||
    isLoisirsSousCategorie(sousCategorieId)
  ) {
    return buildLoisirsFilterSchema(sousCategorieId, taxoAttributs);
  }

  if (
    slug === 'animaux' ||
    isAnimauxCategorie(categorieId) ||
    isAnimauxSousCategorie(sousCategorieId)
  ) {
    return buildAnimauxFilterSchema(sousCategorieId, taxoAttributs);
  }

  if (
    slug === 'materiel-professionnel' ||
    isMaterielProCategorie(categorieId) ||
    isMaterielProSousCategorie(sousCategorieId)
  ) {
    return buildMaterielProFilterSchema(sousCategorieId, taxoAttributs);
  }

  if (
    slug === 'services' ||
    isServicesCategorie(categorieId) ||
    isServicesSousCategorie(sousCategorieId)
  ) {
    return buildServicesFilterSchema(sousCategorieId, taxoAttributs);
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
    slug === 'vacances' ||
    slug === 'electronique' ||
    slug === 'maison-jardin' ||
    slug === 'famille' ||
    slug === 'mode' ||
    slug === 'loisirs' ||
    slug === 'animaux' ||
    slug === 'materiel-professionnel' ||
    slug === 'services' ||
    isImmobilierSousCategorie(sousCategorieId) ||
    isVehiculeCategorie(categorieId) ||
    isVehiculeSousCategorie(sousCategorieId) ||
    isEmploiCategorie(categorieId) ||
    isEmploiSousCategorie(sousCategorieId) ||
    isVacancesCategorie(categorieId) ||
    isVacancesSousCategorie(sousCategorieId) ||
    isElectroniqueCategorie(categorieId) ||
    isElectroniqueSousCategorie(sousCategorieId) ||
    isMaisonJardinCategorie(categorieId) ||
    isMaisonJardinSousCategorie(sousCategorieId) ||
    isFamilleCategorie(categorieId) ||
    isFamilleSousCategorie(sousCategorieId) ||
    isModeCategorie(categorieId) ||
    isModeSousCategorie(sousCategorieId) ||
    isLoisirsCategorie(categorieId) ||
    isLoisirsSousCategorie(sousCategorieId) ||
    isAnimauxCategorie(categorieId) ||
    isAnimauxSousCategorie(sousCategorieId) ||
    isMaterielProCategorie(categorieId) ||
    isMaterielProSousCategorie(sousCategorieId) ||
    isServicesCategorie(categorieId) ||
    isServicesSousCategorie(sousCategorieId)
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

  if (slug === 'vacances' || isVacancesCategorie(categorieId) || isVacancesSousCategorie(sousCategorieId)) {
    const subId = Number(sousCategorieId);
    if (subId === VACANCES_SOUS_CATEGORIES.LOCATIONS_SAISONNIERES) {
      return 'Critères location saisonnière';
    }
    if (subId === VACANCES_SOUS_CATEGORIES.AGENCES) return 'Critères agence';
    if (subId === VACANCES_SOUS_CATEGORIES.VISAS) return 'Critères visa';
    return 'Critères vacances';
  }

  if (
    slug === 'electronique' ||
    isElectroniqueCategorie(categorieId) ||
    isElectroniqueSousCategorie(sousCategorieId)
  ) {
    const subId = Number(sousCategorieId);
    if (subId === ELECTRONIQUE_SOUS_CATEGORIES.ORDINATEURS) return 'Critères ordinateurs';
    if (subId === ELECTRONIQUE_SOUS_CATEGORIES.TELEPHONES_OBJETS_CONNECTES) {
      return 'Critères téléphones';
    }
    if (subId === ELECTRONIQUE_SOUS_CATEGORIES.CONSOLES) return 'Critères consoles';
    if (subId === ELECTRONIQUE_SOUS_CATEGORIES.JEUX_VIDEO) return 'Critères jeux vidéo';
    return 'Critères électronique';
  }

  if (
    slug === 'maison-jardin' ||
    isMaisonJardinCategorie(categorieId) ||
    isMaisonJardinSousCategorie(sousCategorieId)
  ) {
    const subId = Number(sousCategorieId);
    if (subId === MAISON_JARDIN_SOUS_CATEGORIES.AMEUBLEMENT) return 'Critères ameublement';
    if (subId === MAISON_JARDIN_SOUS_CATEGORIES.ELECTROMENAGER) return 'Critères électroménager';
    if (subId === MAISON_JARDIN_SOUS_CATEGORIES.JARDIN_PLANTES) return 'Critères jardin';
    if (subId === MAISON_JARDIN_SOUS_CATEGORIES.BRICOLAGE) return 'Critères bricolage';
    return 'Critères maison & jardin';
  }

  if (
    slug === 'famille' ||
    isFamilleCategorie(categorieId) ||
    isFamilleSousCategorie(sousCategorieId)
  ) {
    const subId = Number(sousCategorieId);
    if (subId === FAMILLE_SOUS_CATEGORIES.EQUIPEMENTS_BEBE) return 'Critères équipements bébé';
    if (subId === FAMILLE_SOUS_CATEGORIES.MOBILIERS_ENFANT) return 'Critères mobiliers enfant';
    if (subId === FAMILLE_SOUS_CATEGORIES.VETEMENTS_BEBE) return 'Critères vêtements bébé';
    return 'Critères famille';
  }

  if (
    slug === 'mode' ||
    isModeCategorie(categorieId) ||
    isModeSousCategorie(sousCategorieId)
  ) {
    const subId = Number(sousCategorieId);
    if (subId === MODE_SOUS_CATEGORIES.VETEMENTS) return 'Critères vêtements';
    if (subId === MODE_SOUS_CATEGORIES.CHAUSSURES) return 'Critères chaussures';
    if (subId === MODE_SOUS_CATEGORIES.ACCESSOIRES_BAGAGERIE) {
      return 'Critères accessoires';
    }
    if (subId === MODE_SOUS_CATEGORIES.MONTRES_BIJOUX) return 'Critères montres & bijoux';
    return 'Critères mode';
  }

  if (
    slug === 'loisirs' ||
    isLoisirsCategorie(categorieId) ||
    isLoisirsSousCategorie(sousCategorieId)
  ) {
    const subId = Number(sousCategorieId);
    if (subId === LOISIRS_SOUS_CATEGORIES.VELOS) return 'Critères vélos';
    if (subId === LOISIRS_SOUS_CATEGORIES.SPORT_PLEIN_AIR) return 'Critères sport';
    if (subId === LOISIRS_SOUS_CATEGORIES.LIVRES) return 'Critères livres';
    if (subId === LOISIRS_SOUS_CATEGORIES.JEUX_JOUETS) return 'Critères jeux & jouets';
    if (subId === LOISIRS_SOUS_CATEGORIES.PLATS_GASTRONOMIE) return 'Critères gastronomie';
    return 'Critères loisirs';
  }

  if (
    slug === 'animaux' ||
    isAnimauxCategorie(categorieId) ||
    isAnimauxSousCategorie(sousCategorieId)
  ) {
    const subId = Number(sousCategorieId);
    if (subId === ANIMAUX_SOUS_CATEGORIES.ANIMAUX_VIVANTS) return 'Critères animaux';
    if (subId === ANIMAUX_SOUS_CATEGORIES.ACCESSOIRES_ANIMAUX) {
      return 'Critères accessoires animaux';
    }
    return 'Critères animaux';
  }

  if (
    slug === 'materiel-professionnel' ||
    isMaterielProCategorie(categorieId) ||
    isMaterielProSousCategorie(sousCategorieId)
  ) {
    const subId = Number(sousCategorieId);
    if (subId === MATERIEL_PRO_SOUS_CATEGORIES.TRACTEUR) return 'Critères tracteur';
    if (subId === MATERIEL_PRO_SOUS_CATEGORIES.AUTRE_MATERIEL) {
      return 'Critères autre matériel';
    }
    return 'Critères matériel pro';
  }

  if (
    slug === 'services' ||
    isServicesCategorie(categorieId) ||
    isServicesSousCategorie(sousCategorieId)
  ) {
    const subId = Number(sousCategorieId);
    if (subId === SERVICES_SOUS_CATEGORIES.SERVICES) return 'Critères services';
    return 'Critères services';
  }

  return 'Critères';
}
