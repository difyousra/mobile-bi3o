/**
 * Configuration des formulaires fils — catégorie Mode.
 * Aligné sur le nouveau front web (ids 16–19).
 *
 * Design : listes courtes -> choice-chips, listes longues -> combobox,
 * livraison oui/non -> switch.
 */

const T = { TEXT: "TEXT", NUMBER: "NUMBER", DATE: "DATE" };

const UNIVERS_FEMME = ["femme", "maternité", "maternite"];
const UNIVERS_TAILLE_SPECIFIQUE = ["homme", ...UNIVERS_FEMME, "enfant"];
/** Univers hors Homme/Femme/Maternité/Enfant -> repli taille générique. */
const UNIVERS_TAILLE_FALLBACK = ["mixte", "autre", "unisexe"];

const select = (name, label, options = {}) => ({
  name,
  label,
  type: T.TEXT,
  control: "combobox",
  preferTaxoAttrId: true,
  taxoKey: name,
  ...options,
});

const chips = (name, label, options = {}) =>
  select(name, label, {
    control: "choice-chips",
    chipVariant: "outline",
    ...options,
  });

const livraisonField = {
  name: "livraison",
  label: "Livraison",
  type: T.TEXT,
  control: "switch",
  preferTaxoAttrId: true,
  taxoKey: "livraison",
  checkedValue: "oui",
  uncheckedValue: "non",
};

const vetements = {
  id: 16,
  slug: "vetements",
  label: "Vêtements",
  tipsI18nKey: "forms.deposit.subforms.vetements",
  clearAttributsOnChange: {
    univers: [
      "taille",
      "taille_homme",
      "taille_femme",
      "taille_enfant",
      "style_enfant",
    ],
  },
  fields: [
    chips("univers", "Univers", { attrId: 111, chipVariant: "filled" }),
    chips("style_enfant", "Style enfant", {
      attrId: 1737,
      chipVariant: "filled",
      showWhen: { field: "univers", values: ["enfant"] },
    }),
    select("taille_homme", "Taille", {
      attrId: 112,
      showWhen: { field: "univers", values: ["homme"] },
    }),
    select("taille_femme", "Taille", {
      attrId: 1738,
      showWhen: { field: "univers", values: UNIVERS_FEMME },
    }),
    select("taille_enfant", "Taille", {
      attrId: 1739,
      showWhen: { field: "univers", values: ["enfant"] },
    }),
    select("taille", "Taille", {
      attrId: 112,
      taxoKey: "taille",
      taxoAliases: ["taille", "taille_homme"],
      hideWhen: { field: "univers", values: UNIVERS_TAILLE_SPECIFIQUE },
      showWhen: { field: "univers", values: UNIVERS_TAILLE_FALLBACK },
    }),
    select("type", "Type", { attrId: 423 }),
    select("marque", "Marque", { attrId: 113 }),
    select("couleur", "Couleur", { attrId: 114 }),
    chips("etat", "État", { attrId: 115 }),
    livraisonField,
  ],
};

const chaussures = {
  id: 17,
  slug: "chaussures",
  label: "Chaussures",
  tipsI18nKey: "forms.deposit.subforms.chaussures",
  fields: [
    chips("univers", "Univers", { attrId: 117, chipVariant: "filled" }),
    select("pointure", "Pointure", { attrId: 118 }),
    select("type", "Type", { attrId: 119 }),
    select("marque", "Marque", { attrId: 422 }),
    select("couleur", "Couleur", { attrId: 120 }),
    chips("etat", "État", { attrId: 121 }),
    livraisonField,
  ],
};

const accessoiresBagagerie = {
  id: 18,
  slug: "accessoires-bagagerie",
  label: "Accessoires et bagagerie",
  tipsI18nKey: "forms.deposit.subforms.accessoiresBagagerie",
  fields: [
    chips("univers", "Univers", { attrId: 123, chipVariant: "filled" }),
    select("type", "Type", { attrId: 425 }),
    select("marque", "Marque", { attrId: 124 }),
    select("matiere", "Matière", { attrId: 125 }),
    select("couleur", "Couleur", { attrId: 126 }),
    chips("etat", "État", { attrId: 127 }),
    livraisonField,
  ],
};

const montresBijoux = {
  id: 19,
  slug: "montres-bijoux",
  label: "Montres et bijoux",
  tipsI18nKey: "forms.deposit.subforms.montresBijoux",
  fields: [
    chips("univers", "Univers", { attrId: 129, chipVariant: "filled" }),
    select("type", "Type", { attrId: 424 }),
    select("marque", "Marque", { attrId: 130 }),
    select("matiere", "Matière", { attrId: 131 }),
    chips("etat", "État", { attrId: 132 }),
    livraisonField,
  ],
};

export const MODE_SUBCATEGORIES = {
  16: vetements,
  17: chaussures,
  18: accessoiresBagagerie,
  19: montresBijoux,
};

export function getModeSubcategoryConfig(sousCategorieId) {
  if (sousCategorieId == null || sousCategorieId === "") return null;
  return MODE_SUBCATEGORIES[Number(sousCategorieId)] || null;
}

export function isModeSubcategory(sousCategorieId) {
  return Boolean(getModeSubcategoryConfig(sousCategorieId));
}
