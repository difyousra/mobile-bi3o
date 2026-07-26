import { Image, StyleSheet, Dimensions } from "react-native";
import { colors } from "../../theme/colors";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const scaleX = SCREEN_WIDTH / 375;
const scaleY = SCREEN_HEIGHT / 812;

const LOGO_WIDTH = 168 * scaleX;
const LOGO_HEIGHT = 88 * scaleY;
const LOGO_LEFT = 104 * scaleX;
const LOGO_TOP = 597 * scaleY;

export default function OnboardingLogo() {
  return (
    <Image
      source={require("../../../assets/bi3oo-logo.png")}
      style={[
        styles.logo,
        {
          width: LOGO_WIDTH,
          height: LOGO_HEIGHT,
          left: LOGO_LEFT,
          top: LOGO_TOP,
        },
      ]}
      resizeMode="contain"
    />
  );
}

const styles = StyleSheet.create({
  logo: {
    position: "absolute",
    tintColor: colors.primary,
  },
});
