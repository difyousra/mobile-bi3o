/**
 * Configuration des formulaires fils — catégorie Matériel professionnel.
 * Aligné sur le nouveau front web (45–46).
 */

const T = { TEXT: "TEXT", NUMBER: "NUMBER", DATE: "DATE" };

const select = (name, label, options = {}) => ({
  name,
  label,
  type: T.TEXT,
  control: "combobox",
  preferTaxoAttrId: true,
  taxoKey: name,
  ...options,
});

const CATEGORIE_MATERIEL_FALLBACK = [
  "materiel_agricole",
  "btp_chantier_gros_oeuvre",
  "poids_lourds",
  "equipements_industriels",
  "equipements_restaurants_hotels",
  "equipements_fournitures_bureau",
  "equipements_commerces_marches",
  "materiel_medical",
];

const tracteur = {
  id: 45,
  slug: "tracteur",
  label: "Tracteur",
  tipsI18nKey: "forms.deposit.subforms.tracteur",
  fields: [
    select("annee_modele", "Année modèle", {
      attrId: 299,
      required: true,
      taxoAliases: ["annee_modele", "annee", "annee_du_modele"],
    }),
    {
      name: "puissance_ch",
      label: "Puissance (ch)",
      attrId: 300,
      type: T.NUMBER,
      control: "clearable-number",
      required: true,
      preferTaxoAttrId: true,
      taxoKey: "puissance_ch",
      taxoAliases: ["puissance_ch", "puissance_cv", "puissance"],
      unit: "ch",
    },
    select("marque", "Marque", { attrId: 301, required: true }),
    {
      name: "heures_h",
      label: "Heures (h)",
      attrId: 302,
      type: T.NUMBER,
      control: "clearable-number",
      preferTaxoAttrId: true,
      taxoKey: "heures_h",
      taxoAliases: ["heures_h", "heures"],
      unit: "h",
    },
    select(
      "duree_disponibilite_pieces_detachees",
      "Durée de disponibilité des pièces détachées",
      {
        attrId: 563,
        taxoAliases: [
          "duree_disponibilite_pieces_detachees",
          "duree_de_disponibilite_des_pieces_detachees",
        ],
      }
    ),
  ],
};

const autreMateriel = {
  id: 46,
  slug: "autre-materiel",
  label: "Autre matériel",
  tipsI18nKey: "forms.deposit.subforms.autreMateriel",
  fields: [
    select("categorie", "Catégorie", {
      attrId: 304,
      required: true,
      taxoAliases: ["categorie", "categorie_materiel", "type_de_materiel"],
      staticOptions: CATEGORIE_MATERIEL_FALLBACK,
    }),
    {
      name: "type_materiel",
      label: "Titre / modèle du matériel",
      attrId: 305,
      type: T.TEXT,
      control: "text",
      required: true,
      preferTaxoAttrId: true,
      taxoKey: "type_materiel",
      taxoAliases: [
        "type_materiel",
        "titre_materiel",
        "titre",
        "titre_du_materiel",
      ],
      placeholder: "Ex: Pelleteuse Caterpillar 320",
    },
    {
      name: "annee_modele",
      label: "Année",
      attrId: 306,
      type: T.NUMBER,
      control: "clearable-number",
      preferTaxoAttrId: true,
      taxoKey: "annee_modele",
      taxoAliases: ["annee_modele", "annee"],
    },
  ],
};

export const MATERIEL_PROFESSIONNEL_SUBCATEGORIES = {
  45: tracteur,
  46: autreMateriel,
};

export function getMaterielProfessionnelSubcategoryConfig(sousCategorieId) {
  if (sousCategorieId == null || sousCategorieId === "") return null;
  return MATERIEL_PROFESSIONNEL_SUBCATEGORIES[Number(sousCategorieId)] || null;
}

export function isMaterielProfessionnelSubcategory(sousCategorieId) {
  return Boolean(getMaterielProfessionnelSubcategoryConfig(sousCategorieId));
}
