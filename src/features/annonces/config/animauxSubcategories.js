/**
 * Configuration des formulaires fils — catégorie Animaux.
 * Aligné sur le nouveau front web (ids 61–62).
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

const ouiNonSwitch = (name, label, options = {}) => ({
  name,
  label,
  type: T.TEXT,
  control: "switch",
  preferTaxoAttrId: true,
  taxoKey: name,
  checkedValue: "oui",
  uncheckedValue: "non",
  ...options,
});

const TYPE_ANNONCE_OPTIONS = ["vente", "adoption", "perdu", "trouve"];
const NATURE_OFFRE_OPTIONS = ["Vente", "Don (gratuit)", "Saillie"];
const ESPECE_NOUVEAUX = [
  "Hamster",
  "Lapin de compagnie",
  "Souris et rats",
  "Cochon d'Inde",
  "Autres",
];
const ESPECE_EQUIDES = ["Chevaux", "Petits chevaux et poneys"];
const ESPECE_POISSONS = [
  "Poissons d'aquarium",
  "Poisson Perca",
  "Poisson Discus",
  "Crevettes et écrevisses",
  "Carpe Koï",
  "Escargots",
  "Plantes aquatiques",
  "Poissons-chats",
  "Autres poissons",
];
const AGE_OPTIONS = ["moins_de_8_semaines", "plus_de_8_semaines"];

const animauxVivants = {
  id: 61,
  slug: "animaux-vivants",
  label: "Animaux",
  tipsI18nKey: "forms.deposit.subforms.animaux",
  clearAttributsOnChange: {
    typeDAnimal: ["natureOffreDependantTypeAnimal", "especeDependantTypeAnimal"],
  },
  fields: [
    chips("typeAnnonceAnimal", "Type d'annonce", {
      attrId: 402,
      required: true,
      chipVariant: "filled",
      taxoAliases: ["typeAnnonceAnimal", "type_annonce_animal", "typeannonceanimal"],
      staticOptions: TYPE_ANNONCE_OPTIONS,
      preferStaticOptions: true,
    }),
    chips("typeDAnimal", "Type d'animal", {
      attrId: 403,
      required: true,
      chipVariant: "filled",
      taxoKey: "type_d_animal",
      taxoAliases: ["type_d_animal", "type_animal", "typeDAnimal", "typeanimal"],
    }),
    chips("natureOffreDependantTypeAnimal", "Nature de l'offre", {
      attrId: 524,
      dependsOnField: "typeDAnimal",
      hideUntilDependency: true,
      chipVariant: "filled",
      taxoKey: "nature_offre_dependant_type_d_animal",
      taxoAliases: [
        "nature_offre_dependant_type_d_animal",
        "natureOffreDependantTypeAnimal",
      ],
      variantByValue: {
        Chiens: {
          staticOptions: NATURE_OFFRE_OPTIONS,
          preferStaticOptions: true,
          required: true,
        },
        Chats: {
          staticOptions: NATURE_OFFRE_OPTIONS,
          preferStaticOptions: true,
          required: true,
        },
      },
    }),
    select("especeDependantTypeAnimal", "Espèce", {
      attrId: 525,
      dependsOnField: "typeDAnimal",
      hideUntilDependency: true,
      taxoKey: "espece_dependant_type_d_animal",
      taxoAliases: ["espece_dependant_type_d_animal", "especeDependantTypeAnimal"],
      variantByValue: {
        "Nouveaux animaux de compagnie": {
          control: "choice-chips",
          chipVariant: "outline",
          staticOptions: ESPECE_NOUVEAUX,
          preferStaticOptions: true,
          required: true,
        },
        "Equidés": {
          control: "choice-chips",
          chipVariant: "outline",
          staticOptions: ESPECE_EQUIDES,
          preferStaticOptions: true,
          required: true,
        },
        Poissons: {
          control: "combobox",
          staticOptions: ESPECE_POISSONS,
          preferStaticOptions: true,
          required: true,
        },
      },
    }),
    {
      name: "race",
      label: "Race",
      attrId: 404,
      type: T.TEXT,
      control: "text",
      preferTaxoAttrId: true,
      taxoKey: "race",
    },
    chips("age", "Âge", {
      attrId: 405,
      chipVariant: "filled",
      staticOptions: AGE_OPTIONS,
      preferStaticOptions: true,
    }),
    ouiNonSwitch("animalDeRace", "Animal de race", {
      attrId: 406,
      taxoAliases: ["animalDeRace", "animal_de_race", "animalderace"],
    }),
    ouiNonSwitch("vaccine", "Vacciné", {
      attrId: 408,
    }),
    {
      name: "numeroIdentification",
      label: "Numéro d'identification",
      attrId: 407,
      type: T.TEXT,
      control: "text",
      preferTaxoAttrId: true,
      taxoKey: "numeroIdentification",
      taxoAliases: [
        "numeroIdentification",
        "numero_identification",
        "numeroidentification",
      ],
    },
  ],
};

const accessoiresAnimaux = {
  id: 62,
  slug: "accessoires-animaux",
  label: "Accessoires animaux",
  tipsI18nKey: "forms.deposit.subforms.accessoiresAnimaux",
  clearAttributsOnChange: {
    etat: ["type_d_article_neuf_dependant_etat"],
  },
  fields: [
    select("typeAccessoire", "Type d'accessoire", {
      attrId: 409,
      taxoAliases: ["typeAccessoire", "type_accessoire"],
    }),
    chips("animalConcerne", "Animal concerné", {
      attrId: 410,
      chipVariant: "filled",
      taxoAliases: ["animalConcerne", "animal_concerne"],
    }),
    {
      name: "marque",
      label: "Marque",
      attrId: 412,
      type: T.TEXT,
      control: "text",
      preferTaxoAttrId: true,
      taxoKey: "marque",
    },
    chips("taille", "Taille", {
      attrId: 413,
      chipVariant: "filled",
      taxoAliases: ["taille"],
    }),
    chips("etat", "État", {
      attrId: 411,
      required: true,
      taxoAliases: ["etat"],
    }),
    chips("type_d_article_neuf_dependant_etat", "Type d'article neuf", {
      attrId: 561,
      taxoKey: "type_d_article_neuf_dependant_etat",
      taxoAliases: [
        "type_d_article_neuf_dependant_etat",
        "type_d_article_neuf",
        "type_article_neuf_dependant_etat",
        "type_article_neuf",
      ],
      showWhen: { field: "etat", values: ["État neuf"] },
      requiredWhen: { field: "etat", values: ["État neuf"] },
    }),
    {
      name: "quantite",
      label: "Quantité",
      attrId: 562,
      type: T.NUMBER,
      control: "clearable-number",
      required: true,
      preferTaxoAttrId: true,
      taxoKey: "quantite",
    },
  ],
};

export const ANIMAUX_SUBCATEGORIES = {
  61: animauxVivants,
  62: accessoiresAnimaux,
};

export function getAnimauxSubcategoryConfig(sousCategorieId) {
  if (sousCategorieId == null || sousCategorieId === "") return null;
  return ANIMAUX_SUBCATEGORIES[Number(sousCategorieId)] || null;
}

export function isAnimauxSubcategory(sousCategorieId) {
  return Boolean(getAnimauxSubcategoryConfig(sousCategorieId));
}
