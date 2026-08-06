import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import GoogleBrandIcon from "./GoogleBrandIcon";
import { colors } from "../../theme/colors";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const DESIGN_WIDTH = 375;
const DESIGN_HEIGHT = 812;

const scaleX = SCREEN_WIDTH / DESIGN_WIDTH;
const scaleY = SCREEN_HEIGHT / DESIGN_HEIGHT;

export default function SocialButton({
  label = "Sign up with Google",
  onPress,
  loading = false,
  disabled = false,
}) {
  const isDisabled = disabled || loading;
  return (
    <TouchableOpacity
      style={[styles.button, isDisabled && styles.buttonDisabled]}
      activeOpacity={0.8}
      onPress={onPress}
      disabled={isDisabled}
    >
      {loading ? (
        <ActivityIndicator color={colors.primary} />
      ) : (
        <>
          <GoogleBrandIcon size={20 * scaleX} />
          <Text style={styles.label}>{label}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 48 * scaleY,
    borderRadius: 24 * scaleX,
    borderWidth: 1,
    borderColor: "#E8EDF2",
    backgroundColor: colors.white,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12 * scaleX,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  label: {
    fontSize: 14 * scaleX,
    fontWeight: "700",
    color: "#1F2328",
  },
});
