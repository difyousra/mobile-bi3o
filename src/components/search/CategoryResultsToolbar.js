import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme/colors";
import { useAppLanguage } from "../../i18n/LanguageProvider";

/**
 * Toolbar résultats — chips Filtres / catégorie / tri, puis compteur.
 * Le chip catégorie ouvre la liste complète ; le X efface le filtre.
 */
export default function CategoryResultsToolbar({
  title,
  count = 0,
  sortLabel,
  onSortPress,
  activeFilters = 0,
  location,
  activeMode = null, // 'map' | 'filters' | 'location' | null
  onMapPress,
  onFiltersPress,
  onLocationPress,
  showMap = true,
  categoryLabel = "",
  onCategoryPress,
  onClearCategory,
}) {
  const { t } = useAppLanguage();
  const nationwide = t("listings.nationwide");
  const resolvedTitle = title ?? t("mobile.search.listingsTitle");
  const resolvedSort = sortLabel ?? t("filters.sortRelevance");
  const resolvedLocation = location || nationwide;

  const displayCount = count >= 1000 ? count.toLocaleString("fr-FR") : count;
  const countLabel =
    count === 1
      ? t("listings.annonceCount", { count: displayCount })
      : t("listings.annonceCountPlural", { count: displayCount });

  return (
    <View style={styles.wrap}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
      >
        <TouchableOpacity
          style={styles.chip}
          activeOpacity={0.85}
          onPress={onFiltersPress}
        >
          <Ionicons name="options-outline" size={16} color={colors.navy} />
          <Text style={styles.chipText}>{t("categoryUi.filters")}</Text>
          {activeFilters > 0 ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{activeFilters}</Text>
            </View>
          ) : null}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.chip}
          activeOpacity={0.85}
          onPress={onCategoryPress}
        >
          <Text style={styles.chipText} numberOfLines={1}>
            {categoryLabel || t("common.categories")}
          </Text>
          {categoryLabel && onClearCategory ? (
            <TouchableOpacity
              onPress={onClearCategory}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityRole="button"
              accessibilityLabel={t("mobile.search.clearCategoryA11y")}
            >
              <Ionicons name="close" size={16} color={colors.navy} />
            </TouchableOpacity>
          ) : (
            <Ionicons name="chevron-down" size={14} color={colors.navy} />
          )}
        </TouchableOpacity>

        {showMap ? (
          <TouchableOpacity
            style={[styles.chip, activeMode === "map" && styles.chipPressed]}
            activeOpacity={0.85}
            onPress={onMapPress}
          >
            <Ionicons name="map-outline" size={16} color={colors.navy} />
            <Text style={styles.chipText}>{t("categoryUi.mapView")}</Text>
          </TouchableOpacity>
        ) : null}

        <TouchableOpacity
          style={styles.chip}
          activeOpacity={0.85}
          onPress={onLocationPress}
        >
          <Ionicons name="location-outline" size={16} color={colors.navy} />
          <Text style={styles.chipText} numberOfLines={1}>
            {resolvedLocation}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.chip}
          activeOpacity={0.85}
          onPress={onSortPress}
        >
          <Text style={styles.chipText}>
            {t("mobile.search.sortPrefix")} {resolvedSort}
          </Text>
          <Ionicons name="chevron-down" size={14} color={colors.navy} />
        </TouchableOpacity>
      </ScrollView>

      <Text style={styles.count} numberOfLines={2}>
        {countLabel} {resolvedLocation || resolvedTitle}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 8,
    gap: 14,
    paddingTop: 4,
  },
  chips: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingRight: 4,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    minHeight: 36,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: colors.navy,
    backgroundColor: colors.white,
    maxWidth: 220,
  },
  chipPressed: {
    backgroundColor: "#F3F4F6",
  },
  chipText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.navy,
    flexShrink: 1,
  },
  badge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 5,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.navy,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.white,
  },
  count: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.textHeading,
  },
});
