import { Image, StyleSheet, View, Dimensions } from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const DESIGN_WIDTH = 375;
const scaleX = SCREEN_WIDTH / DESIGN_WIDTH;

export default function Bi3ooLogo({ style }) {
  return (
    <View style={[styles.wrapper, style]}>
      <Image
        source={require("../../../assets/bi3oo-logo.png")}
        style={styles.logo}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    transform: [{ rotate: "-7deg" }],
  },
  logo: {
    width: 190 * scaleX,
    height: 98 * scaleX,
  },
});