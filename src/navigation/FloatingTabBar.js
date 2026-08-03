import { useCallback } from "react";
import { View, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CommonActions } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../theme/colors";
import { TAB_ICONS, TAB_ROUTES } from "./tabConfig";
import { useAuth } from "../context/AuthContext";
import { isProtectedTab, returnToTab } from "./authRoutes";
import { HIDE_FLOATING_TAB_BAR_SCREENS } from "../hooks/useTabBarInset";

function getFocusedRouteName(state) {
  if (!state) return null;
  const route = state.routes[state.index];
  if (route?.state) {
    return getFocusedRouteName(route.state) ?? route.name;
  }
  return route?.name ?? null;
}

function getActiveTab(rootState) {
  if (!rootState) return "Home";
  const focusedLeaf = getFocusedRouteName(rootState);

  // Chats (stack interne messagerie)
  if (focusedLeaf === "Chat" || focusedLeaf === "MessagesList") {
    return "Messages";
  }

  // Écrans “compte”
  if (
    [
      "Account",
      "AccountScreen",
      "AccountSettings",
      "SecuritySettings",
      "PrivacySettings",
      "NotificationSettings",
      "LotDiscountsSettings",
      "DisplaySettings",
      "LegalHub",
      "PrivacyPolicy",
      "TermsOfUse",
      "AboutBi3oo",
      "LegalContact",
      "EditProfile",
      "ChangePassword",
      "MyWallet",
      "MyListings",
      "MyReservations",
      "SellerProfile",
      "Notifications",
    ].includes(focusedLeaf)
  ) {
    return "Account";
  }

  // Depuis l’onglet lui-même
  const route = rootState.routes[rootState.index];
  if (route?.name === "MainTabs") {
    const tabState = route.state;
    const tabName = tabState?.routes?.[tabState.index]?.name;
    if (TAB_ROUTES.includes(tabName)) return tabName;
  }

  return "Home";
}

/**
 * Barre d’onglets flottante — toujours visible (tabs + écrans stack).
 * Onglets protégés → redirection login auto (comme le web).
 */
export default function FloatingTabBar({ navigationRef, navState }) {
  const insets = useSafeAreaInsets();
  const { isAuthenticated, requireAuth } = useAuth();
  const rootState = navState ?? navigationRef?.getRootState?.() ?? null;
  const focusedLeaf = getFocusedRouteName(rootState);
  const activeTab = getActiveTab(rootState);

  const goTab = useCallback(
    (name) => {
      if (!isAuthenticated && isProtectedTab(name)) {
        requireAuth(returnToTab(name));
        return;
      }
      navigationRef?.dispatch(
        CommonActions.navigate({
          name: "MainTabs",
          params: { screen: name },
        })
      );
    },
    [navigationRef, isAuthenticated, requireAuth]
  );

  // Chat / checkout / filtres : barre masquée pour ne pas cacher input / CTA
  if (focusedLeaf && HIDE_FLOATING_TAB_BAR_SCREENS.includes(focusedLeaf)) {
    return null;
  }

  return (
    <View
      style={[
        styles.bar,
        { paddingBottom: Math.max(insets.bottom, 8) },
      ]}
    >
      <View style={styles.inner}>
        {TAB_ROUTES.map((name) => {
          const isFocused = activeTab === name;

          if (name === "Publish") {
            return (
              <TouchableOpacity
                key={name}
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                accessibilityLabel="Publier"
                onPress={() => goTab(name)}
                style={styles.publishWrap}
                activeOpacity={0.9}
              >
                <View style={[styles.publishButton, isFocused && styles.publishButtonActive]}>
                  <Ionicons name="sparkles" size={26} color={colors.white} />
                </View>
              </TouchableOpacity>
            );
          }

          const iconName = TAB_ICONS[name] || "ellipse-outline";

          return (
            <TouchableOpacity
              key={name}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={name}
              onPress={() => goTab(name)}
              style={styles.tab}
              activeOpacity={0.7}
            >
              <View style={[styles.iconWrap, isFocused && styles.iconWrapActive]}>
                <Ionicons
                  name={iconName}
                  size={24}
                  color={isFocused ? colors.navy : colors.textMuted}
                />
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: "#E8EAED",
    zIndex: 100,
    elevation: 100,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: -2 },
      },
      android: {
        elevation: 12,
      },
    }),
  },
  inner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    width: "100%",
    paddingHorizontal: 8,
    paddingTop: 8,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrapActive: {
    backgroundColor: "rgba(18, 25, 38, 0.03)",
  },
  publishWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  publishButton: {
    width: 49,
    height: 49,
    borderRadius: 77,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  publishButtonActive: {
    transform: [{ scale: 1.04 }],
  },
});

