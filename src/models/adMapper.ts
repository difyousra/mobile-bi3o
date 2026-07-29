import type { AdCard, AnnonceValeur, CategoryTreeNode, PublicAdDetail } from "../types/catalog";
import { resolveMediaUrl } from "../utils/mediaUrl";

export type UiAttribut = {
  id?: number;
  attributDefiniId?: number;
  attributNom?: string;
  label: string;
  value: string;
};

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
  sellerId?: number;
  vendeurEstPro?: boolean;
  location: string;
  ville?: string;
  codePostal?: string;
  photos: string[];
  createdAt?: string;
  type?: string;
  categorieNom?: string;
  sousCategorieNom?: string;
  categorieId?: number;
  sousCategorieId?: number;
  favorisCount?: number;
  views?: number;
  /** Attributs catégorie (valeurs[]) */
  attributs: UiAttribut[];
  rating: number;
  reviews: number;
  sold: number;
  stock: number;
};

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80";

/** Livraison / contact — on les exclut des attributs affichés comme le web */
const LIVRAISON_NOM_PATTERNS = [
  "livraison", "livreur", "partenaire", "bureau", "relais",
  "point_relais", "yalidine", "maystro", "contact", "whatsapp",
];

function isExcludedAttribut(nom?: string): boolean {
  if (!nom) return false;
  const n = String(nom).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "_");
  return LIVRAISON_NOM_PATTERNS.some((p) => n.includes(p));
}

function formatAttributValue(valeur: AnnonceValeur): string {
  if (valeur.valueText) return valeur.valueText;
  if (valeur.valueNumber != null && valeur.valueNumber !== "") {
    const num = Number(valeur.valueNumber);
    return Number.isFinite(num) ? String(num) : "";
  }
  if (valeur.valueDate) return valeur.valueDate;
  return "";
}

function formatAttributLabel(nom?: string): string {
  if (!nom) return "Caractéristique";
  return String(nom).replace(/_/g, " ").trim();
}

function mapValeurs(valeurs?: AnnonceValeur[]): UiAttribut[] {
  if (!valeurs?.length) return [];
  return valeurs
    .map((v) => ({
      id: v.id,
      attributDefiniId: v.attributDefiniId,
      attributNom: v.attributNom,
      label: formatAttributLabel(v.attributNom),
      value: formatAttributValue(v),
    }))
    .filter((a) => a.value && !isExcludedAttribut(a.attributNom));
}

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
    ville: ad.ville,
    photos: [cover],
    sellerId: (ad as { userId?: number }).userId,
    favorisCount: Number((ad as { favorisCount?: number }).favorisCount ?? 0),
    views: Number((ad as { views?: number }).views ?? 0) || undefined,
    attributs: [],
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

  // Photos : photoUrls[] prioritaire (API v56), sinon photos[], sinon coverUrl
  const resolvedFromPhotoUrls = (ad.photoUrls ?? [])
    .map((u) => resolveMediaUrl(u))
    .filter((u): u is string => Boolean(u));

  const resolvedFromPhotos =
    ad.photos
      ?.map((p) => resolveMediaUrl(p.url ?? p.photoUrl ?? p.chemin))
      .filter((u): u is string => Boolean(u)) ?? [];

  const photoUrls =
    resolvedFromPhotoUrls.length > 0
      ? resolvedFromPhotoUrls
      : resolvedFromPhotos.length > 0
        ? resolvedFromPhotos
        : base.photos;

  const sellerName =
    ad.vendeur ??
    ad.vendeurPublicNom ??
    ([ad.user?.prenom, ad.user?.nom].filter(Boolean).join(" ") || base.seller);

  const location = [ad.codePostal, ad.ville].filter(Boolean).join(" ") || ad.ville || base.location;

  return {
    ...base,
    subtitle: ad.sousCategorieNom ?? ad.categorieNom ?? base.subtitle,
    category: ad.categorieNom ?? ad.sousCategorieNom ?? base.category,
    description: ad.description ?? base.description,
    seller: sellerName,
    sellerId: ad.userId ?? ad.user?.id,
    vendeurEstPro: ad.vendeurEstPro,
    location,
    ville: ad.ville,
    codePostal: ad.codePostal,
    photos: photoUrls,
    image: photoUrls[0] ?? base.image,
    createdAt: ad.createdAt,
    type: ad.type,
    categorieNom: ad.categorieNom,
    sousCategorieNom: ad.sousCategorieNom,
    categorieId: ad.categorieId,
    sousCategorieId: ad.sousCategorieId,
    favorisCount: ad.favorisCount,
    views: ad.views,
    attributs: mapValeurs(ad.valeurs),
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
