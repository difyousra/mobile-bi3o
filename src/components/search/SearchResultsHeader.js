import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme/colors";
import { useAppLanguage } from "../../i18n/LanguageProvider";

export default function SearchResultsHeader({
  count,
  sortLabel,
  onSortPress,
}) {
  const { t } = useAppLanguage();
  const countLabel =
    count >= 100
      ? t("mobile.search.resultsCount100Plus")
      : t("mobile.search.resultsCount", { count });

  return (
    <View style={styles.row}>
      <Text style={styles.count}>{countLabel}</Text>
      <TouchableOpacity
        style={styles.sortButton}
        activeOpacity={0.8}
        onPress={onSortPress}
      >
        <Text style={styles.sortText}>{t("categoryUi.sortBy")} </Text>
        <Text style={styles.sortValue}>{sortLabel}</Text>
        <Ionicons name="chevron-down" size={14} color={colors.textDark} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  count: {
    fontSize: 13,
    fontWeight: "500",
    color: colors.textMuted,
  },
  sortButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  sortText: {
    fontSize: 13,
    color: colors.textMuted,
  },
  sortValue: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textDark,
  },
});
