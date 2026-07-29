/**
 * Routes publiques / protégées — aligné sur le web
 * (`AUTH_REQUIRED_ROUTES` / ProtectedRoute du front new design).
 *
 * Public (guest OK) : Home, recherche, détail annonce, profil vendeur, panier.
 * Protégé : favoris, publier, messages, compte, wallet, checkout, etc.
 */

/** Onglets accessibles sans session. */
export const PUBLIC_TABS = ["Home"];

/** Onglets nécessitant une session (comme /favoris, /annonces/nouvelle, /messages, /profil). */
export const PROTECTED_TABS = ["Favorites", "Publish", "Messages", "Account"];

/** Écrans stack racine publics. */
export const PUBLIC_STACK_SCREENS = [
  "MainTabs",
  "Search",
  "SearchFilters",
  "MapSearch",
  "ProductDetail",
  "ProductReviews",
  "SellerProfile",
  "Cart",
];

/** Écrans stack racine protégés. */
export const PROTECTED_STACK_SCREENS = [
  "Messages",
  "Checkout",
  "BuyAddress",
  "BuyAddAddress",
  "BuyPayment",
  "BuyFinish",
  "AccountSettings",
  "EditProfile",
  "ChangePassword",
  "MyWallet",
  "MyListings",
  "MyReservations",
  "Notifications",
];

export function isProtectedTab(name) {
  return PROTECTED_TABS.includes(name);
}

export function isProtectedStackScreen(name) {
  return PROTECTED_STACK_SCREENS.includes(name);
}

/**
 * Cible de navigation React Navigation après login réussi.
 * @param {string} name
 * @param {object} [params]
 */
export function returnToTarget(name, params) {
  return { name, params };
}

/** Cible pour un onglet MainTabs. */
export function returnToTab(tabName, params) {
  return {
    name: "MainTabs",
    params: { screen: tabName, ...(params ? { params } : {}) },
  };
}
