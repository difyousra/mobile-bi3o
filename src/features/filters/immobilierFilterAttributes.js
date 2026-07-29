/** IDs attributs immobilier — alignés sur le web (ventes / locations). */

export const IMMOBILIER_SOUS_CATEGORIES = {
  VENTES: 41,
  LOCATIONS: 42,
  COLOCATIONS: 43,
  BUREAUX: 44,
};

const VENTES_ATTR = {
  type_vente: 221,
  type_bien: 222,
  nature_bien: 224,
  nombre_pieces: 638,
  nombre_chambres: 633,
  caracteristique: 225,
  surface_habitable: 227,
  surface_totale_terrain: 641,
  exterieur: 235,
  exposition: 233,
  etat_bien: 238,
  classe_energie: 239,
  places_parking: 234,
  disponible_a_partir: 236,
  mode_chauffage: 237,
  ges: 240,
  charges: 241,
};

const LOCATIONS_ATTR = {
  type_bien: 244,
  nature_bien: 245,
  nombre_pieces: 250,
  nombre_chambres: 251,
  caracteristique: 246,
  surface_habitable: 248,
  surface_totale_terrain: 249,
  exterieur: 256,
  exposition: 254,
  etat_bien: 259,
  classe_energie: 260,
  places_parking: 255,
  disponible_a_partir: 257,
  mode_chauffage: 258,
  ges: 261,
  charges: 262,
  loyer_mensuel: 263,
  caution: 264,
  loyer_annuel: 265,
};

const ATTR_BY_SOUS_CATEGORIE = {
  [IMMOBILIER_SOUS_CATEGORIES.VENTES]: VENTES_ATTR,
  [IMMOBILIER_SOUS_CATEGORIES.LOCATIONS]: LOCATIONS_ATTR,
  [IMMOBILIER_SOUS_CATEGORIES.COLOCATIONS]: LOCATIONS_ATTR,
  [IMMOBILIER_SOUS_CATEGORIES.BUREAUX]: VENTES_ATTR,
};

export const IMMOBILIER_PROPERTY_TYPES = [
  { value: 'appartement', label: 'Appartement' },
  { value: 'maison', label: 'Maison' },
  { value: 'terrain', label: 'Terrain' },
  { value: 'parking', label: 'Parking' },
  { value: 'autre', label: 'Autre' },
];

export const IMMOBILIER_PROPERTY_TYPES_COLOCATION = IMMOBILIER_PROPERTY_TYPES.filter((o) =>
  ['maison', 'appartement', 'autre'].includes(o.value)
);

export const IMMOBILIER_CARACTERISTIQUES = [
  'Accès PMR', 'Chauffage au sol', 'Construction ancienne', 'Construction récente',
  'Plusieurs toilettes', 'Baignoire', 'Animaux autorisés', 'Colocation possible',
  'Habitation à Loyer Modéré', 'Climatisation', 'Avec garage ou place de parking',
];

export const IMMOBILIER_NATURE_OPTIONS = [
  'Maison individuelle', 'Maison de ville', 'Résidence collective', 'Maison de plain-pied',
  'Ferme', 'Maison mitoyenne', 'Villa', 'Jardin', 'Terrain constructible', 'Terrain agricole',
  'Stationnement extérieur', 'Stationnement couvert', 'Box ou garage fermé', 'Autre',
];

export const IMMOBILIER_EXTERIEUR_OPTIONS = ['Balcon', 'Terrasse', 'Jardin', 'Piscine'];

export const IMMOBILIER_EXPOSITION_OPTIONS = [
  'Nord', 'Sud', 'Est', 'Ouest', 'Nord-Est', 'Nord-Ouest', 'Sud-Est', 'Sud-Ouest',
];

export const IMMOBILIER_ETAT_OPTIONS = [
  'Très bon état', 'Bon état', 'Rénové', 'À rafraichir', 'Travaux à prévoir',
];

export const IMMOBILIER_CLASSE_OPTIONS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'Non soumis au DPE'];

export const IMMOBILIER_GES_OPTIONS = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

export const IMMOBILIER_CHAUFFAGE_OPTIONS = ['Électrique', 'Fioul', 'Gaz', 'Solaire', 'Autre'];

export const IMMOBILIER_BEDROOMS_OPTIONS = ['0', '1', '2', '3', '4', '5', '6', '7', '8 et plus'];

export const FURNISHED_OPTIONS = ['Non meuble', 'Meuble'];

export const ROOM_OPTIONS = ['Any', '1', '2', '3', '4', '5', '6+'];

/** IDs des IDs catégorie immobilier (pour détecter si la catégorie choisie est immobilier). */
export const IMMOBILIER_CATEGORIE_IDS = [5];

export function isImmobilierSousCategorie(sousCategorieId) {
  return Object.values(IMMOBILIER_SOUS_CATEGORIES).includes(Number(sousCategorieId));
}

export function resolveImmobilierLinkageProfile(sousCategorieId) {
  const id = Number(sousCategorieId);
  if (
    id === IMMOBILIER_SOUS_CATEGORIES.LOCATIONS ||
    id === IMMOBILIER_SOUS_CATEGORIES.COLOCATIONS
  ) {
    return 'locations';
  }
  return 'ventes';
}

export function getImmobilierAttributeIds(sousCategorieId) {
  const id = Number(sousCategorieId);
  return ATTR_BY_SOUS_CATEGORIE[id] || VENTES_ATTR;
}

/** Table de linkage : filtres conditionnels selon le type de bien sélectionné. */
export const VENTES_CONDITIONAL_BY_TYPE = {
  maison: ['surface_habitable', 'nombre_pieces', 'nombre_chambres', 'nature_du_bien',
    'caracteristiques', 'exterieur', 'surface_totale_terrain', 'places_parking',
    'exposition', 'disponible_a_partir', 'type_vente', 'mode_chauffage', 'classe_energie', 'ges'],
  appartement: ['surface_habitable', 'nombre_pieces', 'nombre_chambres', 'caracteristiques',
    'exterieur', 'places_parking', 'exposition', 'disponible_a_partir', 'type_vente',
    'mode_chauffage', 'classe_energie', 'ges'],
  terrain: ['nature_du_bien', 'surface_totale_terrain', 'disponible_a_partir'],
  parking: ['nature_du_bien', 'caracteristiques', 'places_parking', 'etat_du_bien', 'disponible_a_partir'],
  autre: ['surface_habitable', 'nombre_pieces', 'nombre_chambres', 'caracteristiques',
    'exterieur', 'surface_totale_terrain', 'places_parking', 'disponible_a_partir',
    'type_vente', 'classe_energie', 'ges'],
};

export const LOCATIONS_CONDITIONAL_BY_TYPE = {
  maison: ['surface_habitable', 'nombre_pieces', 'nombre_chambres', 'meuble', 'nature_du_bien',
    'caracteristiques', 'exterieur', 'surface_totale_terrain', 'places_parking',
    'exposition', 'disponible_a_partir', 'classe_energie', 'ges'],
  appartement: ['surface_habitable', 'nombre_pieces', 'nombre_chambres', 'meuble',
    'caracteristiques', 'exterieur', 'places_parking', 'exposition', 'disponible_a_partir',
    'mode_chauffage', 'classe_energie', 'ges'],
  terrain: ['nature_du_bien', 'surface_totale_terrain', 'disponible_a_partir'],
  parking: ['nature_du_bien', 'caracteristiques', 'places_parking', 'disponible_a_partir'],
  autre: ['surface_habitable', 'nombre_pieces', 'nombre_chambres', 'meuble', 'caracteristiques',
    'exterieur', 'surface_totale_terrain', 'places_parking', 'disponible_a_partir',
    'classe_energie', 'ges'],
};

export const FILTER_SECTION_KEYS = {
  type_vente: ['type_vente'],
  nature: ['nature_du_bien', 'nature_bien'],
  surface_habitable: ['surface_habitable'],
  terrain_surface: ['surface_totale_terrain', 'surface_terrain'],
  pieces: ['nombre_pieces', 'nb_pieces'],
  chambres: ['nombre_chambres', 'nb_chambres'],
  exterieur: ['exterieur', 'exterieurs'],
  exposition: ['exposition'],
  caracteristiques: ['caracteristiques', 'caracteristique'],
  etat: ['etat_du_bien', 'etat_bien'],
  classe: ['classe_energie', 'ges', 'dpe'],
  parking: ['places_parking'],
  chauffage: ['mode_chauffage', 'type_chauffage'],
  ges: ['ges'],
  disponible: ['disponible_a_partir'],
  meuble: ['meuble'],
  charges: ['charges'],
  loyer_mensuel: ['loyer_mensuel'],
  caution: ['caution'],
  loyer_annuel: ['loyer_annuel'],
};

function normalizeLinkageKey(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

/**
 * Retourne true si une section de filtre doit être affichée
 * en fonction des types de bien sélectionnés.
 */
export function isImmobilierSectionVisible(linkageProfile, sectionId, selectedPropertyTypes = []) {
  const conditionalByType =
    linkageProfile === 'locations' ? LOCATIONS_CONDITIONAL_BY_TYPE : VENTES_CONDITIONAL_BY_TYPE;
  const sectionKeys = FILTER_SECTION_KEYS;

  if (!selectedPropertyTypes.length) return true;

  const allowedSet = new Set();
  for (const type of selectedPropertyTypes) {
    const keys = conditionalByType[String(type).toLowerCase()] || [];
    for (const key of keys) allowedSet.add(normalizeLinkageKey(key));
  }

  const keys = sectionKeys[sectionId];
  if (!keys?.length) return true;
  return keys.some((key) => allowedSet.has(normalizeLinkageKey(key)));
}
