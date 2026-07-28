/**
 * Configuration des formulaires fils — catégorie Electronique.
 * Aligné sur `preprod-bi3oo/bi3oo_front_new_design` (ids 32–39).
 *
 * Le moteur mobile réutilise le formulaire dynamique RN existant
 * (`VehicleSubcategoryForm`) qui sait gérer :
 * - combobox / choice-chips
 * - switch
 * - clearable-number
 * - date / date-month
 * - dépendances showWhen / variantByValue / dependsOnField
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

/** Listes courtes (≤ ~8 options) : chips plutôt que combobox. */
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

const boolSwitch = (name, label, options = {}) => ({
  name,
  label,
  type: T.TEXT,
  control: "switch",
  preferTaxoAttrId: true,
  taxoKey: name,
  // Taxo Electronique : LISTE ['true','false'] (pas Oui/Non)
  checkedValue: "true",
  uncheckedValue: "false",
  ...options,
});

const PHONE_BRAND_VARIANTS = {
  Apple: { attrId: 463, taxoKey: "marque_apple", taxoAliases: ["marque_apple"] },
  Huawei: { attrId: 464, taxoKey: "marque_huawei", taxoAliases: ["marque_huawei"] },
  Samsung: { attrId: 465, taxoKey: "marque_samsung", taxoAliases: ["marque_samsung"] },
  Xiaomi: {
    attrId: 466,
    taxoKey: "marque_xiaomi",
    taxoAliases: ["marque_xiaomi", "marque Xiaomi"],
  },
  Alcatel: { attrId: 467, taxoKey: "marque_alcatel", taxoAliases: ["marque_alcatel"] },
  Archos: { attrId: 468, taxoKey: "marque_archos", taxoAliases: ["marque_archos"] },
  Asus: { attrId: 469, taxoKey: "marque_asus", taxoAliases: ["marque_asus"] },
  Blackberry: {
    attrId: 470,
    taxoKey: "marque_blackberry",
    taxoAliases: ["marque_blackberry"],
  },
  Fairphone: { attrId: 471, taxoKey: "marque_fairphone", taxoAliases: ["marque_fairphone"] },
  Google: { attrId: 472, taxoKey: "marque_google", taxoAliases: ["marque_google"] },
  Honor: { attrId: 473, taxoKey: "marque_honor", taxoAliases: ["marque_honor"] },
  HTC: { attrId: 474, taxoKey: "marque_htc", taxoAliases: ["marque_htc"] },
  Lenovo: { attrId: 475, taxoKey: "marque_lenovo", taxoAliases: ["marque_lenovo"] },
  LG: { attrId: 476, taxoKey: "marque_lg", taxoAliases: ["marque_lg"] },
  Microsoft: {
    attrId: 477,
    taxoKey: "marque_microsoft",
    taxoAliases: ["marque_microsoft"],
  },
  Mobiwire: { attrId: 478, taxoKey: "marque_mobiwire", taxoAliases: ["marque_mobiwire"] },
  Motorola: { attrId: 479, taxoKey: "marque_motorola", taxoAliases: ["marque_motorola"] },
  Nokia: { attrId: 480, taxoKey: "marque_nokia", taxoAliases: ["marque_nokia"] },
  "One plus": { attrId: 481, taxoKey: "marque_one_plus", taxoAliases: ["marque_one_plus", "marque one plus"] },
  Oppo: { attrId: 482, taxoKey: "marque_oppo", taxoAliases: ["marque_oppo"] },
  Wiko: { attrId: 483, taxoKey: "marque_wiko", taxoAliases: ["marque_wiko"] },
  ZTE: { attrId: 484, taxoKey: "marque_zte", taxoAliases: ["marque_zte"] },
  Sony: { attrId: 485, taxoKey: "marque_sony", taxoAliases: ["marque_sony"] },
  Autre: { attrId: 486, taxoKey: "marque_autre", taxoAliases: ["marque_autre"] },
};

const CONSOLE_BRAND_VARIANTS = {
  Sony: { attrId: 488, taxoKey: "marque_sony", taxoAliases: ["marque_sony"] },
  Nintendo: { attrId: 489, taxoKey: "marque_nintendo", taxoAliases: ["marque_nintendo"] },
  Microsoft: {
    attrId: 490,
    taxoKey: "marque_microsoft",
    taxoAliases: ["marque_microsoft"],
  },
  Sega: { attrId: 491, taxoKey: "marque_sega", taxoAliases: ["marque_sega"] },
  "Neo-Geo AES": {
    attrId: 492,
    taxoKey: "marque_neo_geo_aes",
    taxoAliases: ["marque_neo_geo_aes", "marque neo-geo aes"],
  },
  Amiga: { attrId: 493, taxoKey: "marque_amiga", taxoAliases: ["marque_amiga"] },
  Atari: { attrId: 494, taxoKey: "marque_atari", taxoAliases: ["marque_atari"] },
  Amstrad: { attrId: 495, taxoKey: "marque_amstrad", taxoAliases: ["marque_amstrad"] },
  Retrogaming: {
    attrId: 496,
    taxoKey: "marque_retrogaming",
    taxoAliases: ["marque_retrogaming"],
  },
  Autre: { attrId: 497, taxoKey: "marque_autre", taxoAliases: ["marque_autre"] },
};

/** Jeux vidéo : mêmes marques, ids taxo 504–513. */
const JEUX_BRAND_VARIANTS = {
  Sony: { attrId: 504, taxoKey: "marque_sony", taxoAliases: ["marque_sony"] },
  Nintendo: {
    attrId: 505,
    taxoKey: "marque_nintendo",
    taxoAliases: ["marque_nintendo"],
  },
  Microsoft: {
    attrId: 506,
    taxoKey: "marque_microsoft",
    taxoAliases: ["marque_microsoft"],
  },
  Sega: { attrId: 507, taxoKey: "marque_sega", taxoAliases: ["marque_sega"] },
  "Neo-Geo AES": {
    attrId: 508,
    taxoKey: "marque_neo_geo_aes",
    taxoAliases: ["marque_neo_geo_aes", "marque neo-geo aes"],
  },
  Amiga: { attrId: 509, taxoKey: "marque_amiga", taxoAliases: ["marque_amiga"] },
  Atari: { attrId: 510, taxoKey: "marque_atari", taxoAliases: ["marque_atari"] },
  Amstrad: { attrId: 511, taxoKey: "marque_amstrad", taxoAliases: ["marque_amstrad"] },
  Retrogaming: {
    attrId: 512,
    taxoKey: "marque_retrogaming",
    taxoAliases: ["marque_retrogaming"],
  },
  Autre: { attrId: 513, taxoKey: "marque_autre", taxoAliases: ["marque_autre"] },
};

const ordinateurs = {
  id: 32,
  slug: "ordinateurs",
  label: "Ordinateurs",
  tipsI18nKey: "forms.deposit.subforms.ordinateurs",
  clearAttributsOnChange: {
    type: ["taille_ecran"],
    sous_garantie_constructeur: ["garantie_jusqua"],
  },
  fields: [
    chips("type", "Type", { attrId: 431, required: true, chipVariant: "filled" }),
    chips("usage", "Usage", { attrId: 171, chipVariant: "filled" }),
    select("marque", "Marque", { attrId: 172 }),
    {
      name: "taille_ecran",
      label: "Taille d'écran",
      type: T.TEXT,
      control: "choice-chips",
      chipVariant: "outline",
      preferTaxoAttrId: true,
      preferTaxoAliases: true,
      dependsOnField: "type",
      hideUntilDependency: true,
      variantByValue: {
        Portable: {
          attrId: 173,
          taxoKey: "taille_ecran_portable",
          taxoAliases: ["taille_ecran_portable", "taille_ecran"],
          required: true,
        },
        Fixe: {
          attrId: 430,
          taxoKey: "taille_ecran_fixe",
          taxoAliases: ["taille_ecran_fixe", "taille_ecran"],
          required: true,
        },
        "Unité centrale (seule)": { hidden: true },
      },
    },
    livraisonField,
    chips("etat", "État", { attrId: 174, required: true }),
    {
      name: "anne_fabrication",
      label: "Année de fabrication",
      attrId: 432,
      type: T.NUMBER,
      control: "clearable-number",
      preferTaxoAttrId: true,
      taxoKey: "anne_fabrication",
      taxoAliases: ["anne_fabrication", "annee_fabrication", "annee_de_fabrication"],
    },
    boolSwitch("numero_serie_lisible", "Numéro de série lisible sur l'appareil", {
      attrId: 433,
      taxoAliases: ["numero_serie_lisible", "numero_de_serie_lisible"],
    }),
    boolSwitch("sous_garantie_constructeur", "Sous garantie constructeur", {
      attrId: 434,
      clearsFields: ["garantie_jusqua"],
    }),
    {
      name: "garantie_jusqua",
      label: "Garantie jusqu'au",
      attrId: 435,
      type: T.DATE,
      control: "date",
      preferTaxoAttrId: true,
      taxoKey: "garantie_jusqua",
      showWhen: { field: "sous_garantie_constructeur", truthy: true },
      requiredWhen: { field: "sous_garantie_constructeur", truthy: true },
    },
  ],
};

const accessoiresInformatiques = {
  id: 33,
  slug: "accessoires-informatiques",
  label: "Accessoires informatiques",
  tipsI18nKey: "forms.deposit.subforms.accessoiresInformatiques",
  fields: [select("produit", "Type de produit", { attrId: 176 }), select("marque", "Marque", { attrId: 436 }), livraisonField, chips("etat", "État", { attrId: 177 })],
};

const tablettesLiseuses = {
  id: 34,
  slug: "tablettes-liseuses",
  label: "Tablettes et liseuses",
  tipsI18nKey: "forms.deposit.subforms.tablettesLiseuses",
  clearAttributsOnChange: {
    produit: ["marque"],
    sous_garantie_constructeur: ["garantie_jusqua"],
  },
  fields: [
    chips("produit", "Produit", { attrId: 437, required: true, chipVariant: "filled" }),
    {
      name: "marque",
      label: "Marque",
      type: T.TEXT,
      control: "choice-chips",
      chipVariant: "outline",
      preferTaxoAttrId: true,
      preferTaxoAliases: true,
      dependsOnField: "produit",
      hideUntilDependency: true,
      variantByValue: {
        Tablette: {
          attrId: 438,
          taxoKey: "marque_tabelette",
          taxoAliases: ["marque_tabelette", "marque_tablette"],
          required: true,
        },
        Liseuse: {
          attrId: 439,
          taxoKey: "marque_liseuse",
          taxoAliases: ["marque_liseuse"],
          required: true,
        },
      },
    },
    chips("taille_ecran", "Taille de l'écran", { attrId: 440 }),
    chips("capacite_stockage", "Capacité de stockage", { attrId: 441 }),
    select("couleur", "Couleur", { attrId: 445 }),
    livraisonField,
    chips("etat", "État", { attrId: 179, required: true }),
    {
      name: "annee_fabrication",
      label: "Année de fabrication",
      attrId: 442,
      type: T.NUMBER,
      control: "clearable-number",
      preferTaxoAttrId: true,
      taxoAliases: ["annee_fabrication", "annee_de_fabrication"],
    },
    boolSwitch("sous_garantie_constructeur", "Sous garantie constructeur", {
      attrId: 443,
      clearsFields: ["garantie_jusqua"],
    }),
    {
      name: "garantie_jusqua",
      label: "Garantie jusqu'à",
      attrId: 444,
      type: T.DATE,
      control: "date-month",
      preferTaxoAttrId: true,
      showWhen: { field: "sous_garantie_constructeur", truthy: true },
      requiredWhen: { field: "sous_garantie_constructeur", truthy: true },
    },
  ],
};

const photoAudioVideo = {
  id: 35,
  slug: "photo-audio-video",
  label: "Photo / audio / vidéo",
  tipsI18nKey: "forms.deposit.subforms.photoAudioVideo",
  clearAttributsOnChange: {
    univers: ["produit"],
    garantie: ["garantie_jusqua"],
  },
  fields: [
    chips("univers", "Univers", { attrId: 181, required: true, chipVariant: "filled" }),
    {
      name: "produit",
      label: "Produit",
      type: T.TEXT,
      control: "choice-chips",
      chipVariant: "outline",
      preferTaxoAttrId: true,
      preferTaxoAliases: true,
      dependsOnField: "univers",
      hideUntilDependency: true,
      variantByValue: {
        "Appareil photo et caméra": {
          attrId: 182,
          taxoKey: "produit_appareil_photo_et_camera",
          taxoAliases: [
            "produit_appareil_photo_et_camera",
            "produit_photo_camera",
            "produit appareil photo et camera",
          ],
          required: true,
        },
        Audio: {
          attrId: 446,
          taxoKey: "produit_audio",
          taxoAliases: ["produit_audio", "produit audio"],
          required: true,
          control: "combobox",
        },
        "Vidéo": {
          attrId: 447,
          taxoKey: "produit_video",
          taxoAliases: ["produit_video", "produit video"],
          required: true,
        },
        Accessoires: {
          attrId: 448,
          taxoKey: "produit_accessoire",
          taxoAliases: ["produit_accessoire", "produit accessoire"],
          required: true,
        },
      },
    },
    chips("taille_ecran", "Taille de l'écran", { attrId: 183 }),
    select("marque", "Marque", { attrId: 184, required: true }),
    select("couleur", "Couleur", { attrId: 453, taxoAliases: ["couleur", "Couleur"] }),
    livraisonField,
    chips("etat", "État", { attrId: 185, required: true }),
    {
      name: "annee_fabrication",
      label: "Année de fabrication",
      attrId: 449,
      type: T.NUMBER,
      control: "clearable-number",
      preferTaxoAttrId: true,
      taxoAliases: ["annee_fabrication", "annee_de_fabrication"],
    },
    boolSwitch("numero_serie_lisible", "Numéro de série lisible", {
      attrId: 450,
      taxoAliases: ["numero_serie_lisible", "numero_de_serie_lisible"],
    }),
    boolSwitch("garantie", "Sous garantie constructeur", {
      attrId: 451,
      taxoKey: "garantie",
      clearsFields: ["garantie_jusqua"],
    }),
    {
      name: "garantie_jusqua",
      label: "Garantie jusqu'à",
      attrId: 452,
      type: T.DATE,
      control: "date-month",
      preferTaxoAttrId: true,
      showWhen: { field: "garantie", truthy: true },
      requiredWhen: { field: "garantie", truthy: true },
    },
  ],
};

const telephonesObjetsConnectes = {
  id: 36,
  slug: "telephones-objets-connectes",
  label: "Téléphones et objets connectés",
  tipsI18nKey: "forms.deposit.subforms.telephonesObjetsConnectes",
  clearAttributsOnChange: {
    sous_garantie_constructeur: ["garantie_jusqua"],
  },
  fields: [
    select("produit", "Produit", { attrId: 457, required: true }),
    select("marque", "Marque", { attrId: 187, required: true }),
    chips("capacite_stockage", "Capacité de stockage", { attrId: 190 }),
    select("couleur", "Couleur", { attrId: 189 }),
    livraisonField,
    chips("etat", "État", { attrId: 191, required: true }),
    {
      name: "annee_fabrication",
      label: "Année de fabrication",
      attrId: 458,
      type: T.NUMBER,
      control: "clearable-number",
      preferTaxoAttrId: true,
      taxoAliases: ["annee_fabrication", "annee_de_fabrication"],
    },
    boolSwitch("numero_serie_lisible", "Numéro de série lisible", {
      attrId: 459,
      taxoAliases: ["numero_serie_lisible", "numero serie lisible"],
    }),
    boolSwitch("sous_garantie_constructeur", "Sous garantie constructeur", {
      attrId: 460,
      taxoAliases: [
        "sous_garantie_constructeur",
        "sous_garantie",
        "sous garantie",
      ],
      clearsFields: ["garantie_jusqua"],
    }),
    {
      name: "garantie_jusqua",
      label: "Garantie jusqu'à",
      attrId: 461,
      type: T.DATE,
      control: "date-month",
      preferTaxoAttrId: true,
      showWhen: { field: "sous_garantie_constructeur", truthy: true },
      requiredWhen: { field: "sous_garantie_constructeur", truthy: true },
    },
  ],
};

const accessoiresTelephone = {
  id: 37,
  slug: "accessoires-telephone",
  label: "Accessoires téléphone",
  tipsI18nKey: "forms.deposit.subforms.accessoiresTelephone",
  clearAttributsOnChange: {
    marque: ["modele"],
  },
  fields: [
    chips("produit", "Produit", { attrId: 462, chipVariant: "filled" }),
    select("marque", "Marque", { attrId: 193 }),
    {
      name: "modele",
      label: "Gamme",
      type: T.TEXT,
      control: "choice-chips",
      chipVariant: "outline",
      preferTaxoAttrId: true,
      preferTaxoAliases: true,
      dependsOnField: "marque",
      hideUntilDependency: true,
      requiredWhen: { field: "marque", values: Object.keys(PHONE_BRAND_VARIANTS) },
      variantByValue: PHONE_BRAND_VARIANTS,
    },
    select("couleur", "Couleur", { attrId: 195 }),
    livraisonField,
    chips("etat", "État", { attrId: 487 }),
  ],
};

const consoles = {
  id: 38,
  slug: "consoles",
  label: "Consoles",
  tipsI18nKey: "forms.deposit.subforms.consoles",
  clearAttributsOnChange: {
    marque: ["modele"],
    sous_garantie_constructeur: ["garantie_jusqua"],
  },
  fields: [
    chips("type", "Type", {
      attrId: 498,
      chipVariant: "filled",
      staticOptions: ["Console", "Accessoires"],
      preferStaticOptions: true,
    }),
    select("marque", "Marque", { attrId: 197, required: true }),
    {
      name: "modele",
      label: "Modèle",
      type: T.TEXT,
      control: "combobox",
      preferTaxoAttrId: true,
      preferTaxoAliases: true,
      dependsOnField: "marque",
      hideUntilDependency: true,
      requiredWhen: { field: "marque", values: Object.keys(CONSOLE_BRAND_VARIANTS) },
      variantByValue: CONSOLE_BRAND_VARIANTS,
    },
    select("couleur", "Couleur", { attrId: 499 }),
    {
      name: "annee_fabrication",
      label: "Année de fabrication",
      attrId: 502,
      type: T.NUMBER,
      control: "clearable-number",
      preferTaxoAttrId: true,
      taxoAliases: ["annee_fabrication", "annee_de_fabrication"],
    },
    boolSwitch("numero_serie_lisible", "Numéro de série lisible", {
      attrId: 500,
      taxoAliases: ["numero_serie_lisible", "numero_de_serie_lisible"],
    }),
    boolSwitch("sous_garantie_constructeur", "Sous garantie constructeur", {
      attrId: 501,
      taxoAliases: ["sous_garantie_constructeur", "sous_garantie"],
      clearsFields: ["garantie_jusqua"],
    }),
    {
      name: "garantie_jusqua",
      label: "Garantie jusqu'à",
      attrId: 503,
      type: T.DATE,
      control: "date-month",
      preferTaxoAttrId: true,
      showWhen: { field: "sous_garantie_constructeur", truthy: true },
      requiredWhen: { field: "sous_garantie_constructeur", truthy: true },
    },
    livraisonField,
    chips("etat", "État", { attrId: 199, required: true }),
  ],
};

const jeuxVideo = {
  id: 39,
  slug: "jeux-video",
  label: "Jeux vidéo",
  tipsI18nKey: "forms.deposit.subforms.jeuxVideo",
  clearAttributsOnChange: {
    marque: ["modele"],
  },
  fields: [
    select("marque", "Marque", { attrId: 201, required: true }),
    {
      name: "modele",
      label: "Modèle",
      type: T.TEXT,
      control: "combobox",
      preferTaxoAttrId: true,
      preferTaxoAliases: true,
      dependsOnField: "marque",
      hideUntilDependency: true,
      requiredWhen: { field: "marque", values: Object.keys(JEUX_BRAND_VARIANTS) },
      variantByValue: JEUX_BRAND_VARIANTS,
    },
    livraisonField,
    chips("etat", "État", { attrId: 203, required: true }),
  ],
};

export const ELECTRONIQUE_SUBCATEGORIES = {
  32: ordinateurs,
  33: accessoiresInformatiques,
  34: tablettesLiseuses,
  35: photoAudioVideo,
  36: telephonesObjetsConnectes,
  37: accessoiresTelephone,
  38: consoles,
  39: jeuxVideo,
};

export function getElectroniqueSubcategoryConfig(sousCategorieId) {
  if (sousCategorieId == null || sousCategorieId === "") return null;
  return ELECTRONIQUE_SUBCATEGORIES[Number(sousCategorieId)] || null;
}

export function isElectroniqueSubcategory(sousCategorieId) {
  return Boolean(getElectroniqueSubcategoryConfig(sousCategorieId));
}

