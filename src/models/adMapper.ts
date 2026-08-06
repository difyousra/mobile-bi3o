import type { AdCard, AnnonceValeur, CategoryTreeNode, PublicAdDetail } from "../types/catalog";
import { resolveMediaUrl } from "../utils/mediaUrl";
import { isAnnonceLivraisonDisponible } from "../features/annonces/utils/livraisonUtils";
import { resolveLivraisonFinalizerFromValeurs } from "../features/annonces/utils/livraisonFinalizer";
import { getCategoryIonicon } from "../features/categories/categoryIcons";
import {
  formatListingLocation,
  formatListingPostedAt,
  formatListingPriceDZD,
  formatListingPriceEUR,
  shouldHideEurConversion,
} from "../utils/formatListingDisplay";

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
  livraisonDisponible?: boolean;
  livraisonPartenaires?: string[];
  livraisonBureau?: string;
  rating: number;
  reviews: number;
  sold: number;
  stock: number;
};

const PLACEHOLDER_IMAGE =
  "https://new.bi3oo.com/uploads/1_vehicules/1_voitures/ann_31/2025/09/pexels-trksami-20277838_19e3a356740e426398e293fc5ac0ef2b.jpg";

/** Livraison / contact — on les exclut des attributs affichés comme le web */
const LIVRAISON_NOM_PATTERNS = [
  "livraison", "livreur", "partenaire", "bureau", "relais",
  "point_relais", "yalidine", "maystro", "contact", "whatsapp",
];

function isExcludedAttribut(nom?: string): boolean {
  if (!nom) return false;
  const n = String(nom)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "_");
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

function pickAdImage(ad: AdCard | PublicAdDetail): string {
  const cover = resolveMediaUrl(ad.coverUrl);
  if (cover) return cover;

  const fromPhotoUrls = (ad as PublicAdDetail).photoUrls
    ?.map((u) => resolveMediaUrl(u))
    .find(Boolean);
  if (fromPhotoUrls) return fromPhotoUrls;

  const photos = ad.photos ?? [];
  const coverPhoto = photos.find((p) => p.cover);
  const ordered = coverPhoto ? [coverPhoto, ...photos] : photos;
  const fromPhotos = ordered
    .map((p) => resolveMediaUrl(p.url ?? p.photoUrl ?? p.chemin))
    .find(Boolean);
  if (fromPhotos) return fromPhotos;

  return PLACEHOLDER_IMAGE;
}

function dzdToEuro(prixDzd: number, rate?: number): number {
  if (rate && rate > 0) return Math.round(prixDzd / rate);
  // Fallback parallèle (~260 DA/EUR), pas le taux banque (~0.007).
  return Math.round(prixDzd / 260);
}

export function mapAdCardToUi(
  ad: AdCard,
  options?: { eurToDzd?: number }
): UiProduct {
  const priceDa = Number(ad.prix ?? 0);
  const cover = pickAdImage(ad);

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
      ad.vendeurPublicNom ??
      "Vendeur Bi3oo",
    location: formatListingLocation(ad.ville, ad.codePostal) || ad.ville || "",
    ville: ad.ville,
    codePostal: ad.codePostal,
    photos: [cover],
    sellerId: (ad as { userId?: number }).userId,
    vendeurEstPro: Boolean(ad.vendeurEstPro),
    createdAt: ad.createdAt,
    favorisCount: Number(ad.favorisCount ?? 0),
    views: Number((ad as { views?: number }).views ?? 0) || undefined,
    attributs: [],
    categorieId: ad.categorieId,
    sousCategorieId: ad.sousCategorieId,
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

  const location =
    formatListingLocation(ad.ville, ad.codePostal) ||
    [ad.codePostal, ad.ville].filter(Boolean).join(" ") ||
    ad.ville ||
    base.location;

  const livraisonFinalizer = resolveLivraisonFinalizerFromValeurs(ad.valeurs);

  return {
    ...base,
    subtitle: ad.sousCategorieNom ?? ad.categorieNom ?? base.subtitle,
    category: ad.categorieNom ?? ad.sousCategorieNom ?? base.category,
    description: ad.description ?? base.description,
    seller: sellerName,
    sellerId: ad.userId ?? ad.user?.id,
    vendeurEstPro: Boolean(ad.vendeurEstPro),
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
    livraisonDisponible: isAnnonceLivraisonDisponible(ad),
    livraisonPartenaires: livraisonFinalizer.partenaires_de_livraison,
    livraisonBureau: livraisonFinalizer.bureau_ou_point_relais,
  };
}

type TranslateFn = (key: string, options?: Record<string, unknown>) => string;

export function categoryLabel(
  node: CategoryTreeNode,
  t?: TranslateFn
): string {
  const fallback = node.nom ?? node.name ?? node.label ?? `Cat ${node.id}`;
  if (!t || node.id == null) return fallback;

  const key = `categoryNames.${node.id}`;
  const localized = t(key, { defaultValue: fallback });
  return localized && localized !== key ? localized : fallback;
}

/** Sous-catégorie : dictionnaire `subcategoryNames` (IDs distincts des racines). */
export function subcategoryLabel(
  node: { id?: number | string; nom?: string; name?: string; label?: string },
  t?: TranslateFn
): string {
  const fallback = node.nom ?? node.name ?? node.label ?? `Sous ${node.id}`;
  if (!t || node.id == null) return fallback;

  const key = `subcategoryNames.${node.id}`;
  const localized = t(key, { defaultValue: fallback });
  return localized && localized !== key ? localized : fallback;
}

export function flattenCategoryTree(
  tree: CategoryTreeNode[] | CategoryTreeNode | null | undefined,
  t?: (key: string) => string
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
  }> = [
    {
      id: "all",
      label: t ? t("categoryUi.allCategory") : "Tout",
      icon: "apps-outline",
      rawId: 0,
    },
  ];

  for (const node of roots) {
    const label = categoryLabel(node, t);
    chips.push({
      id: String(node.id),
      label,
      icon: getCategoryIonicon(node.id, label),
      rawId: node.id,
    });
  }

  return chips;
}

export function mapAdCardToListing(
  ad: AdCard,
  options?: { eurToDzd?: number; officialRate?: number }
): {
  id: string;
  title: string;
  location: string;
  date: string;
  createdAt?: string;
  prix: number;
  priceEur: number;
  priceDzd: number;
  priceLabel: string;
  eurLabel: string;
  eurOfficialLabel: string;
  hideEurConversion: boolean;
  image: string;
  favorisCount: number;
  tag?: { label: string; type: string };
  isPro: boolean;
  sellerName: string;
  sellerPhotoUrl: string;
  ville?: string;
  codePostal?: string;
  categorieId?: number;
  sousCategorieId?: number;
} {
  const ui = mapAdCardToUi(ad, options);
  const isPro = Boolean(ad.vendeurEstPro ?? ui.vendeurEstPro);
  const hideEur = shouldHideEurConversion(ad);
  const priceDzd = ui.priceDa;
  const sellerName = String(ad.vendeurPublicNom || ui.seller || "").trim();
  const sellerPhotoUrl =
    resolveMediaUrl(ad.vendeurPublicPhotoUrl || ad.vendeurPhotoUrl) || "";

  return {
    id: ui.id,
    title: ui.title,
    location: formatListingLocation(ad.ville, ad.codePostal) || ui.location || "Algérie",
    date: formatListingPostedAt(ad.createdAt),
    createdAt: ad.createdAt,
    prix: priceDzd,
    priceEur: hideEur ? 0 : ui.priceEuro,
    priceDzd,
    priceLabel: formatListingPriceDZD(priceDzd),
    eurLabel: hideEur
      ? ""
      : formatListingPriceEUR(priceDzd, options?.eurToDzd),
    eurOfficialLabel: hideEur
      ? ""
      : formatListingPriceEUR(priceDzd, options?.officialRate),
    hideEurConversion: hideEur,
    image: ui.image,
    favorisCount: Number(ui.favorisCount ?? 0),
    isPro,
    sellerName,
    sellerPhotoUrl,
    ville: ad.ville,
    codePostal: ad.codePostal,
    categorieId: ad.categorieId,
    sousCategorieId: ad.sousCategorieId,
    tag: {
      label: isPro ? "Pro" : "Particulier",
      type: isPro ? "pro" : "particulier",
    },
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
