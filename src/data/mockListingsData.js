export const SORT_OPTIONS = [
  { id: "relevance", label: "Pertinence" },
  { id: "price_asc", label: "Prix croissant" },
  { id: "price_desc", label: "Prix décroissant" },
  { id: "recent", label: "Plus récent" },
];

export const LOCATIONS = [
  "Toute l'Algérie",
  "Alger",
  "Oran",
  "Constantine",
  "Annaba",
];

export const LISTINGS = [
  {
    id: "listing-1",
    title: "Appartement T3 centre-ville, lumineux avec balcon",
    location: "Oran 69002",
    propertyType: "apartment",
    priceEur: 245000,
    priceDzd: 36500000,
    image:
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80",
    tag: { label: "PRO", type: "pro" },
    isPro: true,
  },
  {
    id: "listing-2",
    title: "Villa moderne avec piscine et jardin",
    location: "Alger 16000",
    propertyType: "villa",
    priceEur: 410000,
    priceDzd: 61000000,
    image:
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80",
    tag: { label: "À la une", type: "featured" },
    isPro: false,
  },
  {
    id: "listing-3",
    title: "Studio meublé proche université",
    location: "Constantine 25000",
    propertyType: "apartment",
    priceEur: 68000,
    priceDzd: 10100000,
    image:
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80",
    tag: { label: "PRO", type: "pro" },
    isPro: true,
  },
  {
    id: "listing-4",
    title: "Maison familiale 4 chambres",
    location: "Annaba 23000",
    propertyType: "house",
    priceEur: 195000,
    priceDzd: 29000000,
    image:
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80",
    tag: null,
    isPro: false,
  },
  {
    id: "listing-5",
    title: "Duplex standing vue mer",
    location: "Oran 31000",
    propertyType: "apartment",
    priceEur: 320000,
    priceDzd: 47600000,
    image:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80",
    tag: { label: "À la une", type: "featured" },
    isPro: false,
  },
];

export function filterListings(listings, query, location, filters = {}) {
  let result = [...listings];

  if (location && location !== "Toute l'Algérie") {
    result = result.filter((item) =>
      item.location.toLowerCase().includes(location.toLowerCase())
    );
  }

  if (filters.propertyTypes?.length) {
    result = result.filter((item) =>
      filters.propertyTypes.includes(item.propertyType)
    );
  }

  const min = Number(filters.priceMin);
  const max = Number(filters.priceMax);
  if (!Number.isNaN(min) && filters.priceMin?.trim()) {
    result = result.filter((item) => item.priceEur >= min);
  }
  if (!Number.isNaN(max) && filters.priceMax?.trim()) {
    result = result.filter((item) => item.priceEur <= max);
  }

  if (query.trim()) {
    const q = query.toLowerCase();
    result = result.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.location.toLowerCase().includes(q)
    );
  }

  return result;
}

export function sortListings(listings, sortId) {
  const sorted = [...listings];

  switch (sortId) {
    case "price_asc":
      return sorted.sort((a, b) => a.priceEur - b.priceEur);
    case "price_desc":
      return sorted.sort((a, b) => b.priceEur - a.priceEur);
    case "recent":
      return sorted.reverse();
    default:
      return sorted;
  }
}

export function formatPrice(value, currency) {
  if (currency === "EUR") {
    return `${value.toLocaleString("fr-FR")} €`;
  }
  return `${value.toLocaleString("fr-DZ")} DZD`;
}
