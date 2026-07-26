import { ScrollView, TouchableOpacity, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme/colors";

export default function SearchFilterBar({
  activeFilters,
  location,
  onMapPress,
  onFiltersPress,
  onLocationPress,
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      <TouchableOpacity style={styles.chip} activeOpacity={0.8} onPress={onMapPress}>
        <Ionicons name="map-outline" size={16} color={colors.textDark} />
        <Text style={styles.chipText}>Carte</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.chip, styles.chipActive]}
        activeOpacity={0.8}
        onPress={onFiltersPress}
      >
        <Text style={styles.chipTextActive}>
          Filtres{activeFilters > 0 ? ` (${activeFilters})` : ""}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.chip}
        activeOpacity={0.8}
        onPress={onLocationPress}
      >
        <Ionicons name="location-outline" size={16} color={colors.textDark} />
        <Text style={styles.chipText}>{location}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: 8,
    paddingBottom: 12,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: 13,
    fontWeight: "500",
    color: colors.textDark,
  },
  chipTextActive: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.white,
  },
});
