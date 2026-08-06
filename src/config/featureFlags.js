/**
 * Feature flags produit — kill-switch store / release.
 * Buy + Wallet sont simulés (pas de PSP) → masqués sauf opt-in explicite.
 */
export const ENABLE_BUY_WALLET =
  process.env.EXPO_PUBLIC_ENABLE_BUY_WALLET === "1";
