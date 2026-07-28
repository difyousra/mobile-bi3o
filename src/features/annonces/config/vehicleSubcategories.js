const T = { TEXT: "TEXT", NUMBER: "NUMBER", DATE: "DATE" };

const BRAND_FALLBACKS_VOITURES = [
  "AUDI",
  "BMW",
  "CITROEN",
  "FIAT",
  "FORD",
  "MERCEDES-BENZ",
  "OPEL",
  "PEUGEOT",
  "RENAULT",
  "VOLKSWAGEN",
  "DACIA",
  "Autre",
];

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

const numberField = (name, label, options = {}) => ({
  name,
  label,
  type: T.NUMBER,
  control: "clearable-number",
  preferTaxoAttrId: true,
  taxoKey: name,
  ...options,
});

const voitures = {
  id: 1,
  slug: "voitures",
  label: "Voitures",
  loadReferentielMarques: true,
  fields: [
    { name: "immatriculation", label: "Numéro d'immatriculation", attrId: 419, type: T.TEXT, control: "text", preferTaxoAttrId: true, taxoKey: "immatriculation" },
    select("marque", "Marque", {
      attrId: 20,
      required: true,
      isBrand: true,
      staticOptions: BRAND_FALLBACKS_VOITURES,
    }),
    select("modele", "Modèle", {
      attrId: 32,
      required: true,
      dependsOnBrand: true,
      useDynamicAttrId: true,
    }),
    select("annee", "Année", {
      attrId: 15,
      required: true,
      taxoAliases: ["annee", "annee_modele", "Année_modèle"],
    }),
    select("energie", "Énergie", {
      attrId: 16,
      required: true,
      taxoAliases: ["energie", "Énergie"],
    }),
    chips("boite_vitesse", "Boîte de vitesse", {
      attrId: 19,
      required: true,
      chipVariant: "filled",
      taxoAliases: ["boite_vitesse", "Boîte_de_vitesse", "boite_de_vitesse"],
    }),
    numberField("kilometrage", "Kilométrage", {
      attrId: 18,
      required: true,
      taxoAliases: ["kilometrage", "Kilométrage"],
      unit: "km",
    }),
    chips("nombre_portes", "Nombre de portes", {
      attrId: 17,
      taxoAliases: ["nombre_portes", "Nombre_de_portes", "nombre_de_portes"],
    }),
    chips("nombre_places", "Nombre de places", {
      attrId: 21,
      taxoAliases: ["nombre_places", "Nombre_de_place(s)", "nombre_de_places"],
    }),
    select("type_vehicule", "Type de véhicule", {
      attrId: 14,
      taxoAliases: ["type_vehicule", "Type_de_véhicule", "type_de_vehicule"],
    }),
    chips("permis", "Permis", {
      attrId: 13,
      chipVariant: "filled",
      taxoAliases: ["permis", "Permis"],
    }),
    select("couleur", "Couleur", {
      attrId: 12,
      taxoAliases: ["couleur", "Couleur"],
    }),
    numberField("puissance_fiscale", "Puissance fiscale", {
      attrId: 23,
      taxoAliases: ["puissance_fiscale", "puissanceFiscale"],
    }),
    numberField("puissance_reelle", "Puissance réelle", {
      attrId: 24,
      taxoAliases: ["puissance_reelle", "puissanceDIN", "puissance_din"],
    }),
    chips("finition", "Finition", { attrId: 25 }),
    { name: "motorisation", label: "Motorisation", attrId: 26, type: T.TEXT, control: "text", preferTaxoAttrId: true },
    chips("etat", "État", {
      attrId: 28,
      taxoAliases: ["etat", "etatVehicule", "etat_vehicule"],
    }),
    chips("sellerie", "Sellerie", { attrId: 31 }),
    { name: "premiere_main", label: "Première main", attrId: 22, type: T.DATE, control: "date-month", preferTaxoAttrId: true, taxoAliases: ["premiere_main", "dateMiseCirculation"] },
    { name: "controle_technique", label: "Contrôle technique", attrId: 33, type: T.DATE, control: "date-month", preferTaxoAttrId: true, taxoAliases: ["controle_technique", "dateControleTechnique"] },
    { name: "equipements", label: "Équipements", attrId: 27, type: T.TEXT, control: "multi-select", preferTaxoAttrId: true, taxoKey: "equipements" },
    { name: "historique_entretien", label: "Historique d'entretien", attrId: null, type: T.TEXT, control: "multi-select", preferTaxoAttrId: true, taxoKey: "historique_entretien", taxoAliases: ["historique_entretien", "historiqueEntretien"] },
    chips("documents", "Documents", { attrId: 3059, chipVariant: "filled", taxoAliases: ["documents", "Documents"] }),
  ],
};

const utilitaires = {
  id: 2,
  slug: "utilitaires",
  label: "Utilitaires",
  fields: [
    { name: "immatriculation", label: "Numéro d'immatriculation", attrId: 47, type: T.TEXT, control: "text", required: true, preferTaxoAttrId: true },
    select("marque", "Marque", { attrId: 48, required: true, isBrand: true }),
    select("modele", "Modèle", { attrId: 49, required: true, dependsOnBrand: true, useDynamicAttrId: true }),
    select("annee", "Année", { attrId: 50, required: true, taxoAliases: ["annee", "anneeModele", "annee_modele"] }),
    { name: "dateMiseEnCirculation", label: "Date de mise en circulation", attrId: 51, type: T.DATE, control: "date-month", required: true, preferTaxoAttrId: true, taxoAliases: ["dateMiseEnCirculation", "dateMiseCirculation"] },
    chips("boiteVitesse", "Boîte de vitesse", { attrId: 52, required: true, chipVariant: "filled", taxoKey: "boite_vitesse", taxoAliases: ["boiteVitesse", "boite_vitesse"] }),
    select("energie", "Énergie", { attrId: 53, required: true }),
    numberField("nombrePortes", "Nombre de portes", { attrId: 54, required: true, taxoAliases: ["nombrePortes", "nombre_portes"] }),
    numberField("nombrePlaces", "Nombre de places", { attrId: 55, required: true, taxoAliases: ["nombrePlaces", "nombre_places"] }),
    numberField("puissanceFiscale", "Puissance fiscale", { attrId: 56, required: true, taxoAliases: ["puissanceFiscale", "puissance_fiscale"] }),
    numberField("puissanceReelle", "Puissance réelle", { attrId: 57, required: true, taxoAliases: ["puissanceReelle", "puissanceDIN", "puissance_din"] }),
    { name: "finition", label: "Finition", attrId: 58, type: T.TEXT, control: "text", preferTaxoAttrId: true },
    { name: "motorisation", label: "Motorisation", attrId: 59, type: T.TEXT, control: "text", preferTaxoAttrId: true },
    numberField("kilometrage", "Kilométrage", { attrId: 60, required: true, unit: "km" }),
    select("couleur", "Couleur", { attrId: 61, required: true }),
    chips("documents", "Documents", { attrId: 2790, chipVariant: "filled", taxoAliases: ["documents", "Documents"] }),
  ],
};

const camion = {
  id: 51,
  slug: "camion",
  label: "Camion",
  fields: [
    { name: "numero_immatriculation", label: "Numéro d'immatriculation", attrId: 315, type: T.TEXT, control: "text", required: true, preferTaxoAttrId: true },
    select("marque", "Marque", { attrId: 316, required: true, isBrand: true }),
    select("modele", "Modèle", { attrId: 317, required: true, dependsOnBrand: true, useDynamicAttrId: true }),
    select("annee_modele", "Année modèle", { attrId: 318, required: true }),
    { name: "date_premiere_mise_en_circulation", label: "Date de première mise en circulation", attrId: 319, type: T.DATE, control: "date-month", preferTaxoAttrId: true },
    chips("boite_vitesse", "Boîte de vitesse", { attrId: 320, chipVariant: "filled" }),
    chips("energie", "Énergie", { attrId: 321 }),
    numberField("nombre_portes", "Nombre de portes", { attrId: 322, taxoAliases: ["nombre_portes", "nb_portes"] }),
    numberField("nombre_places", "Nombre de places", { attrId: 323, taxoAliases: ["nombre_places", "nb_places"] }),
    numberField("puissance_fiscale", "Puissance fiscale", { attrId: 324 }),
    numberField("puissance_din", "Puissance DIN", { attrId: 325 }),
    { name: "finition", label: "Finition", attrId: 326, type: T.TEXT, control: "text", preferTaxoAttrId: true },
    { name: "version", label: "Version", attrId: 327, type: T.TEXT, control: "text", preferTaxoAttrId: true },
    numberField("kilometrage", "Kilométrage", { attrId: 328, required: true, unit: "km" }),
    chips("couleur", "Couleur", { attrId: 329 }),
    select("historique_entretien", "Historique d'entretien", { attrId: 330, control: "multi-dropdown", multi: true }),
    chips("documents", "Documents", { attrId: 3061, chipVariant: "filled", taxoAliases: ["documents", "Documents"] }),
  ],
};

const moto = {
  id: 52,
  slug: "moto",
  label: "Moto",
  fields: [
    select("marque", "Marque", { attrId: 338, required: true, isBrand: true }),
    select("modele", "Modèle", { attrId: 339, required: true, dependsOnBrand: true, useDynamicAttrId: true }),
    select("annee_modele", "Année modèle", { attrId: 340, required: true }),
    { name: "date_premiere_mise_en_circulation", label: "Date de première mise en circulation", attrId: 341, type: T.DATE, control: "date-month", preferTaxoAttrId: true },
    chips("boite_vitesse", "Boîte de vitesse", { attrId: 344, chipVariant: "filled" }),
    numberField("cylindree", "Cylindrée", { attrId: 345, unit: "cm³" }),
    numberField("puissance", "Puissance", { attrId: 346 }),
    select("type", "Type", { attrId: 347 }),
    chips("permis", "Permis", { attrId: 348, chipVariant: "filled" }),
    numberField("kilometrage", "Kilométrage", { attrId: 349, required: true, unit: "km" }),
    select("historique_entretien", "Historique d'entretien", { attrId: 350, control: "multi-dropdown", multi: true }),
    select("couleur", "Couleur", { attrId: 351 }),
    chips("documents", "Documents", { attrId: 3062, chipVariant: "filled", taxoAliases: ["documents", "Documents"] }),
  ],
};

const caravaning = {
  id: 7,
  slug: "caravaning",
  label: "Caravaning",
  fields: [
    chips("type", "Type", { attrId: 312, required: true, chipVariant: "filled" }),
    select("marque", "Marque", { attrId: 314, required: true }),
    select("annee_modele", "Année modèle", { attrId: 69, required: true, taxoAliases: ["annee_modele", "anneeModele"] }),
    numberField("kilometrage", "Kilométrage", { attrId: 70, required: true, unit: "km" }),
    { name: "date_premiere_mise_en_circulation", label: "Date de première mise en circulation", attrId: 71, type: T.DATE, control: "date-month", preferTaxoAttrId: true, taxoAliases: ["date_premiere_mise_en_circulation", "dateMiseCirculation"] },
    { name: "date_fin_validite_controle_technique", label: "Fin de validité du contrôle technique", attrId: 72, type: T.DATE, control: "date-month", preferTaxoAttrId: true, taxoAliases: ["date_fin_validite_controle_technique", "dateFinControleTechnique"] },
    chips("documents", "Documents", { attrId: 3060, chipVariant: "filled", taxoAliases: ["documents", "Documents"] }),
  ],
};

const nautisme = {
  id: 8,
  slug: "nautisme",
  label: "Nautisme",
  fields: [chips("type", "Type", { attrId: 333, required: true, chipVariant: "filled" })],
};

const equipementAuto = {
  id: 9,
  slug: "equipement-auto",
  label: "Équipement auto",
  equipementVariant: "equipement_auto",
  fields: [
    { name: "categorie_equipement", attrId: 335, type: T.TEXT, control: "hidden" },
    chips("type", "Type", { attrId: 336, chipVariant: "filled" }),
  ],
};

const equipementMoto = {
  id: 63,
  slug: "equipement-moto",
  label: "Équipement moto",
  equipementVariant: "equipement_moto",
  fields: [chips("type", "Type", { attrId: 420, chipVariant: "filled" })],
};

const equipementCaravaning = {
  id: 64,
  slug: "equipement-caravaning",
  label: "Équipement caravaning",
  equipementVariant: "equipement_caravaning",
  noDetails: true,
  fields: [],
};

const equipementNautisme = {
  id: 65,
  slug: "equipement-nautisme",
  label: "Équipement nautisme",
  equipementVariant: "equipement_nautisme",
  fields: [chips("type", "Type", { attrId: 421, chipVariant: "filled" })],
};

export const VEHICLE_SUBCATEGORIES = {
  1: voitures,
  2: utilitaires,
  7: caravaning,
  8: nautisme,
  9: equipementAuto,
  51: camion,
  52: moto,
  63: equipementMoto,
  64: equipementCaravaning,
  65: equipementNautisme,
};

export function getVehicleSubcategoryConfig(sousCategorieId) {
  if (sousCategorieId == null || sousCategorieId === "") return null;
  return VEHICLE_SUBCATEGORIES[Number(sousCategorieId)] || null;
}

export function isVehicleSubcategory(sousCategorieId) {
  return Boolean(getVehicleSubcategoryConfig(sousCategorieId));
}
