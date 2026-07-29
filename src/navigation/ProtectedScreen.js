import { useEffect, useRef } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import { colors } from "../theme/colors";
import { returnToTarget, returnToTab } from "./authRoutes";

/**
 * Garde d’écran (équivalent web `ProtectedRoute`).
 * Sans session → login + mémorisation de la destination ; sinon rendu enfants.
 */
export function ProtectedScreen({ children, returnTo }) {
  const { isAuthenticated, isBootstrapping, openAuth } = useAuth();
  const navigation = useNavigation();
  const route = useRoute();
  const redirectedRef = useRef(false);

  useEffect(() => {
    if (isBootstrapping) return;
    if (isAuthenticated) {
      redirectedRef.current = false;
      return;
    }
    if (redirectedRef.current) return;
    redirectedRef.current = true;

    const target = returnTo ?? returnToTarget(route.name, route.params);
    openAuth("signin", { returnTo: target });

    const parent = navigation.getParent?.();
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else if (parent?.navigate) {
      parent.navigate("MainTabs", { screen: "Home" });
    } else {
      navigation.navigate("Home");
    }
  }, [
    isAuthenticated,
    isBootstrapping,
    openAuth,
    navigation,
    route.name,
    route.params,
    returnTo,
  ]);

  if (isBootstrapping || !isAuthenticated) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return children;
}

/**
 * HOC pour wrapper un écran stack protégé.
 */
export function withProtectedScreen(ScreenComponent, options = {}) {
  function GuardedScreen(props) {
    return (
      <ProtectedScreen returnTo={options.returnTo}>
        <ScreenComponent {...props} />
      </ProtectedScreen>
    );
  }
  GuardedScreen.displayName = `Protected(${
    ScreenComponent.displayName || ScreenComponent.name || "Screen"
  })`;
  return GuardedScreen;
}

/**
 * HOC pour un onglet protégé — returnTo pointe vers l’onglet.
 */
export function withProtectedTab(ScreenComponent, tabName) {
  function GuardedTab(props) {
    return (
      <ProtectedScreen returnTo={returnToTab(tabName)}>
        <ScreenComponent {...props} />
      </ProtectedScreen>
    );
  }
  GuardedTab.displayName = `ProtectedTab(${tabName})`;
  return GuardedTab;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },
});
