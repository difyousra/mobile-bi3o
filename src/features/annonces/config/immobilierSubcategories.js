const T = { TEXT: "TEXT", NUMBER: "NUMBER", DATE: "DATE" };

const CARACTERISTIQUES_BUREAU_COMPLET = [
  "Accès PMR",
  "Climatisation",
  "Chauffage au sol",
  "Construction ancienne",
  "Construction récente",
  "Avec garage ou place de parking",
];

const CARACTERISTIQUES_BUREAU_ENTREPOT_CONTENEUR = [
  "Accès PMR",
  "Construction ancienne",
  "Construction récente",
  "Avec garage ou place de parking",
];

const CARACTERISTIQUES_BUREAU_RESTAURATION = [
  "Accès PMR",
  "Climatisation",
  "Chauffage au sol",
  "Construction ancienne",
  "Construction récente",
];

/** Aligné ancien front : nature_du_bien pour maison / terrain / parking — jamais appartement. */
const TYPED_NATURE_BIEN = {
  maison: [
    "Maison individuelle",
    "Maison de ville",
    "Résidence collective",
    "Maison de plain-pied",
    "Ferme",
    "Maison mitoyenne",
    "Villa",
    "Autre",
  ],
  terrain: ["Jardin", "Terrain constructible", "Terrain agricole", "Autre"],
  parking: [
    "Stationnement extérieur",
    "Stationnement couvert",
    "Box ou garage fermé",
    "Autre",
  ],
};

const COMMON_RESIDENTIAL_FIELDS = {
  typeBien: {
    name: "type_bien",
    label: "Type de bien",
    type: T.TEXT,
    control: "type-cards",
    required: true,
    preferTaxoAttrId: true,
    staticOptions: ["Maison", "Appartement", "Terrain", "Parking", "Autre"],
  },
  surfaceHabitable: {
    name: "surface_habitable",
    label: "Surface habitable",
    type: T.NUMBER,
    control: "clearable-number",
    unit: "m²",
    preferTaxoAttrId: true,
  },
  nombrePieces: {
    name: "nombre_pieces",
    label: "Nombre de pièces",
    type: T.NUMBER,
    control: "clearable-number",
    unit: "pièce(s)",
    preferTaxoAttrId: true,
  },
  nombreChambres: {
    name: "nombre_chambres",
    label: "Nombre de chambres",
    type: T.TEXT,
    control: "combobox",
    preferTaxoAttrId: true,
  },
  nombreSallesDeBain: {
    name: "nombre_salles_de_bain",
    label: "Nombre de salles de bain",
    type: T.NUMBER,
    control: "clearable-number",
    preferTaxoAttrId: true,
  },
  cuisine: {
    name: "cuisine",
    label: "Cuisine",
    type: T.TEXT,
    control: "choice-chips",
    preferTaxoAttrId: true,
  },
  meuble: {
    name: "meuble",
    label: "Meublé",
    type: T.TEXT,
    control: "radio",
    preferTaxoAttrId: true,
    staticOptions: ["Non meublé", "Meublé"],
    radioPrompt: "Ce bien est :",
  },
  nombreNiveaux: {
    name: "nombre_niveaux",
    label: "Nombre de niveaux",
    type: T.NUMBER,
    control: "clearable-number",
    preferTaxoAttrId: true,
  },
  etatDuBien: {
    name: "etat_du_bien",
    label: "État du bien",
    type: T.TEXT,
    control: "combobox",
    preferTaxoAttrId: true,
    taxoAliases: ["etat_bien"],
  },
  etageDuBien: {
    name: "etage_du_bien",
    label: "Étage du bien",
    type: T.NUMBER,
    control: "clearable-number",
    preferTaxoAttrId: true,
  },
  nombreEtagesImmeuble: {
    name: "nombre_etages_immeuble",
    label: "Nombre d'étages de l'immeuble",
    type: T.NUMBER,
    control: "clearable-number",
    preferTaxoAttrId: true,
  },
  ascenseur: {
    name: "ascenseur",
    label: "Ascenseur",
    type: T.TEXT,
    control: "switch",
    preferTaxoAttrId: true,
    checkedValue: "Oui",
    uncheckedValue: "Non",
  },
  anneeConstruction: {
    name: "annee_construction",
    label: "Année de construction",
    type: T.TEXT,
    control: "clearable-number",
    preferTaxoAttrId: true,
  },
  natureDuBien: {
    name: "nature_du_bien",
    label: "Nature du bien",
    type: T.TEXT,
    control: "combobox",
    preferTaxoAttrId: true,
    dependsOnField: "type_bien",
    variantByValue: {
      maison: {
        staticOptions: TYPED_NATURE_BIEN.maison,
        preferStaticOptions: true,
      },
      terrain: {
        staticOptions: TYPED_NATURE_BIEN.terrain,
        preferStaticOptions: true,
      },
      parking: {
        staticOptions: TYPED_NATURE_BIEN.parking,
        preferStaticOptions: true,
      },
    },
  },
  caracteristiques: {
    name: "caracteristiques",
    label: "Caractéristiques",
    type: T.TEXT,
    control: "multi-dropdown",
    preferTaxoAttrId: true,
    taxoAliases: ["caracteristique"],
  },
  exterieur: {
    name: "exterieur",
    label: "Extérieur",
    type: T.TEXT,
    control: "multi-dropdown",
    preferTaxoAttrId: true,
    taxoAliases: ["exterieurs"],
  },
  surfaceTotaleTerrain: {
    name: "surface_totale_terrain",
    label: "Surface totale du terrain",
    type: T.NUMBER,
    control: "clearable-number",
    unit: "m²",
    preferTaxoAttrId: true,
  },
  placesParking: {
    name: "places_parking",
    label: "Places de parking",
    type: T.TEXT,
    control: "combobox",
    preferTaxoAttrId: true,
  },
  exposition: {
    name: "exposition",
    label: "Exposition",
    type: T.TEXT,
    control: "combobox",
    preferTaxoAttrId: true,
  },
  piecesAnnexes: {
    name: "pieces_annexes",
    label: "Pièces annexes",
    type: T.TEXT,
    control: "multi-dropdown",
    preferTaxoAttrId: true,
    taxoAliases: ["piece_annexe"],
  },
  disponibleAPartir: {
    name: "disponible_a_partir",
    label: "Disponible à partir",
    type: T.TEXT,
    control: "date-month",
    preferTaxoAttrId: true,
  },
  typeVente: {
    name: "type_vente",
    label: "Type de vente",
    type: T.TEXT,
    control: "choice-chips",
    preferTaxoAttrId: true,
  },
  typeChauffage: {
    name: "type_chauffage",
    label: "Type de chauffage",
    type: T.TEXT,
    control: "combobox",
    preferTaxoAttrId: true,
  },
  modeChauffage: {
    name: "mode_chauffage",
    label: "Mode de chauffage",
    type: T.TEXT,
    control: "combobox",
    preferTaxoAttrId: true,
  },
  classeEnergie: {
    name: "classe_energie",
    label: "Classe énergie",
    type: T.TEXT,
    control: "choice-chips",
    preferTaxoAttrId: true,
  },
  ges: {
    name: "ges",
    label: "GES",
    type: T.TEXT,
    control: "choice-chips",
    preferTaxoAttrId: true,
  },
  estimationMini: {
    name: "estimation_cout_annuel_energie_montant_mini",
    label: "Coût énergie annuel mini",
    type: T.NUMBER,
    control: "clearable-number",
    preferTaxoAttrId: true,
  },
  estimationMaxi: {
    name: "estimation_cout_annuel_energie_montant_maxi",
    label: "Coût énergie annuel maxi",
    type: T.NUMBER,
    control: "clearable-number",
    preferTaxoAttrId: true,
  },
  papiers: {
    name: "papiers",
    label: "Papiers",
    type: T.TEXT,
    control: "choice-chips",
    chipVariant: "filled",
    preferTaxoAttrId: true,
    taxoAliases: ["papier"],
  },
};

const whenTypeBien = (field, values) => ({
  ...field,
  showWhen: { field: "type_bien", values },
});

const saleFields = [
  COMMON_RESIDENTIAL_FIELDS.typeBien,
  whenTypeBien(COMMON_RESIDENTIAL_FIELDS.surfaceHabitable, [
    "maison",
    "appartement",
    "autre",
  ]),
  whenTypeBien(COMMON_RESIDENTIAL_FIELDS.nombrePieces, [
    "maison",
    "appartement",
    "autre",
  ]),
  whenTypeBien(COMMON_RESIDENTIAL_FIELDS.nombreChambres, [
    "maison",
    "appartement",
    "autre",
  ]),
  whenTypeBien(COMMON_RESIDENTIAL_FIELDS.nombreSallesDeBain, [
    "maison",
    "appartement",
    "autre",
  ]),
  whenTypeBien(COMMON_RESIDENTIAL_FIELDS.cuisine, ["maison", "appartement"]),
  whenTypeBien(COMMON_RESIDENTIAL_FIELDS.nombreNiveaux, ["maison"]),
  whenTypeBien(COMMON_RESIDENTIAL_FIELDS.etatDuBien, [
    "maison",
    "appartement",
    "parking",
    "autre",
  ]),
  whenTypeBien(COMMON_RESIDENTIAL_FIELDS.etageDuBien, ["appartement"]),
  whenTypeBien(COMMON_RESIDENTIAL_FIELDS.nombreEtagesImmeuble, ["appartement"]),
  whenTypeBien(COMMON_RESIDENTIAL_FIELDS.ascenseur, ["appartement"]),
  whenTypeBien(COMMON_RESIDENTIAL_FIELDS.anneeConstruction, [
    "maison",
    "appartement",
    "autre",
  ]),
  whenTypeBien(COMMON_RESIDENTIAL_FIELDS.natureDuBien, [
    "maison",
    "terrain",
    "parking",
  ]),
  whenTypeBien(COMMON_RESIDENTIAL_FIELDS.caracteristiques, [
    "maison",
    "appartement",
    "parking",
    "autre",
  ]),
  whenTypeBien(COMMON_RESIDENTIAL_FIELDS.exterieur, [
    "maison",
    "appartement",
    "autre",
  ]),
  whenTypeBien(COMMON_RESIDENTIAL_FIELDS.surfaceTotaleTerrain, [
    "maison",
    "terrain",
    "autre",
  ]),
  whenTypeBien(COMMON_RESIDENTIAL_FIELDS.placesParking, [
    "maison",
    "appartement",
    "parking",
    "autre",
  ]),
  whenTypeBien(COMMON_RESIDENTIAL_FIELDS.exposition, [
    "maison",
    "appartement",
  ]),
  whenTypeBien(COMMON_RESIDENTIAL_FIELDS.piecesAnnexes, [
    "maison",
    "appartement",
  ]),
  whenTypeBien(COMMON_RESIDENTIAL_FIELDS.disponibleAPartir, [
    "maison",
    "appartement",
    "terrain",
    "parking",
    "autre",
  ]),
  whenTypeBien(COMMON_RESIDENTIAL_FIELDS.typeVente, [
    "maison",
    "appartement",
    "autre",
  ]),
  whenTypeBien(COMMON_RESIDENTIAL_FIELDS.modeChauffage, [
    "maison",
    "appartement",
  ]),
  whenTypeBien(COMMON_RESIDENTIAL_FIELDS.typeChauffage, ["appartement"]),
  whenTypeBien(COMMON_RESIDENTIAL_FIELDS.classeEnergie, [
    "maison",
    "appartement",
    "autre",
  ]),
  whenTypeBien(COMMON_RESIDENTIAL_FIELDS.ges, ["maison", "appartement", "autre"]),
  whenTypeBien(COMMON_RESIDENTIAL_FIELDS.estimationMini, [
    "appartement",
    "autre",
  ]),
  whenTypeBien(COMMON_RESIDENTIAL_FIELDS.estimationMaxi, [
    "appartement",
    "autre",
  ]),
  whenTypeBien(COMMON_RESIDENTIAL_FIELDS.papiers, [
    "maison",
    "appartement",
    "terrain",
    "parking",
    "autre",
  ]),
];

const locationFields = [
  COMMON_RESIDENTIAL_FIELDS.typeBien,
  whenTypeBien(COMMON_RESIDENTIAL_FIELDS.surfaceHabitable, [
    "maison",
    "appartement",
    "autre",
  ]),
  whenTypeBien(COMMON_RESIDENTIAL_FIELDS.nombrePieces, [
    "maison",
    "appartement",
    "autre",
  ]),
  whenTypeBien(COMMON_RESIDENTIAL_FIELDS.nombreChambres, [
    "maison",
    "appartement",
    "autre",
  ]),
  whenTypeBien(COMMON_RESIDENTIAL_FIELDS.nombreSallesDeBain, [
    "maison",
    "appartement",
    "autre",
  ]),
  whenTypeBien(COMMON_RESIDENTIAL_FIELDS.cuisine, ["maison", "appartement"]),
  whenTypeBien(COMMON_RESIDENTIAL_FIELDS.meuble, [
    "maison",
    "appartement",
    "autre",
  ]),
  whenTypeBien(COMMON_RESIDENTIAL_FIELDS.nombreNiveaux, ["maison"]),
  whenTypeBien(COMMON_RESIDENTIAL_FIELDS.anneeConstruction, [
    "maison",
    "appartement",
    "autre",
  ]),
  whenTypeBien(COMMON_RESIDENTIAL_FIELDS.natureDuBien, [
    "maison",
    "terrain",
    "parking",
  ]),
  whenTypeBien(COMMON_RESIDENTIAL_FIELDS.caracteristiques, [
    "maison",
    "appartement",
    "parking",
    "autre",
  ]),
  whenTypeBien(COMMON_RESIDENTIAL_FIELDS.exterieur, [
    "maison",
    "appartement",
    "autre",
  ]),
  whenTypeBien(COMMON_RESIDENTIAL_FIELDS.surfaceTotaleTerrain, [
    "maison",
    "terrain",
    "autre",
  ]),
  whenTypeBien(COMMON_RESIDENTIAL_FIELDS.placesParking, [
    "maison",
    "appartement",
    "parking",
    "autre",
  ]),
  whenTypeBien(COMMON_RESIDENTIAL_FIELDS.exposition, [
    "maison",
    "appartement",
  ]),
  whenTypeBien(COMMON_RESIDENTIAL_FIELDS.piecesAnnexes, [
    "maison",
    "appartement",
  ]),
  whenTypeBien(COMMON_RESIDENTIAL_FIELDS.disponibleAPartir, [
    "maison",
    "appartement",
    "terrain",
    "parking",
    "autre",
  ]),
  whenTypeBien(COMMON_RESIDENTIAL_FIELDS.etageDuBien, ["appartement"]),
  whenTypeBien(COMMON_RESIDENTIAL_FIELDS.nombreEtagesImmeuble, ["appartement"]),
  whenTypeBien(COMMON_RESIDENTIAL_FIELDS.ascenseur, ["appartement"]),
  whenTypeBien(COMMON_RESIDENTIAL_FIELDS.typeChauffage, ["appartement"]),
  whenTypeBien(COMMON_RESIDENTIAL_FIELDS.modeChauffage, [
    "maison",
    "appartement",
  ]),
  whenTypeBien(COMMON_RESIDENTIAL_FIELDS.classeEnergie, [
    "maison",
    "appartement",
    "autre",
  ]),
  whenTypeBien(COMMON_RESIDENTIAL_FIELDS.ges, ["maison", "appartement", "autre"]),
];

const colocationFields = [
  COMMON_RESIDENTIAL_FIELDS.typeBien,
  whenTypeBien(COMMON_RESIDENTIAL_FIELDS.surfaceHabitable, [
    "maison",
    "appartement",
    "autre",
  ]),
  whenTypeBien(COMMON_RESIDENTIAL_FIELDS.nombrePieces, [
    "maison",
    "appartement",
    "autre",
  ]),
  whenTypeBien(COMMON_RESIDENTIAL_FIELDS.nombreChambres, [
    "maison",
    "appartement",
    "autre",
  ]),
  whenTypeBien(COMMON_RESIDENTIAL_FIELDS.nombreSallesDeBain, [
    "maison",
    "appartement",
    "autre",
  ]),
  whenTypeBien(COMMON_RESIDENTIAL_FIELDS.meuble, [
    "maison",
    "appartement",
    "autre",
  ]),
  whenTypeBien(
    {
      name: "nombre_colocataires",
      label: "Nombre de colocataires",
      type: T.NUMBER,
      control: "clearable-number",
      preferTaxoAttrId: true,
    },
    ["maison", "appartement", "autre"]
  ),
  whenTypeBien(COMMON_RESIDENTIAL_FIELDS.nombreEtagesImmeuble, ["appartement"]),
  whenTypeBien(COMMON_RESIDENTIAL_FIELDS.etageDuBien, ["appartement"]),
  whenTypeBien(COMMON_RESIDENTIAL_FIELDS.ascenseur, ["appartement"]),
  whenTypeBien(COMMON_RESIDENTIAL_FIELDS.caracteristiques, [
    "maison",
    "appartement",
    "autre",
  ]),
  whenTypeBien(COMMON_RESIDENTIAL_FIELDS.exterieur, [
    "maison",
    "appartement",
    "autre",
  ]),
  whenTypeBien(COMMON_RESIDENTIAL_FIELDS.placesParking, [
    "maison",
    "appartement",
    "autre",
  ]),
  whenTypeBien(COMMON_RESIDENTIAL_FIELDS.disponibleAPartir, [
    "maison",
    "appartement",
    "autre",
  ]),
  whenTypeBien(
    {
      name: "statut_fumeur",
      label: "Statut fumeur",
      type: T.TEXT,
      control: "combobox",
      preferTaxoAttrId: true,
    },
    ["maison", "appartement", "autre"]
  ),
  whenTypeBien(
    {
      name: "animaux_acceptes",
      label: "Animaux acceptés",
      type: T.TEXT,
      control: "combobox",
      preferTaxoAttrId: true,
    },
    ["maison", "appartement", "autre"]
  ),
  whenTypeBien(COMMON_RESIDENTIAL_FIELDS.typeChauffage, [
    "maison",
    "appartement",
    "autre",
  ]),
  whenTypeBien(COMMON_RESIDENTIAL_FIELDS.modeChauffage, [
    "maison",
    "appartement",
    "autre",
  ]),
  whenTypeBien(COMMON_RESIDENTIAL_FIELDS.classeEnergie, [
    "maison",
    "appartement",
    "autre",
  ]),
  whenTypeBien(COMMON_RESIDENTIAL_FIELDS.ges, ["maison", "appartement", "autre"]),
];

const bureauFields = [
  {
    name: "type_transaction",
    label: "Type de transaction",
    type: T.TEXT,
    control: "type-cards",
    required: true,
    preferTaxoAttrId: true,
    staticOptions: ["Vente", "Location"],
  },
  {
    name: "type_activite",
    label: "Type d'activité",
    type: T.TEXT,
    control: "combobox",
    preferTaxoAttrId: true,
    showWhen: { field: "type_transaction", values: ["vente", "location"] },
  },
  {
    name: "caracteristiques",
    label: "Caractéristiques",
    type: T.TEXT,
    control: "multi-dropdown",
    preferTaxoAttrId: true,
    taxoAliases: ["caracteristique"],
    showWhen: { field: "type_transaction", values: ["vente", "location"] },
    variantByValue: {
      entrepots: {
        staticOptions: CARACTERISTIQUES_BUREAU_ENTREPOT_CONTENEUR,
        preferStaticOptions: true,
      },
      conteneurs: {
        staticOptions: CARACTERISTIQUES_BUREAU_ENTREPOT_CONTENEUR,
        preferStaticOptions: true,
      },
      bureaux: {
        staticOptions: CARACTERISTIQUES_BUREAU_COMPLET,
        preferStaticOptions: true,
      },
      "boutiques kiosques": {
        staticOptions: CARACTERISTIQUES_BUREAU_COMPLET,
        preferStaticOptions: true,
      },
      "restaurants hôtels": {
        staticOptions: CARACTERISTIQUES_BUREAU_RESTAURATION,
        preferStaticOptions: true,
      },
      "autres commerces": {
        staticOptions: CARACTERISTIQUES_BUREAU_COMPLET,
        preferStaticOptions: true,
      },
    },
    dependsOnField: "type_activite",
  },
  {
    name: "surface_habitable",
    label: "Surface",
    type: T.NUMBER,
    control: "clearable-number",
    unit: "m²",
    preferTaxoAttrId: true,
    showWhen: { field: "type_transaction", values: ["vente", "location"] },
  },
  {
    name: "surface_divisible_minimale",
    label: "Surface divisible minimale",
    type: T.NUMBER,
    control: "clearable-number",
    unit: "m²",
    preferTaxoAttrId: true,
    showWhen: { field: "type_transaction", values: ["vente", "location"] },
  },
  {
    name: "nombre_etages",
    label: "Nombre d'étages",
    type: T.NUMBER,
    control: "clearable-number",
    preferTaxoAttrId: true,
    showWhen: { field: "type_transaction", values: ["vente", "location"] },
  },
  {
    name: "etage_du_bien",
    label: "Étage du bien",
    type: T.NUMBER,
    control: "clearable-number",
    preferTaxoAttrId: true,
    showWhen: { field: "type_transaction", values: ["vente", "location"] },
  },
  {
    name: "ascenseur",
    label: "Ascenseur",
    type: T.TEXT,
    control: "switch",
    preferTaxoAttrId: true,
    checkedValue: "Oui",
    uncheckedValue: "Non",
    showWhen: { field: "type_transaction", values: ["vente", "location"] },
  },
  {
    name: "exterieur",
    label: "Extérieur",
    type: T.TEXT,
    control: "multi-dropdown",
    preferTaxoAttrId: true,
    taxoAliases: ["exterieurs"],
    showWhen: { field: "type_transaction", values: ["vente", "location"] },
  },
  {
    name: "places_parking",
    label: "Places de parking",
    type: T.TEXT,
    control: "combobox",
    preferTaxoAttrId: true,
    showWhen: { field: "type_transaction", values: ["vente", "location"] },
  },
  {
    name: "annee_construction",
    label: "Année de construction",
    type: T.TEXT,
    control: "clearable-number",
    preferTaxoAttrId: true,
    showWhen: { field: "type_transaction", values: ["vente", "location"] },
  },
  {
    name: "disponible_a_partir",
    label: "Disponible à partir",
    type: T.TEXT,
    control: "date-month",
    preferTaxoAttrId: true,
    showWhen: { field: "type_transaction", values: ["vente", "location"] },
  },
  {
    name: "papiers",
    label: "Papiers",
    type: T.TEXT,
    control: "choice-chips",
    chipVariant: "filled",
    preferTaxoAttrId: true,
    taxoAliases: ["papier"],
    showWhen: { field: "type_transaction", values: ["vente", "location"] },
  },
  {
    name: "honoraires_a_la_charge_de",
    label: "Honoraires à la charge de",
    type: T.TEXT,
    control: "combobox",
    preferTaxoAttrId: true,
    showWhen: { field: "type_transaction", values: ["vente", "location"] },
  },
  {
    name: "classe_energie",
    label: "Classe énergie",
    type: T.TEXT,
    control: "choice-chips",
    preferTaxoAttrId: true,
    showWhen: { field: "type_transaction", values: ["vente", "location"] },
  },
  {
    name: "ges",
    label: "GES",
    type: T.TEXT,
    control: "choice-chips",
    preferTaxoAttrId: true,
    showWhen: { field: "type_transaction", values: ["vente", "location"] },
  },
];

const TYPE_BIEN_CLEAR_ON_CHANGE = [
  "nature_du_bien",
  "nombre_niveaux",
  "etage_du_bien",
  "nombre_etages_immeuble",
  "ascenseur",
  "surface_totale_terrain",
  "type_chauffage",
  "estimation_cout_annuel_energie_montant_mini",
  "estimation_cout_annuel_energie_montant_maxi",
];

const venteImmobiliere = {
  id: 41,
  slug: "vente-immobiliere",
  label: "Vente immobilière",
  fields: saleFields,
  clearAttributsOnChange: {
    type_bien: TYPE_BIEN_CLEAR_ON_CHANGE,
  },
};

const locations = {
  id: 42,
  slug: "locations",
  label: "Locations",
  fields: locationFields,
  clearAttributsOnChange: {
    type_bien: TYPE_BIEN_CLEAR_ON_CHANGE,
  },
};

const colocations = {
  id: 43,
  slug: "colocations",
  label: "Colocations",
  fields: [
    {
      ...COMMON_RESIDENTIAL_FIELDS.typeBien,
      staticOptions: ["Maison", "Appartement", "Autre"],
    },
    ...colocationFields.slice(1),
  ],
};

const bureauCommercial = {
  id: 44,
  slug: "bureau-commercial",
  label: "Bureaux et commerces",
  fields: bureauFields,
};

export const IMMOBILIER_SUBCATEGORIES = {
  41: venteImmobiliere,
  42: locations,
  43: colocations,
  44: bureauCommercial,
};

export function getImmobilierSubcategoryConfig(sousCategorieId) {
  if (sousCategorieId == null || sousCategorieId === "") return null;
  return IMMOBILIER_SUBCATEGORIES[Number(sousCategorieId)] || null;
}

export function isImmobilierSubcategory(sousCategorieId) {
  return Boolean(getImmobilierSubcategoryConfig(sousCategorieId));
}
