/**
 * Libellés taxonomie (catégories / sous-catégories).
 * L’API renvoie `nom` en FR ; EN/AR viennent des dictionnaires i18n web.
 */

/** @param {import('i18next').TFunction} t */
export function translateSubcategoryDisplayName(t, sousCategorieId, apiNomOrFrFallback) {
  const raw = String(apiNomOrFrFallback ?? "").trim();
  const n = Number(sousCategorieId);
  if (!Number.isFinite(n) || n <= 0 || !t) return raw;
  return t(`subcategoryNames.${n}`, { defaultValue: raw });
}

/** @param {import('i18next').TFunction} t */
export function translateCategoryDisplayName(t, categoryId, apiNomOrFrFallback) {
  const raw = String(apiNomOrFrFallback ?? "").trim();
  const id = Number(categoryId);
  if (!Number.isFinite(id) || id <= 0 || !t) return raw;
  return t(`categoryNames.${id}`, { defaultValue: raw });
}

/** Libellé affiché pour un nœud catégorie (racine). */
export function categoryNodeLabel(node, t) {
  const fallback = node?.nom ?? node?.name ?? node?.label ?? `Cat ${node?.id ?? "?"}`;
  return translateCategoryDisplayName(t, node?.id, fallback);
}

/** Libellé affiché pour un nœud / DTO sous-catégorie. */
export function subcategoryNodeLabel(node, t) {
  const fallback = node?.nom ?? node?.name ?? node?.label ?? `Sous ${node?.id ?? "?"}`;
  return translateSubcategoryDisplayName(t, node?.id, fallback);
}
