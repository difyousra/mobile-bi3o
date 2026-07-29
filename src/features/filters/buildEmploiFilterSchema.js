/**
 * Schéma de filtres Emploi — aligné sur le web (buildEmploiFilterSchema.js).
 * Sous-catégories : Offre d'emploi (10), Formation (11), Candidature (12).
 */
import {
  EMPLOI_SOUS_CATEGORIES,
  EMPLOI_SUBCATEGORY_IDS,
  getEmploiAttributeIds,
  EMPLOI_TYPES_CONTRAT,
  EMPLOI_SECTEURS_ACTIVITE,
  EMPLOI_NIVEAUX_ETUDES,
  EMPLOI_NIVEAUX_EXPERIENCE,
  EMPLOI_TEMPS_TRAVAIL,
  EMPLOI_TAUX_OPTIONS,
} from './emploiFilterAttributes';
import { normalizeTaxoName } from '../annonces/utils/taxoHelpers';
import { flattenPossibleValues } from '../annonces/utils/maisonJardinTaxonomyHelpers';

const SALARY_RANGE = {
  id: 'salary',
  type: 'range',
  label: 'Salaire',
  minParam: 'salaryMin',
  maxParam: 'salaryMax',
  currency: 'Da',
  api: { kind: 'price' },
};

function resolveTaxoOptions(taxoAttributs, aliases, fallback = []) {
  if (!taxoAttributs?.length) return fallback;
  const attr = (taxoAttributs || []).find((a) =>
    aliases.some((alias) => normalizeTaxoName(a?.nom) === normalizeTaxoName(alias))
  );
  if (!attr) return fallback;
  const values = flattenPossibleValues(attr?.valeursPossibles || []).filter(Boolean);
  return values.length ? [...new Set(values)] : fallback;
}

function resolveAttrId(taxoAttributs, aliases, fallbackId = null) {
  const attr = (taxoAttributs || []).find((a) =>
    aliases.some((alias) => normalizeTaxoName(a?.nom) === normalizeTaxoName(alias))
  );
  if (attr?.id != null) return Number(attr.id);
  return fallbackId != null ? Number(fallbackId) : null;
}

function toOpts(values = []) {
  return values.map((v) => ({ value: v, label: v }));
}

function listField({
  id,
  label,
  param,
  options,
  attributeId,
  type = 'select',
  selectionMode,
  placeholder,
}) {
  if (!options?.length || !attributeId) return null;
  return {
    id,
    type,
    label,
    param: param || id,
    placeholder,
    selectionMode,
    options: type === 'select' || type === 'buttons' ? toOpts(options) : options,
    api: {
      kind: 'attribute',
      attributeId: Number(attributeId),
      attributeType: 'LISTE',
    },
  };
}

function buildOffreEmploiSchema(taxoAttributs = []) {
  const attrs = getEmploiAttributeIds(EMPLOI_SOUS_CATEGORIES.OFFRE_EMPLOI);

  const typeContrat = resolveTaxoOptions(
    taxoAttributs,
    ['type_de_contrat', 'typeContrat'],
    EMPLOI_TYPES_CONTRAT
  );
  const secteurs = resolveTaxoOptions(
    taxoAttributs,
    ['secteur_d_activite', 'secteur_activite', 'secteurActivite'],
    EMPLOI_SECTEURS_ACTIVITE
  );
  const metiers = resolveTaxoOptions(taxoAttributs, ['metier', 'poste'], []);
  const experience = resolveTaxoOptions(
    taxoAttributs,
    ['experience', 'experience_requise', 'experienceRequise'],
    EMPLOI_NIVEAUX_EXPERIENCE
  );
  const niveaux = resolveTaxoOptions(
    taxoAttributs,
    ['niveau_d_etudes', 'niveau_etudes', 'niveauEtudes'],
    EMPLOI_NIVEAUX_ETUDES
  );
  const temps = resolveTaxoOptions(
    taxoAttributs,
    ['travail_a', 'temps_de_travail', 'tempsTravail'],
    EMPLOI_TEMPS_TRAVAIL
  );
  const taux = resolveTaxoOptions(taxoAttributs, ['taux'], EMPLOI_TAUX_OPTIONS);

  return [
    listField({
      id: 'typeContrat',
      label: 'Type de contrat',
      options: typeContrat,
      attributeId: resolveAttrId(taxoAttributs, ['type_de_contrat'], attrs.typeContrat),
      type: 'buttons',
      selectionMode: 'multi',
    }),
    listField({
      id: 'secteurActivite',
      label: "Secteur d'activité",
      options: secteurs,
      attributeId: resolveAttrId(
        taxoAttributs,
        ['secteur_d_activite', 'secteur_activite'],
        attrs.secteurActivite
      ),
      type: 'select',
      placeholder: 'Tous les secteurs',
    }),
    listField({
      id: 'metier',
      label: 'Métier / poste',
      options: metiers.length ? metiers : ['Autre'],
      attributeId: resolveAttrId(taxoAttributs, ['metier', 'poste'], attrs.metier),
      type: 'select',
      placeholder: 'Tous les métiers',
    }),
    listField({
      id: 'experienceRequise',
      label: 'Expérience requise',
      options: experience,
      attributeId: resolveAttrId(
        taxoAttributs,
        ['experience', 'experience_requise'],
        attrs.experienceRequise
      ),
      type: 'buttons',
      selectionMode: 'multi',
    }),
    listField({
      id: 'niveauEtudes',
      label: "Niveau d'études",
      options: niveaux,
      attributeId: resolveAttrId(
        taxoAttributs,
        ['niveau_d_etudes', 'niveau_etudes'],
        attrs.niveauEtudes
      ),
      type: 'buttons',
      selectionMode: 'multi',
    }),
    listField({
      id: 'tempsTravail',
      label: 'Temps de travail',
      options: temps,
      attributeId: resolveAttrId(
        taxoAttributs,
        ['travail_a', 'temps_de_travail'],
        attrs.tempsTravail
      ),
      type: 'buttons',
    }),
    listField({
      id: 'taux',
      label: 'Taux',
      options: taux,
      attributeId: resolveAttrId(taxoAttributs, ['taux'], null),
      type: 'buttons',
    }),
    SALARY_RANGE,
  ].filter(Boolean);
}

function buildFormationSchema(taxoAttributs = []) {
  const domaine = resolveTaxoOptions(taxoAttributs, ['domaine_formation'], []);
  const typeEns = resolveTaxoOptions(taxoAttributs, ['type_enseignement'], []);
  const niveau = resolveTaxoOptions(
    taxoAttributs,
    ['niveau_etude_requis', 'niveau_etude'],
    EMPLOI_NIVEAUX_ETUDES
  );
  const publicC = resolveTaxoOptions(taxoAttributs, ['public_concerne'], []);
  const cpf = resolveTaxoOptions(taxoAttributs, ['eligible_cpf'], ['Oui', 'Non']);

  return [
    listField({
      id: 'domaine_formation',
      label: 'Domaine de formation',
      options: domaine.length ? domaine : ['Autre'],
      attributeId: resolveAttrId(taxoAttributs, ['domaine_formation'], null),
      type: 'select',
      placeholder: 'Tous les domaines',
    }),
    listField({
      id: 'type_enseignement',
      label: "Type d'enseignement",
      options: typeEns.length ? typeEns : ['Présentiel', 'Distanciel', 'Hybride'],
      attributeId: resolveAttrId(taxoAttributs, ['type_enseignement'], null),
      type: 'buttons',
      selectionMode: 'multi',
    }),
    listField({
      id: 'niveau_etude_requis',
      label: "Niveau d'études requis",
      options: niveau,
      attributeId: resolveAttrId(taxoAttributs, ['niveau_etude_requis', 'niveau_etude'], null),
      type: 'buttons',
      selectionMode: 'multi',
    }),
    listField({
      id: 'public_concerne',
      label: 'Public concerné',
      options: publicC.length ? publicC : ['Salariés', 'Demandeurs d\'emploi', 'Étudiants', 'Tout public'],
      attributeId: resolveAttrId(taxoAttributs, ['public_concerne'], null),
      type: 'buttons',
      selectionMode: 'multi',
    }),
    listField({
      id: 'eligible_cpf',
      label: 'Éligible CPF',
      options: cpf,
      attributeId: resolveAttrId(taxoAttributs, ['eligible_cpf'], null),
      type: 'buttons',
    }),
    SALARY_RANGE,
  ].filter(Boolean);
}

function buildCandidatureSchema(taxoAttributs = []) {
  const zone = resolveTaxoOptions(taxoAttributs, ['zone_recherche', 'zonerecherche'], []);
  const fonction = resolveTaxoOptions(taxoAttributs, ['ajouter_fonctions', 'fonction'], []);
  const secteur = resolveTaxoOptions(
    taxoAttributs,
    ['ajouter_secteurs', 'secteur'],
    EMPLOI_SECTEURS_ACTIVITE
  );
  const experience = resolveTaxoOptions(
    taxoAttributs,
    ['ajouter_experience', 'experience'],
    EMPLOI_NIVEAUX_EXPERIENCE
  );
  const formation = resolveTaxoOptions(
    taxoAttributs,
    ['ajouter_formation', 'formation'],
    EMPLOI_NIVEAUX_ETUDES
  );

  return [
    listField({
      id: 'zoneRecherche',
      label: 'Zone de recherche',
      options: zone.length ? zone : ['Nationale', 'Wilaya', 'Internationale'],
      attributeId: resolveAttrId(taxoAttributs, ['zone_recherche', 'zonerecherche'], null),
      type: 'buttons',
      selectionMode: 'multi',
    }),
    listField({
      id: 'fonction',
      label: 'Fonction recherchée',
      options: fonction.length ? fonction : ['Autre'],
      attributeId: resolveAttrId(taxoAttributs, ['ajouter_fonctions', 'fonction'], null),
      type: 'select',
      placeholder: 'Toutes les fonctions',
    }),
    listField({
      id: 'secteur',
      label: "Secteur d'activité",
      options: secteur,
      attributeId: resolveAttrId(taxoAttributs, ['ajouter_secteurs', 'secteur'], null),
      type: 'select',
      placeholder: 'Tous les secteurs',
    }),
    listField({
      id: 'experience',
      label: "Années d'expérience",
      options: experience,
      attributeId: resolveAttrId(taxoAttributs, ['ajouter_experience', 'experience'], null),
      type: 'buttons',
      selectionMode: 'multi',
    }),
    listField({
      id: 'formation',
      label: 'Niveau de formation',
      options: formation,
      attributeId: resolveAttrId(taxoAttributs, ['ajouter_formation', 'formation'], null),
      type: 'buttons',
      selectionMode: 'multi',
    }),
    SALARY_RANGE,
  ].filter(Boolean);
}

/**
 * @param {number|string|null} sousCategorieId
 * @param {Array} taxoAttributs
 * @returns {Array}
 */
export function buildEmploiFilterSchema(sousCategorieId = null, taxoAttributs = []) {
  const id = sousCategorieId != null && sousCategorieId !== '' ? Number(sousCategorieId) : null;

  if (id && EMPLOI_SUBCATEGORY_IDS.has(id)) {
    if (id === EMPLOI_SOUS_CATEGORIES.OFFRE_EMPLOI) return buildOffreEmploiSchema(taxoAttributs);
    if (id === EMPLOI_SOUS_CATEGORIES.OFFRE_FORMATION) return buildFormationSchema(taxoAttributs);
    if (id === EMPLOI_SOUS_CATEGORIES.OFFRE_CANDIDATURE) return buildCandidatureSchema(taxoAttributs);
  }

  // Niveau catégorie Emploi (sans sous-catégorie) : salaire seulement
  return [SALARY_RANGE];
}
