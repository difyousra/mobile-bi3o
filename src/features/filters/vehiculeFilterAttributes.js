/** IDs attributs véhicules — alignés sur le web (voitures / motos). */

export const VEHICULES_SOUS_CATEGORIES = {
  VOITURES: 1,
  MOTOS: 52,
};

export const VEHICULES_CATEGORIE_ID = 1;

const VOITURES_ATTR = {
  marque: 20,
  modele: 32,
  energie: 16,
  annee_modele: 15,
  kilometrage: 18,
  boite: 19,
  etat: 28,
  documents: 3059,
};

const MOTOS_ATTR = {
  marque: 338,
  annee_modele: 340,
  kilometrage: 349,
};

const ATTR_BY_SOUS_CATEGORIE = {
  [VEHICULES_SOUS_CATEGORIES.VOITURES]: VOITURES_ATTR,
  [VEHICULES_SOUS_CATEGORIES.MOTOS]: MOTOS_ATTR,
};

export function getVehiculeAttributeIds(sousCategorieId) {
  const id = Number(sousCategorieId);
  return ATTR_BY_SOUS_CATEGORIE[id] || VOITURES_ATTR;
}

export function isVehiculeSousCategorie(sousCategorieId) {
  return Object.values(VEHICULES_SOUS_CATEGORIES).includes(Number(sousCategorieId));
}

export function isVehiculeCategorie(categorieId) {
  return Number(categorieId) === VEHICULES_CATEGORIE_ID;
}

/** Marques voitures (sous-cat. 1) */
export const MARQUES_VOITURES = [
  { value: 'AUDI', label: 'Audi' },
  { value: 'BMW', label: 'BMW' },
  { value: 'CITROËN', label: 'Citroën' },
  { value: 'DACIA', label: 'Dacia' },
  { value: 'FIAT', label: 'Fiat' },
  { value: 'FORD', label: 'Ford' },
  { value: 'HONDA', label: 'Honda' },
  { value: 'HYUNDAI', label: 'Hyundai' },
  { value: 'KIA', label: 'Kia' },
  { value: 'MERCEDES-BENZ', label: 'Mercedes-Benz' },
  { value: 'NISSAN', label: 'Nissan' },
  { value: 'OPEL', label: 'Opel' },
  { value: 'PEUGEOT', label: 'Peugeot' },
  { value: 'RENAULT', label: 'Renault' },
  { value: 'SEAT', label: 'Seat' },
  { value: 'SKODA', label: 'Skoda' },
  { value: 'SUZUKI', label: 'Suzuki' },
  { value: 'TOYOTA', label: 'Toyota' },
  { value: 'VOLKSWAGEN', label: 'Volkswagen' },
  { value: 'VOLVO', label: 'Volvo' },
];

/** Marques motos (sous-cat. 52) */
export const MARQUES_MOTOS = [
  { value: 'bmw', label: 'BMW' },
  { value: 'honda', label: 'Honda' },
  { value: 'kawasaki', label: 'Kawasaki' },
  { value: 'suzuki', label: 'Suzuki' },
  { value: 'yamaha', label: 'Yamaha' },
];

export const VEHICULE_ENERGIE_OPTIONS = [
  'Essence', 'Diesel', 'Électrique', 'Hybride', 'GPL', 'GNV',
];

export const VEHICULE_BOITE_OPTIONS = [
  'Manuelle', 'Automatique', 'Semi-automatique',
];

export const VEHICULE_ETAT_OPTIONS = [
  { value: 'Neuf', label: 'Neuf' },
  { value: 'Très bon état', label: 'Très bon état' },
  { value: 'Bon état', label: 'Bon état' },
  { value: 'Correct', label: 'Correct' },
  { value: 'À réparer', label: 'À réparer' },
];

export const VEHICULE_DOCUMENTS_OPTIONS = [
  'Carte grise', 'Contrôle technique', 'Facture', 'Garantie', 'Autre',
];

export function getMarquesBySubCat(sousCategorieId) {
  const id = Number(sousCategorieId);
  if (id === VEHICULES_SOUS_CATEGORIES.MOTOS) return MARQUES_MOTOS;
  return MARQUES_VOITURES;
}
