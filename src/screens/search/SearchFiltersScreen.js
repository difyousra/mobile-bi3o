import { useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme/colors";
import { DEFAULT_SEARCH_FILTERS } from "../../data/searchFilters";
import { LOCATIONS } from "../../data/mockListingsData";
import {
  useCategoryChips,
  useSousCategories,
} from "../../hooks/useCatalog";

export default function SearchFiltersScreen({ navigation, route }) {
  const initial = route.params?.filters ?? DEFAULT_SEARCH_FILTERS;
  const [location, setLocation] = useState(initial.location);
  const [categorieId, setCategorieId] = useState(
    initial.categorieId ?? null
  );
  const [sousCategorieId, setSousCategorieId] = useState(
    initial.sousCategorieId ?? null
  );
  const [priceMin, setPriceMin] = useState(initial.priceMin ?? "");
  const [priceMax, setPriceMax] = useState(initial.priceMax ?? "");
  const [locationOpen, setLocationOpen] = useState(false);

  const { chips, isLoading: taxoLoading } = useCategoryChips();
  const { data: sousCategories = [], isLoading: sousLoading } =
    useSousCategories();

  const categories = useMemo(
    () => chips.filter((c) => c.id !== "all"),
    [chips]
  );

  const sousForCategory = useMemo(() => {
    if (!categorieId) return sousCategories;
    return sousCategories.filter(
      (s) => Number(s.categorieId) === Number(categorieId)
    );
  }, [sousCategories, categorieId]);

  const handleReset = () => {
    setLocation(DEFAULT_SEARCH_FILTERS.location);
    setCategorieId(null);
    setSousCategorieId(null);
    setPriceMin("");
    setPriceMax("");
  };

  const handleApply = () => {
    navigation.navigate({
      name: "Search",
      params: {
        initialQuery: route.params?.searchQuery ?? "",
        filters: {
          location,
          categorieId,
          sousCategorieId,
          priceMin,
          priceMax,
        },
      },
      merge: true,
    });
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={colors.textHeading} />
        </TouchableOpacity>
        <Text style={styles.title}>Filtres</Text>
        <TouchableOpacity onPress={handleReset}>
          <Text style={styles.resetText}>Réinitialiser</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>Localisation</Text>
        <TouchableOpacity
          style={styles.selectRow}
          onPress={() => setLocationOpen((v) => !v)}
        >
          <Text style={styles.selectValue}>{location}</Text>
          <Ionicons
            name={locationOpen ? "chevron-up" : "chevron-down"}
            size={18}
            color={colors.textMuted}
          />
        </TouchableOpacity>
        {locationOpen ? (
          <View style={styles.optionsBox}>
            {LOCATIONS.map((loc) => (
              <TouchableOpacity
                key={loc}
                style={[
                  styles.optionRow,
                  location === loc && styles.optionActive,
                ]}
                onPress={() => {
                  setLocation(loc);
                  setLocationOpen(false);
                }}
              >
                <Text
                  style={[
                    styles.optionText,
                    location === loc && styles.optionTextActive,
                  ]}
                >
                  {loc}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : null}

        <Text style={styles.sectionTitle}>Catégorie</Text>
        {taxoLoading ? (
          <ActivityIndicator color={colors.primary} />
        ) : (
          <View style={styles.chipWrap}>
            <TouchableOpacity
              style={[styles.chip, !categorieId && styles.chipActive]}
              onPress={() => {
                setCategorieId(null);
                setSousCategorieId(null);
              }}
            >
              <Text
                style={[
                  styles.chipText,
                  !categorieId && styles.chipTextActive,
                ]}
              >
                Toutes
              </Text>
            </TouchableOpacity>
            {categories.map((cat) => {
              const active = Number(categorieId) === Number(cat.rawId);
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.chip, active && styles.chipActive]}
                  onPress={() => {
                    setCategorieId(cat.rawId);
                    setSousCategorieId(null);
                  }}
                >
                  <Text
                    style={[
                      styles.chipText,
                      active && styles.chipTextActive,
                    ]}
                  >
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        <Text style={styles.sectionTitle}>Sous-catégorie</Text>
        {sousLoading ? (
          <ActivityIndicator color={colors.primary} />
        ) : (
          <View style={styles.chipWrap}>
            <TouchableOpacity
              style={[styles.chip, !sousCategorieId && styles.chipActive]}
              onPress={() => setSousCategorieId(null)}
            >
              <Text
                style={[
                  styles.chipText,
                  !sousCategorieId && styles.chipTextActive,
                ]}
              >
                Toutes
              </Text>
            </TouchableOpacity>
            {sousForCategory.map((sc) => {
              const active = Number(sousCategorieId) === Number(sc.id);
              return (
                <TouchableOpacity
                  key={sc.id}
                  style={[styles.chip, active && styles.chipActive]}
                  onPress={() => {
                    setSousCategorieId(sc.id);
                    if (sc.categorieId) setCategorieId(sc.categorieId);
                  }}
                >
                  <Text
                    style={[
                      styles.chipText,
                      active && styles.chipTextActive,
                    ]}
                  >
                    {sc.nom}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        <Text style={styles.sectionTitle}>Prix</Text>
        <View style={styles.priceRow}>
          <View style={styles.priceField}>
            <Text style={styles.priceLabel}>Min</Text>
            <TextInput
              style={styles.priceInput}
              value={priceMin}
              onChangeText={setPriceMin}
              placeholder="0"
              placeholderTextColor={colors.placeholder}
              keyboardType="numeric"
            />
          </View>
          <View style={styles.priceField}>
            <Text style={styles.priceLabel}>Max</Text>
            <TextInput
              style={styles.priceInput}
              value={priceMax}
              onChangeText={setPriceMax}
              placeholder="∞"
              placeholderTextColor={colors.placeholder}
              keyboardType="numeric"
            />
          </View>
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.applyBtn} onPress={handleApply}>
        <Text style={styles.applyText}>Afficher les résultats</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textHeading,
  },
  resetText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.primary,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.textHeading,
    marginBottom: 12,
    marginTop: 8,
  },
  selectRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 12,
  },
  selectValue: {
    fontSize: 15,
    color: colors.textHeading,
  },
  optionsBox: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    marginBottom: 16,
    overflow: "hidden",
  },
  optionRow: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  optionActive: {
    backgroundColor: "rgba(201, 0, 23, 0.06)",
  },
  optionText: {
    fontSize: 15,
    color: colors.textHeading,
  },
  optionTextActive: {
    color: colors.primary,
    fontWeight: "600",
  },
  chipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  chipActive: {
    borderColor: colors.navy,
    backgroundColor: colors.navy,
  },
  chipText: {
    fontSize: 13,
    color: colors.textMuted,
  },
  chipTextActive: {
    color: colors.white,
    fontWeight: "600",
  },
  priceRow: {
    flexDirection: "row",
    gap: 12,
  },
  priceField: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: 6,
  },
  priceInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.textHeading,
  },
  applyBtn: {
    margin: 20,
    height: 52,
    borderRadius: 10,
    backgroundColor: colors.navy,
    alignItems: "center",
    justifyContent: "center",
  },
  applyText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.white,
  },
});
