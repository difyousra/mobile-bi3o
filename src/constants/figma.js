/**
 * Lien vers le fichier Figma Bi3oo et mapping des écrans principaux.
 * Fichier : https://www.figma.com/design/5i65G54WNWJyo51M0c9mXy/Bi3oo
 */
export const FIGMA_FILE = {
  fileKey: "5i65G54WNWJyo51M0c9mXy",
  fileName: "Bi3oo",
  url: "https://www.figma.com/design/5i65G54WNWJyo51M0c9mXy/Bi3oo",
};

/** Section Figma « Home varieties » — 8 écrans */
export const FIGMA_HOME_VARIETIES = {
  skeletonLoading: {
    nodeId: "4:16089",
    name: "Skelton Loading",
    section: "Home varieties",
  },
  homeClothes: {
    nodeId: "20:14633",
    name: "home",
    section: "Home varieties",
  },
  home: {
    nodeId: "29:14034",
    name: "Home",
    section: "Home varieties",
  },
  homeSections: {
    nodeId: "29:22330",
    name: "home sections",
    section: "Home varieties",
  },
  searchFilters: {
    nodeId: "103:8060",
    name: "Search Filters",
    section: "Home varieties",
  },
  homeSearchResults: {
    nodeId: "103:7911",
    name: "Home & Search Results",
    section: "Home varieties",
  },
  searchEmpty: {
    nodeId: "34:14265",
    name: "search result not found",
    section: "Home varieties",
  },
  mapSearchView: {
    nodeId: "103:7742",
    name: "Map search view",
    section: "Home varieties",
  },
};

/** Section Figma « Product detail » — 4 écrans */
export const FIGMA_PRODUCT_DETAIL = {
  productDetail: {
    nodeId: "2:8988",
    name: "Product detail",
    section: "Product detail",
  },
  productDetailGallery: {
    nodeId: "37:14811",
    name: "Product detail (gallery)",
    section: "Product detail",
  },
  productDetailExpanded: {
    nodeId: "37:14961",
    name: "product details after siping",
    section: "Product detail",
  },
  productReviews: {
    nodeId: "37:15427",
    name: "Review & Ratings",
    section: "Product detail",
  },
};

/** Section Figma « Buy product » — 6 écrans */
export const FIGMA_BUY_PRODUCT = {
  checkout: {
    nodeId: "47:12381",
    name: "checkout",
    section: "Buy product",
  },
  checkoutFilled: {
    nodeId: "47:12624",
    name: "checkout (filled)",
    section: "Buy product",
  },
  checkoutRemove: {
    nodeId: "47:11939",
    name: "checkout remove product",
    section: "Buy product",
  },
  buyAddress: {
    nodeId: "47:12888",
    name: "Adress",
    section: "Buy product",
  },
  buyAddAddress: {
    nodeId: "47:13440",
    name: "Add Adress",
    section: "Buy product",
  },
  buyPayment: {
    nodeId: "47:13599",
    name: "Payement method",
    section: "Buy product",
  },
  buyFinish: {
    nodeId: "52:13940",
    name: "finish payment",
    section: "Buy product",
  },
  buyFinishCompact: {
    nodeId: "52:14212",
    name: "finish payment (compact)",
    section: "Buy product",
  },
};

/** Section Figma « profile » — 5 écrans */
export const FIGMA_PROFILE = {
  profile: {
    nodeId: "4:19538",
    name: "profile",
    section: "profile",
  },
  myWallet: {
    nodeId: "52:14680",
    name: "My wallet",
    section: "profile",
  },
  myWalletTopUp: {
    nodeId: "52:14823",
    name: "My wallet (Top Up)",
    section: "profile",
  },
  accountSettings: {
    nodeId: "52:15002",
    name: "Account & Settings",
    section: "profile",
  },
  manageListings: {
    nodeId: "103:7473",
    name: "Manage My Listings",
    section: "profile",
  },
};

/** Section Figma « Sell product » — 10 écrans (9 étapes + boost) */
export const FIGMA_SELL_PRODUCT = {
  publishStep1: { nodeId: "1:26140", name: "Add prduct step 1", section: "Sell product" },
  publishStep2: { nodeId: "103:6263", name: "Add prduct step 2", section: "Sell product" },
  publishStep3: { nodeId: "103:6388", name: "Add prduct step 3", section: "Sell product" },
  publishStep4: { nodeId: "103:6507", name: "Add prduct step 4", section: "Sell product" },
  publishStep5: { nodeId: "103:6617", name: "Add prduct step 5", section: "Sell product" },
  publishStep6: { nodeId: "103:6780", name: "Add prduct step 6", section: "Sell product" },
  publishStep7: { nodeId: "103:6919", name: "Add prduct step 7", section: "Sell product" },
  publishStep8: { nodeId: "103:7087", name: "Add prduct step 8", section: "Sell product" },
  publishStep9: { nodeId: "103:7228", name: "Add prduct step 9", section: "Sell product" },
  publishBoost: { nodeId: "103:7621", name: "Boost product", section: "Sell product" },
};

export const FIGMA_SCREENS = {
  onboarding: { nodeId: "13:25377", name: "On boarding 1", section: "Welcome !" },
  signIn: { nodeId: "20:13868", name: "Sign in", section: "Welcome !" },
  signUp: { nodeId: "7:24776", name: "Sign Up", section: "Welcome !" },
  ...FIGMA_HOME_VARIETIES,
  favorites: { nodeId: "52:15694", name: "Favorites", section: "Favorites" },
  chat: { nodeId: "52:15695", name: "Chat", section: "Chat" },
  ...FIGMA_PRODUCT_DETAIL,
  ...FIGMA_BUY_PRODUCT,
  ...FIGMA_SELL_PRODUCT,
  ...FIGMA_PROFILE,
};
