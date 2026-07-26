import type { AdCard, CategoryTreeNode, PublicAdDetail } from "../types/catalog";
import { resolveMediaUrl } from "../utils/mediaUrl";

export type UiProduct = {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  image: string;
  price: number;
  priceDa: number;
  priceEuro: number;
  currency: string;
  description: string;
  seller: string;
  location: string;
  photos: string[];
  sellerId?: number;
  rating: number;
  reviews: number;
  sold: number;
  stock: number;
};

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80";

function dzdToEuro(prixDzd: number, rate?: number): number {
  if (rate && rate > 0) return Math.round((prixDzd / rate) * 100) / 100;
  return Math.round(prixDzd * 0.007 * 100) / 100;
}

export function mapAdCardToUi(
  ad: AdCard,
  options?: { eurToDzd?: number }
): UiProduct {
  const priceDa = Number(ad.prix ?? 0);
  const photoFromList =
    ad.photos
      ?.map((p) => resolveMediaUrl(p.url ?? p.photoUrl ?? p.chemin))
      .find(Boolean) ?? undefined;
  const cover =
    resolveMediaUrl(ad.coverUrl) ?? photoFromList ?? PLACEHOLDER_IMAGE;

  return {
    id: String(ad.id),
    title: ad.titre,
    subtitle: ad.ville ?? "",
    category: "Annonce",
    image: cover,
    price: priceDa,
    priceDa,
    priceEuro: dzdToEuro(priceDa, options?.eurToDzd),
    currency: "Da",
    description: ad.titre,
    seller:
      (ad as { vendeurPublicNom?: string }).vendeurPublicNom ??
      "Vendeur Bi3oo",
    location: ad.ville ?? "",
    photos: [cover],
    sellerId: (ad as { userId?: number }).userId,
    rating: 0,
    reviews: 0,
    sold: 0,
    stock: 1,
  };
}

export function mapPublicAdToUi(
  ad: PublicAdDetail,
  options?: { eurToDzd?: number }
): UiProduct {
  const base = mapAdCardToUi(ad, options);
  const photoUrls =
    ad.photos
      ?.map((p) => resolveMediaUrl(p.url ?? p.photoUrl ?? p.chemin))
      .filter((u): u is string => Boolean(u)) ?? [];

  const sellerName =
    ad.vendeur ??
    ([ad.user?.prenom, ad.user?.nom].filter(Boolean).join(" ") || base.seller);

  return {
    ...base,
    subtitle: ad.sousCategorieNom ?? ad.categorieNom ?? base.subtitle,
    category: ad.categorieNom ?? ad.sousCategorieNom ?? base.category,
    description: ad.description ?? base.description,
    seller: sellerName,
    sellerId: ad.userId ?? ad.user?.id,
    photos: photoUrls.length > 0 ? photoUrls : base.photos,
    image: photoUrls[0] ?? base.image,
  };
}

export function categoryLabel(node: CategoryTreeNode): string {
  return node.nom ?? node.name ?? node.label ?? `Cat ${node.id}`;
}

export function flattenCategoryTree(
  tree: CategoryTreeNode[] | CategoryTreeNode | null | undefined
): Array<{ id: string; label: string; icon: string; rawId: number }> {
  const roots = Array.isArray(tree)
    ? tree
    : tree
      ? [tree]
      : [];

  const chips: Array<{
    id: string;
    label: string;
    icon: string;
    rawId: number;
  }> = [{ id: "all", label: "Tout", icon: "apps-outline", rawId: 0 }];

  for (const node of roots) {
    chips.push({
      id: String(node.id),
      label: categoryLabel(node),
      icon: "grid-outline",
      rawId: node.id,
    });
  }

  return chips;
}

export function mapAdCardToListing(
  ad: AdCard,
  options?: { eurToDzd?: number }
): {
  id: string;
  title: string;
  location: string;
  priceEur: number;
  priceDzd: number;
  image: string;
  tag?: { label: string; type: string };
  isPro: boolean;
} {
  const ui = mapAdCardToUi(ad, options);
  return {
    id: ui.id,
    title: ui.title,
    location: ui.location || "Algérie",
    priceEur: ui.priceEuro,
    priceDzd: ui.priceDa,
    image: ui.image,
    isPro: false,
  };
}

export function extractTreeNodes(
  payload: unknown
): CategoryTreeNode[] {
  if (Array.isArray(payload)) return payload as CategoryTreeNode[];
  if (payload && typeof payload === "object") {
    const obj = payload as Record<string, unknown>;
    if (Array.isArray(obj.categories)) {
      return obj.categories as CategoryTreeNode[];
    }
    if (Array.isArray(obj.content)) {
      return obj.content as CategoryTreeNode[];
    }
  }
  return [];
}
