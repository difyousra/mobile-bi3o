import { createNavigationContainerRef } from "@react-navigation/native";

export const navigationRef = createNavigationContainerRef();

export function navigate(name, params) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name, params);
  }
}

export function resetToHome() {
  if (!navigationRef.isReady()) return;
  navigationRef.reset({
    index: 0,
    routes: [{ name: "MainTabs", params: { screen: "Home" } }],
  });
}

/**
 * Navigue vers une cible `{ name, params }` (post-login).
 */
export function navigateToReturnTarget(target) {
  if (!target?.name || !navigationRef.isReady()) return;
  navigationRef.navigate(target.name, target.params);
}
