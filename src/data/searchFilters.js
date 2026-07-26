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
  if (filters.priceMin?.trim()) count += 1;
  if (filters.priceMax?.trim()) count += 1;
  if (filters.location && filters.location !== "Toute l'Algérie") count += 1;
  return count;
}
