import { Image, TouchableOpacity, StyleSheet } from "react-native";
import { CommonActions } from "@react-navigation/native";
import { navigationRef, resetToHome } from "../../navigation/navigationRef";

/** Logo header web : 98×51 (extrait du SVG bi3oo_front_new_design). */
const LOGO = require("../../../assets/bi3oo-logo.png");
const ASPECT = 98 / 51;

function goHome() {
  if (!navigationRef.isReady()) return;
  // Reset stack → Accueil (comme le logo header web)
  try {
    resetToHome();
  } catch {
    navigationRef.dispatch(
      CommonActions.navigate({
        name: "MainTabs",
        params: { screen: "Home" },
      })
    );
  }
}

/**
 * Logo Bi3oo — tap → Accueil.
 */
export default function BrandLogo({ onPress, height = 34, style }) {
  const width = Math.round(height * ASPECT);

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress ?? goHome}
      accessibilityRole="button"
      accessibilityLabel="Bi3oo accueil"
      hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
      style={[styles.wrap, style]}
    >
      <Image
        source={LOGO}
        style={{ width, height }}
        resizeMode="contain"
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrap: {
    justifyContent: "center",
    alignItems: "flex-start",
  },
});
