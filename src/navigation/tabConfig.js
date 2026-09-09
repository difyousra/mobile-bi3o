/** Onglets principaux — barre flottante fixe. */
export const TAB_ROUTES = ["Home", "Favorites", "Publish", "Messages", "Account"];

export const TAB_ICONS = {
  Home: "home-outline",
  Favorites: "heart-outline",
  Publish: "sparkles",
  Messages: "chatbubble-outline",
  Account: "person-outline",
};

/**
 * Fallback statique (StyleSheet) si le hook n’est pas utilisable.
 * Préférer `useTabBarInset()` pour un padding exact selon le device.
 */
export const TAB_BAR_CONTENT_INSET = 120;

