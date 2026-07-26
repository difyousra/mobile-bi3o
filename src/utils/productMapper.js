export function normalizeProduct(product) {
  const priceDa = product.priceDa ?? product.price ?? product.priceDzd ?? 0;
  const priceEuro =
    product.priceEuro ?? product.priceEur ?? Math.round(priceDa * 0.007);

  return {
    id: product.id,
    title: product.title,
    subtitle: product.subtitle ?? product.model ?? product.category ?? "",
    category: product.category ?? "Marketplace",
    image: product.image,
    price: priceDa,
    priceDa,
    priceEuro,
    currency: product.currency ?? "Da",
    rating: product.rating ?? 4.8,
    reviews: product.reviews ?? 200,
    sold: product.sold ?? 250,
    stock: product.stock ?? 115,
    description:
      product.description ??
      "Produit de qualité, état impeccable. Livraison possible selon accord avec le vendeur.",
    seller: product.seller ?? "Vendeur Bi3oo",
    location: product.location ?? "Alger",
  };
}

export function normalizeListing(listing) {
  return normalizeProduct({
    id: listing.id,
    title: listing.title,
    subtitle: listing.location,
    category: "Immobilier",
    image: listing.image,
    priceDa: listing.priceDzd,
    priceEuro: listing.priceEur,
    location: listing.location,
    description: `${listing.title}. Situé à ${listing.location}.`,
    seller: listing.isPro ? "Agence PRO" : "Particulier Bi3oo",
  });
}

export function formatPrice(value, currency = "Da") {
  if (currency === "Da") {
    return `${Number(value).toLocaleString("fr-DZ")} Da`;
  }
  return `${value} ${currency}`;
}
