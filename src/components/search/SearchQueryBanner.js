import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme/colors";
import { useAppLanguage } from "../../i18n/LanguageProvider";

export default function SearchQueryBanner({ query, onClear }) {
  const { t } = useAppLanguage();

  if (!query.trim()) return null;

  return (
    <View style={styles.row}>
      <Text style={styles.text}>
        {t("mobile.search.queryBanner", { query })}
      </Text>
      <TouchableOpacity
        style={styles.clearButton}
        activeOpacity={0.7}
        onPress={onClear}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Ionicons name="close" size={14} color={colors.textMuted} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
    gap: 12,
  },
  text: {
    flex: 1,
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 18,
  },
  query: {
    fontWeight: "600",
    color: colors.textDark,
  },
  clearButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#F0F2F5",
    alignItems: "center",
    justifyContent: "center",
  },
});
