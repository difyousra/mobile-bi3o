import { useSafeAreaInsets } from "react-native-safe-area-context";

/**
 * Hauteur approximative de la « pill » (icônes + padding), hors safe-area.
 * Aligné sur FloatingTabBar (publish 49 + paddings ≈ 65).
 */
export const TAB_BAR_PILL_HEIGHT = 65;

/**
 * Marge bas recommandée sous le contenu scrollable
 * pour ne pas passer derrière la FloatingTabBar.
 *
 * Usage :
 *   const tabBarInset = useTabBarInset();
 *   <ScrollView contentContainerStyle={{ paddingBottom: tabBarInset }} />
 *
 * @param {number} [extra=16] marge supplémentaire (confort)
 */
export function useTabBarInset(extra = 16) {
  const insets = useSafeAreaInsets();
  return TAB_BAR_PILL_HEIGHT + Math.max(insets.bottom, 12) + extra;
}

/**
 * Écrans où la barre flottante doit être masquée
 * (clavier / footer dédié / immersion).
 */
export const HIDE_FLOATING_TAB_BAR_SCREENS = [
  "Chat",
  "Checkout",
  "BuyAddress",
  "BuyAddAddress",
  "BuyPayment",
  "BuyFinish",
  "SearchFilters",
  "MortgageSimulator",
  "VehicleSimulator",
];
