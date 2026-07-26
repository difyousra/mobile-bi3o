import { apiClient } from "../api/client";
import type { SousCategorieDto } from "../types/catalog";
import { extractTreeNodes } from "../models/adMapper";
import type { CategoryTreeNode } from "../types/catalog";

/** GET /taxo/categories-tree */
export async function fetchCategoriesTree(): Promise<CategoryTreeNode[]> {
  const { data } = await apiClient.get<unknown>("/taxo/categories-tree");
  return extractTreeNodes(data);
}

/** GET /taxo/sous-categories — DTO plat */
export async function fetchSousCategories(): Promise<SousCategorieDto[]> {
  const { data } = await apiClient.get<SousCategorieDto[] | { content: SousCategorieDto[] }>(
    "/taxo/sous-categories"
  );
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.content)) return data.content;
  return [];
}

/** GET /taxo/sous-categories/{id}/attributs */
export async function fetchAttributs(sousCategorieId: number): Promise<unknown> {
  const { data } = await apiClient.get(
    `/taxo/sous-categories/${sousCategorieId}/attributs`
  );
  return data;
}
