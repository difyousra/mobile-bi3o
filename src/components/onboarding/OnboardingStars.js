import { View, StyleSheet, Dimensions } from "react-native";
import {
  ONBOARDING_STARS,
  DESIGN_WIDTH,
  DESIGN_HEIGHT,
} from "../../constants/onboardingStars";
import { colors } from "../../theme/colors";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const scaleX = SCREEN_WIDTH / DESIGN_WIDTH;
const scaleY = SCREEN_HEIGHT / DESIGN_HEIGHT;

export default function OnboardingStars() {
  return (
    <View style={styles.container} pointerEvents="none">
      {ONBOARDING_STARS.map((star, index) => {
        const size = Math.max(star.s * scaleX, 1.2);
        return (
          <View
            key={index}
            style={[
              styles.dot,
              {
                left: star.x * scaleX,
                top: star.y * scaleY,
                width: size,
                height: size,
                borderRadius: size / 2,
              },
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.9,
  },
  dot: {
    position: "absolute",
    backgroundColor: colors.primary,
  },
});
