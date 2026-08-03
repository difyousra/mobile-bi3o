export const DEFAULT_SEARCH_FILTERS = {
  location: "Toute l'Algérie",
  categorieId: null,
  sousCategorieId: null,
  priceMin: "",
  priceMax: "",
};

export function countActiveFilters(filters) {
  let count = 0;
  if (filters.categorieId) count += 1;
  if (filters.sousCategorieId) count += 1;
  if (filters.priceMin?.trim?.() || filters.prixMin) count += 1;
  if (filters.priceMax?.trim?.() || filters.prixMax) count += 1;
  if (filters.location && filters.location !== "Toute l'Algérie") count += 1;
  if (filters.type || filters.annonceType) count += 1;
  if (filters.disponibiliteDateArrivee && filters.disponibiliteDateDepart) count += 1;
  return count;
}
