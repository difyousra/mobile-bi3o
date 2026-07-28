/**
 * Configuration des formulaires fils — catégorie Maison et jardin.
 * Les champs sont résolus dynamiquement depuis la taxonomie backend.
 */

const taxonomyDynamic = (id, slug, label, options = {}) => ({
  id,
  slug,
  label,
  taxonomyDynamic: true,
  tipsI18nKey: "forms.deposit.subforms.maisonJardin",
  primaryKey: options.primaryKey ?? null,
  linkedProductMode: options.linkedProductMode ?? "none",
});

export const MAISON_JARDIN_SUBCATEGORIES = {
  53: taxonomyDynamic(53, "ameublement", "Ameublement", {
    primaryKey: "type",
    linkedProductMode: "ameublement_type_map",
  }),
  54: taxonomyDynamic(54, "papeterie-fournitures", "Papeterie et fournitures"),
  55: taxonomyDynamic(55, "electromenager", "Électroménager", {
    primaryKey: "type",
    linkedProductMode: "prefix_from_primary",
  }),
  56: taxonomyDynamic(56, "arts-de-la-table", "Arts de la table", {
    primaryKey: "univers",
    linkedProductMode: "prefix_from_primary",
  }),
  57: taxonomyDynamic(57, "decoration", "Décoration", {
    primaryKey: "univers",
    linkedProductMode: "prefix_from_primary",
  }),
  58: taxonomyDynamic(58, "linge-maison", "Linge de maison", {
    primaryKey: "type",
    linkedProductMode: "prefix_from_primary",
  }),
  59: taxonomyDynamic(59, "bricolage", "Bricolage", {
    primaryKey: "type",
    linkedProductMode: "prefix_from_primary",
  }),
  60: taxonomyDynamic(60, "jardin-plantes", "Jardin et plantes", {
    primaryKey: "type",
    linkedProductMode: "prefix_from_primary",
  }),
};

export function getMaisonJardinSubcategoryConfig(sousCategorieId) {
  if (sousCategorieId == null || sousCategorieId === "") return null;
  return MAISON_JARDIN_SUBCATEGORIES[Number(sousCategorieId)] || null;
}

export function isMaisonJardinSubcategory(sousCategorieId) {
  return Boolean(getMaisonJardinSubcategoryConfig(sousCategorieId));
}
