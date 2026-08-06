import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme/colors";
import { useAppLanguage } from "../../i18n/LanguageProvider";

export default function SavedSearchRow({ item, onPress, onRemove }) {
  const { t } = useAppLanguage();

  return (
    <TouchableOpacity
      style={styles.row}
      activeOpacity={0.85}
      onPress={() => onPress(item)}
    >
      <View style={styles.iconWrap}>
        <Ionicons name="search-outline" size={18} color={colors.primary} />
      </View>
      <View style={styles.info}>
        <Text style={styles.query}>{item.query}</Text>
        {item.results != null || item.date ? (
          <Text style={styles.meta}>
            {item.results != null
              ? t("mobile.favorites.resultsCount", { count: item.results })
              : null}
            {item.results != null && item.date ? " · " : null}
            {item.date || null}
          </Text>
        ) : null}
      </View>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => onRemove(item.id)}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Ionicons name="close" size={18} color={colors.textMuted} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "rgba(201, 0, 23, 0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  info: {
    flex: 1,
    gap: 2,
  },
  query: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textDark,
  },
  meta: {
    fontSize: 12,
    color: colors.textMuted,
  },
});
