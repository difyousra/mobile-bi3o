import { View, StyleSheet, Dimensions } from "react-native";
import { colors } from "../../theme/colors";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const DESIGN_WIDTH = 375;
const DESIGN_HEIGHT = 812;

const scaleX = SCREEN_WIDTH / DESIGN_WIDTH;
const scaleY = SCREEN_HEIGHT / DESIGN_HEIGHT;

function SemiEllipse({
  left,
  top,
  width,
  height,
  backgroundColor,
  rotation,
  opacity = 1,
  cut = "bottom",
}) {
  const scaledWidth = width * scaleX;
  const scaledHeight = height * scaleY;

  return (
    <View
      style={[
        styles.wrapper,
        {
          left: left * scaleX,
          top: top * scaleY,
          width: scaledWidth,
          height: scaledHeight / 2,
          transform: [{ rotate: `${rotation}deg` }],
        },
      ]}
    >
      <View
        style={[
          styles.ellipse,
          {
            width: scaledWidth,
            height: scaledHeight,
            borderRadius: scaledWidth / 2,
            backgroundColor,
            opacity,
            top: cut === "top" ? -scaledHeight / 2 : 0,
          },
        ]}
      />
    </View>
  );
}

export default function OnboardingShapes() {
  return (
    <View style={styles.container} pointerEvents="none">
      {/* Rose clair haut */}
      <SemiEllipse
        left={124}
        top={170}
        width={235}
        height={235}
        backgroundColor={colors.primary}
        opacity={0.18}
        rotation={191}
        cut="bottom"
      />

      {/* Rouge centre gauche */}
      <SemiEllipse
        left={52}
        top={283}
        width={245}
        height={250}
        backgroundColor={colors.primary}
        rotation={146}
        cut="bottom"
      />

      {/* Rose derrière centre droit */}
      <SemiEllipse
        left={92}
        top={323}
        width={225}
        height={230}
        backgroundColor={colors.primary}
        opacity={0.36}
        rotation={20}
        cut="bottom"
      />

      {/* Rouge bas */}
      <SemiEllipse
        left={70}
        top={427}
        width={245}
        height={235}
        backgroundColor={colors.primary}
        rotation={351}
        cut="bottom"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  wrapper: {
    position: "absolute",
    overflow: "hidden",
  },
  ellipse: {
    position: "absolute",
    left: 0,
  },
});