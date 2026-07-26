import { View, StyleSheet, Dimensions } from "react-native";
import { colors } from "../../theme/colors";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const GRID_GAP = (SCREEN_WIDTH / 375) * 41.89;

export default function OnboardingGrid() {
  const cols = Math.ceil(SCREEN_WIDTH / GRID_GAP) + 2;
  const rows = Math.ceil(SCREEN_HEIGHT / GRID_GAP) + 2;

  return (
    <View style={styles.container} pointerEvents="none">
      {Array.from({ length: cols }).map((_, i) => (
        <View
          key={`v-${i}`}
          style={[
            styles.line,
            { left: i * GRID_GAP, height: SCREEN_HEIGHT },
          ]}
        />
      ))}
      {Array.from({ length: rows }).map((_, j) => (
        <View
          key={`h-${j}`}
          style={[
            styles.line,
            { top: j * GRID_GAP, width: SCREEN_WIDTH, height: 1 },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.1,
  },
  line: {
    position: "absolute",
    width: 1,
    backgroundColor: colors.primary,
  },
});
