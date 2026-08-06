import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme/colors";
import { useAppLanguage } from "../../i18n/LanguageProvider";

export default function SaveSearchButton({ onPress }) {
  const { t } = useAppLanguage();

  return (
    <TouchableOpacity
      style={styles.button}
      activeOpacity={0.9}
      onPress={onPress}
    >
      <Ionicons name="notifications-outline" size={18} color={colors.white} />
      <Text style={styles.label}>{t("listings.saveSearch")}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    position: "absolute",
    left: 40,
    right: 40,
    bottom: 96,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    zIndex: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.white,
  },
});
