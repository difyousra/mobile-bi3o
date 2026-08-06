/**
 * Icônes catégories mobiles — Ionicons (compatible Expo Go / RN).
 * Aligné sur les IDs du web (Categoryicons.jsx) et CATEGORY_SLUG_TO_ID.
 */

/** @type {Record<number, string>} */
export const CATEGORY_ID_TO_IONICON = {
  1: "car-outline", // Véhicules
  5: "home-outline", // Immobilier
  7: "briefcase-outline", // Emploi
  8: "happy-outline", // Famille
  9: "shirt-outline", // Mode
  10: "football-outline", // Loisirs
  11: "desktop-outline", // Électronique
  12: "sunny-outline", // Vacances
  13: "construct-outline", // Matériel professionnel
  14: "people-outline", // Services
  15: "leaf-outline", // Maison & Jardin
  16: "paw-outline", // Animaux
};

const LABEL_ICON_RULES = [
  { test: /immobilier/, icon: "home-outline" },
  { test: /vehicule|voiture|moto/, icon: "car-outline" },
  { test: /vacance|saisonni/, icon: "sunny-outline" },
  { test: /emploi|job|travail/, icon: "briefcase-outline" },
  { test: /electronique|informatique/, icon: "desktop-outline" },
  { test: /telephon/, icon: "phone-portrait-outline" },
  { test: /maison|jardin/, icon: "leaf-outline" },
  { test: /famille|bebe|enfant/, icon: "happy-outline" },
  { test: /mode|vetement|chaussure/, icon: "shirt-outline" },
  { test: /loisir|sport/, icon: "football-outline" },
  { test: /animaux|animal/, icon: "paw-outline" },
  { test: /materiel|professionnel|tracteur/, icon: "construct-outline" },
  { test: /service/, icon: "people-outline" },
];

function normalizeLabel(label) {
  return String(label || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

/**
 * Retourne un nom d’icône Ionicons pour une catégorie.
 * @param {number|string|null|undefined} categoryId
 * @param {string} [categoryName]
 * @returns {string}
 */
export function getCategoryIonicon(categoryId, categoryName = "") {
  const id = Number.parseInt(String(categoryId ?? ""), 10);
  if (Number.isFinite(id) && CATEGORY_ID_TO_IONICON[id]) {
    return CATEGORY_ID_TO_IONICON[id];
  }

  const label = normalizeLabel(categoryName);
  for (const rule of LABEL_ICON_RULES) {
    if (rule.test.test(label)) return rule.icon;
  }

  return "grid-outline";
}
