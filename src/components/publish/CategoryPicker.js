import { useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { colors } from "../../theme/colors";
import { queryKeys } from "../../api/queryKeys";
import { fetchSousCategories } from "../../services/taxoService";

/**
 * Sélection sous-catégorie API (GET /taxo/sous-categories — DTO plat).
 * Stocke sousCategorieId numérique requis par POST /annonces/json.
 */
export default function CategoryPicker({
  value,
  sousCategorieId,
  onChange,
}) {
  const { data = [], isLoading, isError } = useQuery({
    queryKey: queryKeys.sousCategories,
    queryFn: fetchSousCategories,
    staleTime: 30 * 60 * 1000,
  });

  const chips = useMemo(() => data.slice(0, 24), [data]);

  const selectedLabel =
    data.find((s) => s.id === sousCategorieId)?.nom ?? value ?? "";

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>Sous-catégorie</Text>
      <View style={styles.select}>
        <Text style={[styles.value, !selectedLabel && styles.placeholder]}>
          {selectedLabel || "Sélectionner une sous-catégorie"}
        </Text>
        <Ionicons name="chevron-down" size={20} color={colors.greyMuted} />
      </View>

      {isLoading ? (
        <ActivityIndicator color={colors.primary} />
      ) : null}
      {isError ? (
        <Text style={styles.error}>Impossible de charger la taxonomie.</Text>
      ) : null}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
      >
        {chips.map((cat) => {
          const active = sousCategorieId === cat.id;
          return (
            <TouchableOpacity
              key={cat.id}
              style={[styles.chip, active && styles.chipActive]}
              onPress={() =>
                onChange?.({
                  category: cat.nom,
                  sousCategorieId: cat.id,
                })
              }
            >
              <Text
                style={[styles.chipText, active && styles.chipTextActive]}
              >
                {cat.nom}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.textHeading,
  },
  select: {
    height: 56,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: 8,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.white,
  },
  value: {
    fontSize: 16,
    color: colors.textHeading,
    flex: 1,
  },
  placeholder: {
    color: "#DBDBDB",
  },
  chips: {
    flexDirection: "row",
    flexWrap: "nowrap",
    gap: 8,
    marginTop: 4,
    paddingRight: 16,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  chipActive: {
    borderColor: colors.primary,
    backgroundColor: "rgba(201, 0, 23, 0.06)",
  },
  chipText: {
    fontSize: 13,
    color: colors.textMuted,
  },
  chipTextActive: {
    color: colors.primary,
    fontWeight: "600",
  },
  error: {
    color: "#D32F2F",
    fontSize: 12,
  },
});
