/** IDs sous-catégories et attributs Emploi — alignés sur le web. */

export const EMPLOI_CATEGORIE_ID = 7;

export const EMPLOI_SOUS_CATEGORIES = {
  OFFRE_EMPLOI: 10,
  OFFRE_FORMATION: 11,
  OFFRE_CANDIDATURE: 12,
};

export const EMPLOI_SUBCATEGORY_IDS = new Set(Object.values(EMPLOI_SOUS_CATEGORIES));

export const EMPLOI_OFFRE_EMPLOI_ATTR = {
  typeContrat: 74,
  metier: 75,
  experienceRequise: 76,
  niveauEtudes: 77,
  tempsTravail: 78,
  salaire: 79,
  secteurActivite: 311,
};

export const EMPLOI_TYPES_CONTRAT = [
  'CDI', 'CDD', 'Stage', 'Freelance', 'Alternance', 'Intérim', 'Saisonnier', 'Autre',
];

export const EMPLOI_SECTEURS_ACTIVITE = [
  'Informatique / Télécoms',
  'Commerce / Vente',
  'Banque / Assurance',
  'Industrie / Production',
  'BTP / Construction',
  'Transport / Logistique',
  'Tourisme / Hôtellerie / Restauration',
  'Santé / Social',
  'Éducation / Formation',
  'Administration / Secteur public',
  'Marketing / Communication',
  'Autre',
];

export const EMPLOI_NIVEAUX_ETUDES = [
  'Sans diplôme',
  'BEP/CAP',
  'Baccalauréat',
  'Bac +2',
  'Licence (Bac +3)',
  'Master (Bac +5)',
  'Doctorat (Bac +8)',
  'Autre',
];

export const EMPLOI_NIVEAUX_EXPERIENCE = [
  'Débutant (0-1 an)',
  'Junior (1-3 ans)',
  'Confirmé (3-5 ans)',
  'Senior (5-10 ans)',
  'Expert (10+ ans)',
  'Non spécifié',
];

export const EMPLOI_TEMPS_TRAVAIL = [
  'Temps plein',
  'Temps partiel',
  'Temps plein ou temps partiel',
];

export const EMPLOI_TAUX_OPTIONS = ['Horaire', 'Mensuel', 'Annuel'];

export const EMPLOI_FIELD_STATIC_FALLBACKS = {
  typeContrat: EMPLOI_TYPES_CONTRAT,
  secteurActivite: EMPLOI_SECTEURS_ACTIVITE,
  experienceRequise: EMPLOI_NIVEAUX_EXPERIENCE,
  niveauEtudes: EMPLOI_NIVEAUX_ETUDES,
  tempsTravail: EMPLOI_TEMPS_TRAVAIL,
  taux: EMPLOI_TAUX_OPTIONS,
};

export function isEmploiCategorie(categorieId) {
  return Number(categorieId) === EMPLOI_CATEGORIE_ID;
}

export function isEmploiSousCategorie(sousCategorieId) {
  return EMPLOI_SUBCATEGORY_IDS.has(Number(sousCategorieId));
}

export function getEmploiAttributeIds(sousCategorieId) {
  const id = Number(sousCategorieId);
  if (id === EMPLOI_SOUS_CATEGORIES.OFFRE_EMPLOI) {
    return { ...EMPLOI_OFFRE_EMPLOI_ATTR };
  }
  return {};
}
