/**
 * Configuration des formulaires fils — catégorie Service (id 50).
 * Aligné sur le nouveau front web.
 */

const T = { TEXT: "TEXT", NUMBER: "NUMBER", DATE: "DATE" };

const CATEGORIE_FALLBACK = [
  "artistes_musiciens",
  "baby_sitting",
  "billetterie",
  "covoiturage",
  "cours_particuliers",
  "entraide_voisins",
  "evenements",
  "services_personne",
  "services_animaux",
  "services_demenagement",
  "services_reparations_electroniques",
  "services_jardinerie_bricolage",
  "services_evenementiels",
  "autres_services",
];

const service = {
  id: 50,
  slug: "services",
  label: "Services",
  tipsI18nKey: "forms.deposit.subforms.allService",
  fields: [
    {
      name: "categorie",
      label: "Catégorie",
      attrId: 308,
      type: T.TEXT,
      control: "combobox",
      required: true,
      preferTaxoAttrId: true,
      taxoKey: "categorie",
      taxoAliases: ["categorie", "categorie_service", "type_de_service"],
      staticOptions: CATEGORIE_FALLBACK,
    },
    {
      name: "echanges_prets",
      label: "Informations supplémentaires",
      attrId: 309,
      type: T.TEXT,
      control: "textarea",
      preferTaxoAttrId: true,
      taxoKey: "echanges_prets",
      taxoAliases: [
        "echanges_prets",
        "informations_supplementaires",
        "information_supplementaires",
        "infos_supplementaires",
      ],
      placeholder: "Horaires, zone, tarifs, conditions…",
    },
  ],
};

export const SERVICE_SUBCATEGORIES = {
  50: service,
};

export function getServiceSubcategoryConfig(sousCategorieId) {
  if (sousCategorieId == null || sousCategorieId === "") return null;
  return SERVICE_SUBCATEGORIES[Number(sousCategorieId)] || null;
}

export function isServiceSubcategory(sousCategorieId) {
  return Boolean(getServiceSubcategoryConfig(sousCategorieId));
}
