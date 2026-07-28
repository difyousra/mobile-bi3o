const T = { TEXT: "TEXT", NUMBER: "NUMBER", DATE: "DATE" };

const select = (name, label, options = {}) => ({
  name,
  label,
  type: T.TEXT,
  control: "combobox",
  preferTaxoAttrId: true,
  ...options,
});

const chips = (name, label, options = {}) =>
  select(name, label, {
    control: "choice-chips",
    chipVariant: "outline",
    ...options,
  });

const offreEmploi = {
  id: 10,
  slug: "offre-emploi",
  label: "Offres d'emploi",
  photosOptional: true,
  priceOptional: true,
  fields: [
    chips("typeContrat", "Type de contrat", {
      required: true,
      chipVariant: "filled",
      taxoKey: "type_de_contrat",
      taxoAliases: ["type_de_contrat"],
    }),
    select("secteurActivite", "Secteur d'activité", {
      required: true,
      taxoKey: "secteur_d_activite",
      taxoAliases: ["secteur_d_activite", "secteur_activite"],
    }),
    select("metier", "Métier / poste", {
      required: true,
      taxoKey: "metier",
      taxoAliases: ["metier", "poste"],
    }),
    chips("experienceRequise", "Expérience requise", {
      required: true,
      taxoKey: "experience",
      taxoAliases: ["experience", "experience_requise"],
    }),
    chips("niveauEtudes", "Niveau d'études", {
      required: true,
      taxoKey: "niveau_d_etudes",
      taxoAliases: ["niveau_d_etudes", "niveau_etudes"],
    }),
    chips("tempsTravail", "Temps de travail", {
      required: true,
      taxoKey: "travail_a",
      taxoAliases: ["travail_a", "temps_de_travail"],
    }),
    {
      name: "salaireBrut",
      label: "Salaire brut",
      type: T.NUMBER,
      control: "clearable-number",
      unit: "DA",
      required: true,
      preferTaxoAttrId: true,
      taxoKey: "salaire_brut",
      taxoAliases: ["salaire_brut", "salaire_horaire"],
    },
    chips("taux", "Taux", {
      required: true,
      taxoKey: "taux",
    }),
  ],
};

const offreFormation = {
  id: 11,
  slug: "offre-formation",
  label: "Offres de formation",
  photosOptional: true,
  priceOptional: true,
  fields: [
    select("domaine_formation", "Domaine de formation", {
      required: true,
      taxoKey: "domaine_formation",
    }),
    chips("type_enseignement", "Type d'enseignement", {
      required: true,
      taxoKey: "type_enseignement",
    }),
    chips("niveau_etude_requis", "Niveau d'études requis", {
      required: true,
      taxoKey: "niveau_etude_requis",
      taxoAliases: ["niveau_etude_requis", "niveau_etude"],
    }),
    chips("public_concerne", "Public concerné", {
      required: true,
      taxoKey: "public_concerne",
    }),
    {
      name: "eligible_cpf",
      label: "Éligible CPF",
      type: T.TEXT,
      control: "switch",
      preferTaxoAttrId: true,
      taxoKey: "eligible_cpf",
      checkedValue: "Oui",
      uncheckedValue: "Non",
    },
    {
      name: "reference",
      label: "Référence",
      type: T.TEXT,
      control: "text",
      preferTaxoAttrId: true,
      taxoKey: "reference",
      placeholder: "Ex: FORM-2026-01",
    },
    {
      name: "date_deposition",
      label: "Date de dépôt",
      type: T.DATE,
      control: "date-month",
      preferTaxoAttrId: true,
      taxoKey: "date_deposition",
    },
    {
      name: "objectif",
      label: "Objectif de la formation",
      type: T.TEXT,
      control: "textarea",
      preferTaxoAttrId: true,
      taxoKey: "objectif",
      placeholder: "Décrivez ce que les participants vont apprendre…",
    },
  ],
};

const offreCandidature = {
  id: 12,
  slug: "offre-candidature",
  label: "Offres de candidature",
  photosOptional: true,
  forceAnnonceType: "DEMANDE",
  fixedPrice: 0,
  hidePriceField: true,
  fields: [
    chips("zoneRecherche", "Zone de recherche", {
      required: true,
      chipVariant: "filled",
      taxoKey: "zone_recherche",
      taxoAliases: ["zone_recherche", "zonerecherche"],
    }),
    chips("fonction", "Fonction recherchée", {
      required: true,
      taxoKey: "ajouter_fonctions",
      taxoAliases: ["ajouter_fonctions", "fonction"],
    }),
    chips("secteur", "Secteur d'activité", {
      required: true,
      taxoKey: "ajouter_secteurs",
      taxoAliases: ["ajouter_secteurs", "secteur"],
    }),
    chips("experience", "Années d'expérience", {
      required: true,
      taxoKey: "ajouter_experience",
      taxoAliases: ["ajouter_experience", "experience"],
    }),
    chips("formation", "Niveau de formation", {
      required: true,
      taxoKey: "ajouter_formation",
      taxoAliases: ["ajouter_formation", "formation"],
    }),
    {
      name: "coordonnees",
      label: "Coordonnées (téléphone)",
      type: T.TEXT,
      control: "text",
      required: true,
      preferTaxoAttrId: true,
      taxoKey: "mes_coordonnees",
      taxoAliases: ["mes_coordonnees", "coordonnees"],
      placeholder: "+213 0550 12 34 56",
    },
    {
      name: "portfolio",
      label: "Lien portfolio (optionnel)",
      type: T.TEXT,
      control: "url",
      preferTaxoAttrId: true,
      taxoKey: "lien_portfolio",
      taxoAliases: ["lien_portfolio", "portfolio"],
      placeholder: "https://mon-portfolio.com",
    },
  ],
};

export const EMPLOI_SUBCATEGORIES = {
  10: offreEmploi,
  11: offreFormation,
  12: offreCandidature,
};

export function getEmploiSubcategoryConfig(sousCategorieId) {
  if (sousCategorieId == null || sousCategorieId === "") return null;
  return EMPLOI_SUBCATEGORIES[Number(sousCategorieId)] || null;
}

export function isEmploiSubcategory(sousCategorieId) {
  return Boolean(getEmploiSubcategoryConfig(sousCategorieId));
}
