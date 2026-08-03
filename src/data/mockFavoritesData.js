export const FAVORITES_TABS = [
  { id: "annonces", label: "Favoris" },
  { id: "recherches", label: "Mes recherches" },
  { id: "vendeurs", label: "Mes vendeurs" },
];

export const FAVORITE_PRODUCTS = [
  {
    id: "fav-1",
    title: "SONY Premium Wireless Headphones",
    model: "Model: WH-1000XM4, Black",
    priceDa: 120,
    priceEuro: 350,
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80",
  },
  {
    id: "fav-2",
    title: "SONY Premium Casque",
    model: "Model: WH-1000XM4, Beige",
    priceDa: 120,
    priceEuro: 350,
    image:
      "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=400&q=80",
  },
  {
    id: "fav-3",
    title: "HP Microportable i5",
    model: "Model: 15-dy2xxx, Silver",
    priceDa: 85000,
    priceEuro: 620,
    image:
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&q=80",
  },
  {
    id: "fav-4",
    title: "Samsung Smart TV 55",
    model: "Model: QLED 4K, 2024",
    priceDa: 145000,
    priceEuro: 980,
    image:
      "https://images.unsplash.com/photo-1593359673509-f843a3de37d5?w=400&q=80",
  },
];

export const SAVED_SEARCHES = [
  {
    id: "search-1",
    query: "Renault Clio Oran",
    results: 24,
    date: "Il y a 2 jours",
  },
  {
    id: "search-2",
    query: "iPhone 16",
    results: 0,
    date: "Il y a 5 jours",
  },
  {
    id: "search-3",
    query: "Appartement T3 Alger",
    results: 112,
    date: "Il y a 1 semaine",
  },
];

export const SAVED_SELLERS = [
  {
    id: "seller-1",
    name: "Via Shopping",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80",
    listings: 18,
    rating: 4.8,
  },
  {
    id: "seller-2",
    name: "TechStore DZ",
    avatar:
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&q=80",
    listings: 42,
    rating: 4.6,
  },
  {
    id: "seller-3",
    name: "Auto Premium",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80",
    listings: 7,
    rating: 5.0,
  },
];

export function filterFavorites(products, query) {
  if (!query.trim()) return products;
  const q = query.toLowerCase();
  return products.filter(
    (item) =>
      item.title.toLowerCase().includes(q) ||
      item.model?.toLowerCase().includes(q)
  );
}

export function filterSavedSearches(searches, query) {
  if (!query.trim()) return searches;
  const q = query.toLowerCase();
  return searches.filter((item) => item.query.toLowerCase().includes(q));
}

export function filterSavedSellers(sellers, query) {
  if (!query.trim()) return sellers;
  const q = query.toLowerCase();
  return sellers.filter((item) => item.name.toLowerCase().includes(q));
}
