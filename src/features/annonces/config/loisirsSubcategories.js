/**
 * Configuration des formulaires fils — catégorie Loisirs (ids 20–31, 89).
 * Aligné sur le nouveau front web.
 *
 * Design : listes courtes -> choice-chips, listes longues -> combobox,
 * livraison oui/non -> switch, quantité -> clearable-number.
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

const chips = (name, label, options = {}) =>
  select(name, label, {
    control: "choice-chips",
    chipVariant: "outline",
    ...options,
  });

const livraison = {
  name: "livraison",
  label: "Livraison",
  type: T.TEXT,
  control: "switch",
  preferTaxoAttrId: true,
  taxoKey: "livraison",
  checkedValue: "oui",
  uncheckedValue: "non",
};

const dureePieces = select(
  "duree_disponibilite_pieces_detachees",
  "Durée de disponibilité des pièces détachées",
  {
    required: true,
    taxoAliases: [
      "duree_disponibilite_pieces_detachees",
      "duree_de_disponibilite_des_pieces_detachees",
    ],
  }
);

const quantite = {
  name: "quantite",
  label: "Quantité",
  type: T.NUMBER,
  control: "clearable-number",
  preferTaxoAttrId: true,
  taxoKey: "quantite",
  required: true,
};

const commons = ({ withDuree = false } = {}) => [
  livraison,
  ...(withDuree ? [dureePieces] : []),
  quantite,
];

const antiquites = {
  id: 20,
  slug: "antiquites",
  label: "Antiquités",
  tipsI18nKey: "forms.deposit.subforms.antiquites",
  fields: [
    select("produit", "Produit", { required: true }),
    select("matiere", "Matière", { required: true }),
    chips("epoque", "Époque", { required: true, chipVariant: "filled" }),
    select("style", "Style", { required: true }),
    chips("etat", "État", { attrId: 134, required: true }),
    ...commons(),
  ],
};

const collection = {
  id: 21,
  slug: "collection",
  label: "Collection",
  tipsI18nKey: "forms.deposit.subforms.collection",
  fields: [
    select("produit", "Produit", {
      attrId: 136,
      required: true,
      taxoAliases: ["produit", "type"],
    }),
    chips("epoque", "Époque", { required: true, chipVariant: "filled" }),
    chips("conditionnement", "Conditionnement", { required: true }),
    chips("etat", "État", { attrId: 137, required: true }),
    ...commons(),
  ],
};

const cdMusique = {
  id: 22,
  slug: "cd-musique",
  label: "CD et musique",
  tipsI18nKey: "forms.deposit.subforms.cdMusique",
  fields: [
    chips("support", "Support", { required: true, chipVariant: "filled" }),
    select("genre", "Genre", { required: true }),
    chips("etat", "État", { attrId: 139, required: true }),
    ...commons(),
  ],
};

const dvdFilms = {
  id: 23,
  slug: "dvd-films",
  label: "DVD et films",
  tipsI18nKey: "forms.deposit.subforms.dvdFilms",
  fields: [
    chips("support", "Support", { required: true, chipVariant: "filled" }),
    select("genre", "Genre", { required: true }),
    chips("edition_version", "Édition / version", { required: true }),
    chips("packaging_boitier", "Packaging / boîtier", { required: true }),
    chips("etat", "État", { attrId: 141, required: true }),
    ...commons(),
  ],
};

const instrumentsMusique = {
  id: 24,
  slug: "instruments-musique",
  label: "Instruments de musique",
  tipsI18nKey: "forms.deposit.subforms.instrumentsMusique",
  fields: [
    select("univers", "Univers", { attrId: 143, required: true }),
    select("produit", "Produit", { attrId: 144, required: true }),
    select("marque", "Marque", { required: true }),
    chips("niveau", "Niveau", { required: true, chipVariant: "filled" }),
    chips("etat", "État", { attrId: 145, required: true }),
    ...commons({ withDuree: true }),
  ],
};

const livres = {
  id: 25,
  slug: "livres",
  label: "Livres",
  tipsI18nKey: "forms.deposit.subforms.livres",
  fields: [
    chips("format", "Format", { required: true, chipVariant: "filled" }),
    select("genre", "Genre", { attrId: 147, required: true }),
    select("langue", "Langue", { required: true }),
    chips("etat", "État", { attrId: 148, required: true }),
    ...commons(),
  ],
};

const modelisme = {
  id: 26,
  slug: "modelisme",
  label: "Modélisme",
  tipsI18nKey: "forms.deposit.subforms.modelisme",
  fields: [
    chips("produit", "Produit", { required: true, chipVariant: "filled" }),
    select("echelle", "Échelle", { required: true }),
    select("marque", "Marque", { required: true }),
    chips("etat", "État", { attrId: 150, required: true }),
    ...commons({ withDuree: true }),
  ],
};

const jeuxJouets = {
  id: 27,
  slug: "jeux-jouets",
  label: "Jeux et jouets",
  tipsI18nKey: "forms.deposit.subforms.jeuxJouets",
  clearAttributsOnChange: {
    age: ["produits_dependant_age"],
  },
  fields: [
    select("marque", "Marque", { attrId: 152, required: true }),
    chips("age", "Âge", { attrId: 153, required: true, chipVariant: "filled" }),
    select("produits_dependant_age", "Produit", {
      attrId: 154,
      required: true,
      dependsOnField: "age",
      hideUntilDependency: true,
      taxoAliases: [
        "produits_dependant_age",
        "produits",
        "produit_dependant_age",
        "attribut_dependant_age",
        "attribut_dependant_attribut_pere",
      ],
    }),
    chips("etat", "État", { attrId: 155, required: true }),
    ...commons({ withDuree: true }),
  ],
};

const loisirsCreatifs = {
  id: 28,
  slug: "loisirs-creatifs",
  label: "Loisirs créatifs",
  tipsI18nKey: "forms.deposit.subforms.loisirsCreatifs",
  fields: [
    chips("etat", "État", { attrId: 157, required: true }),
    ...commons({ withDuree: true }),
  ],
};

const sportPleinAir = {
  id: 29,
  slug: "sport-plein-air",
  label: "Sport et plein air",
  tipsI18nKey: "forms.deposit.subforms.sportPleinAir",
  fields: [
    select("activite", "Activité", { attrId: 159, required: true }),
    chips("etat", "État", { attrId: 160, required: true }),
    ...commons({ withDuree: true }),
  ],
};

const velos = {
  id: 30,
  slug: "velos",
  label: "Vélos",
  tipsI18nKey: "forms.deposit.subforms.velos",
  fields: [
    chips("univers", "Univers", { attrId: 162, required: true, chipVariant: "filled" }),
    select("type", "Type", { required: true }),
    chips("taille", "Taille", { attrId: 163, required: true }),
    {
      name: "numero_identification_velo",
      label: "Numéro d'identification vélo",
      attrId: 164,
      type: T.TEXT,
      control: "text",
      preferTaxoAttrId: true,
      taxoKey: "numero_identification_velo",
    },
    chips("etat", "État", { attrId: 165, required: true }),
    ...commons({ withDuree: true }),
  ],
};

const equipementsVelos = {
  id: 31,
  slug: "equipements-velos",
  label: "Équipements vélos",
  tipsI18nKey: "forms.deposit.subforms.equipementsVelos",
  fields: [
    chips("univers", "Univers", { attrId: 167, required: true, chipVariant: "filled" }),
    chips("taille", "Taille", { attrId: 168, required: true }),
    chips("etat", "État", { attrId: 169, required: true }),
    ...commons({ withDuree: true }),
  ],
};

const platsGastronomie = {
  id: 89,
  slug: "plats-gastronomie",
  label: "Plats et gastronomie",
  tipsI18nKey: "forms.deposit.subforms.platsGastronomie",
  fields: [
    select("type_de_produit", "Type de produit", {
      required: true,
      taxoAliases: ["type_de_produit", "Type de produit"],
    }),
    select("cuisine", "Cuisine", {
      taxoAliases: ["cuisine", "Cuisine"],
    }),
    {
      name: "regime_alimentaire",
      label: "Régime alimentaire",
      type: T.TEXT,
      control: "multi-select",
      preferTaxoAttrId: true,
      taxoKey: "regime_alimentaire",
      taxoAliases: ["regime_alimentaire", "Régime alimentaire"],
    },
    {
      name: "service_propose",
      label: "Service proposé",
      type: T.TEXT,
      control: "multi-select",
      preferTaxoAttrId: true,
      taxoKey: "service_propose",
      taxoAliases: ["service_propose", "Service proposé"],
    },
    {
      name: "occasion",
      label: "Occasion",
      type: T.TEXT,
      control: "multi-select",
      preferTaxoAttrId: true,
      taxoKey: "occasion",
      taxoAliases: ["occasion", "Occasion"],
    },
    {
      name: "nombre_de_personnes",
      label: "Nombre de personnes",
      type: T.NUMBER,
      control: "clearable-number",
      preferTaxoAttrId: true,
      taxoAliases: ["nombre_de_personnes", "Nombre de personnes"],
    },
    chips("delai_de_preparation", "Délai de préparation", {
      taxoAliases: ["delai_de_preparation", "Délai de préparation"],
      chipVariant: "filled",
    }),
    {
      name: "livraison_disponible",
      label: "Livraison disponible",
      type: T.TEXT,
      control: "switch",
      preferTaxoAttrId: true,
      taxoKey: "livraison_disponible",
      taxoAliases: ["livraison_disponible", "Livraison disponible"],
      checkedValue: "oui",
      uncheckedValue: "non",
    },
  ],
};

export const LOISIRS_SUBCATEGORIES = {
  20: antiquites,
  21: collection,
  22: cdMusique,
  23: dvdFilms,
  24: instrumentsMusique,
  25: livres,
  26: modelisme,
  27: jeuxJouets,
  28: loisirsCreatifs,
  29: sportPleinAir,
  30: velos,
  31: equipementsVelos,
  89: platsGastronomie,
};

export function getLoisirsSubcategoryConfig(sousCategorieId) {
  if (sousCategorieId == null || sousCategorieId === "") return null;
  return LOISIRS_SUBCATEGORIES[Number(sousCategorieId)] || null;
}

export function isLoisirsSubcategory(sousCategorieId) {
  return Boolean(getLoisirsSubcategoryConfig(sousCategorieId));
}
