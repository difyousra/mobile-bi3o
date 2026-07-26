import { View, StyleSheet, Pressable, Dimensions } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";
import OnboardingGrid from "../../components/onboarding/OnboardingGrid";
import OnboardingStars from "../../components/onboarding/OnboardingStars";
import OnboardingShapes from "../../components/onboarding/OnboardingShapes";
import OnboardingLogo from "../../components/onboarding/OnboardingLogo";
import { colors } from "../../theme/colors";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

function RadialGlow() {
  const size = SCREEN_WIDTH * 2.77;
  return (
    <View
      pointerEvents="none"
      style={[
        styles.glow,
        {
          width: size,
          height: size * 0.67,
          left: SCREEN_WIDTH / 2 - size / 2,
          top: -SCREEN_HEIGHT * 0.19,
          borderRadius: size / 2,
        },
      ]}
    />
  );
}

function OnboardingContent({ onContinue }) {
  const insets = useSafeAreaInsets();

  return (
    <Pressable style={styles.container} onPress={onContinue}>
      <StatusBar style="dark" />
      <RadialGlow />
      <OnboardingGrid />
      <OnboardingStars />
      <OnboardingShapes />
      <OnboardingLogo />
      <View style={[styles.homeIndicator, { bottom: Math.max(insets.bottom, 8) }]} />
    </Pressable>
  );
}

export default function OnboardingScreen({ onContinue }) {
  return (
    <SafeAreaProvider>
      <OnboardingContent onContinue={onContinue} />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  glow: {
    position: "absolute",
    backgroundColor: colors.white,
    opacity: 0.95,
  },
  homeIndicator: {
    position: "absolute",
    alignSelf: "center",
    width: 148,
    height: 5,
    borderRadius: 100,
    backgroundColor: "#111827",
  },
});
