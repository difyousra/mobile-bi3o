import { useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Modal,
  ScrollView,
  Pressable,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { colors } from "../../theme/colors";
import { queryKeys } from "../../api/queryKeys";
import {
  fetchCategoriesTree,
  fetchSousCategories,
} from "../../services/taxoService";
import { categoryLabel } from "../../models/adMapper";
import { subcategoryNodeLabel } from "../../i18n/taxonomyLabels";
import { useAppLanguage } from "../../i18n/LanguageProvider";

/**
 * Sélection catégorie + sous-catégorie depuis la taxo API.
 * - GET /taxo/categories-tree
 * - GET /taxo/sous-categories
 * Stocke sousCategorieId (requis POST /annonces) + libellé affiché.
 */
export default function CategoryPicker({
  value,
  sousCategorieId,
  categorieId: categorieIdProp,
  onChange,
}) {
  const { t } = useAppLanguage();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState("category"); // category | subcategory
  const [pickedCategorieId, setPickedCategorieId] = useState(
    categorieIdProp ?? null
  );
  const [search, setSearch] = useState("");

  const {
    data: tree = [],
    isLoading: treeLoading,
    isError: treeError,
  } = useQuery({
    queryKey: queryKeys.taxoTree,
    queryFn: fetchCategoriesTree,
    staleTime: 30 * 60 * 1000,
  });

  const {
    data: sousCategories = [],
    isLoading: sousLoading,
    isError: sousError,
  } = useQuery({
    queryKey: queryKeys.sousCategories,
    queryFn: fetchSousCategories,
    staleTime: 30 * 60 * 1000,
  });

  const categories = useMemo(
    () =>
      (tree || []).map((node) => ({
        id: Number(node.id),
        nom: categoryLabel(node, t),
        sousFromTree: node.sousCategories ?? node.children ?? [],
      })),
    [tree, t]
  );

  const selectedSous = useMemo(
    () =>
      sousCategories.find((s) => Number(s.id) === Number(sousCategorieId)) ||
      null,
    [sousCategories, sousCategorieId]
  );

  const selectedCategorieId = useMemo(() => {
    if (categorieIdProp != null) return Number(categorieIdProp);
    if (selectedSous?.categorieId != null) return Number(selectedSous.categorieId);
    if (pickedCategorieId != null) return Number(pickedCategorieId);
    return null;
  }, [categorieIdProp, selectedSous, pickedCategorieId]);

  const selectedCategoryLabel = useMemo(() => {
    const cat = categories.find((c) => c.id === selectedCategorieId);
    return cat?.nom ?? "";
  }, [categories, selectedCategorieId]);

  const selectedLabel = selectedSous
    ? subcategoryNodeLabel(selectedSous, t)
    : value ?? "";

  const sousForCategory = useMemo(() => {
    if (pickedCategorieId == null) return [];
    const cat = categories.find((c) => c.id === Number(pickedCategorieId));
    const fromTree = (cat?.sousFromTree || [])
      .map((s) => ({
        id: Number(s.id),
        nom: subcategoryNodeLabel(s, t),
        categorieId: Number(pickedCategorieId),
      }))
      .filter((s) => Number.isFinite(s.id));

    if (fromTree.length > 0) return fromTree;

    // Fallback : on localise même si le backend renvoie `nom` en FR.
    return sousCategories
      .filter((s) => Number(s.categorieId) === Number(pickedCategorieId))
      .map((s) => ({
        ...s,
        nom: subcategoryNodeLabel(s, t),
      }));
  }, [pickedCategorieId, categories, sousCategories, t]);

  const filteredCategories = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter((c) => c.nom.toLowerCase().includes(q));
  }, [categories, search]);

  const filteredSous = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return sousForCategory;
    return sousForCategory.filter((s) =>
      String(s.nom || "").toLowerCase().includes(q)
    );
  }, [sousForCategory, search]);

  const isLoading = treeLoading || sousLoading;
  const isError = treeError || sousError;

  const openPicker = () => {
    setSearch("");
    if (selectedCategorieId != null && sousCategorieId) {
      setPickedCategorieId(selectedCategorieId);
      setStep("subcategory");
    } else {
      setPickedCategorieId(selectedCategorieId);
      setStep("category");
    }
    setOpen(true);
  };

  const selectCategory = (cat) => {
    setPickedCategorieId(cat.id);
    setSearch("");
    setStep("subcategory");
  };

  const selectSous = (sous) => {
    onChange?.({
      category: sous.nom,
      sousCategorieId: Number(sous.id),
      categorieId: Number(sous.categorieId ?? pickedCategorieId),
      categorieNom: selectedCategoryLabel || categories.find((c) => c.id === Number(pickedCategorieId))?.nom,
    });
    setOpen(false);
  };

  const displayValue = selectedLabel
    ? selectedCategoryLabel
      ? `${selectedCategoryLabel} · ${selectedLabel}`
      : selectedLabel
    : "";

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{t("mobile.publish.category")}</Text>
      <TouchableOpacity
        style={styles.select}
        onPress={openPicker}
        activeOpacity={0.8}
      >
        <Text style={[styles.value, !displayValue && styles.placeholder]}>
          {displayValue || t("mobile.publish.selectCategory")}
        </Text>
        <Ionicons name="chevron-down" size={20} color={colors.greyMuted} />
      </TouchableOpacity>

      {isLoading ? <ActivityIndicator color={colors.primary} /> : null}
      {isError ? (
        <Text style={styles.error}>{t("mobile.publish.taxonomyError")}</Text>
      ) : null}

      {/* Raccourcis catégories racines */}
      {!isLoading && categories.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}
          nestedScrollEnabled
          keyboardShouldPersistTaps="handled"
        >
          {categories.slice(0, 12).map((cat) => {
            const active = selectedCategorieId === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => {
                  setPickedCategorieId(cat.id);
                  setSearch("");
                  setStep("subcategory");
                  setOpen(true);
                }}
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
      ) : null}

      <Modal
        visible={open}
        transparent
        animationType="slide"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setOpen(false)}>
          <Pressable
            style={styles.sheet}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.sheetHeader}>
              {step === "subcategory" ? (
                <TouchableOpacity
                  onPress={() => {
                    setSearch("");
                    setStep("category");
                  }}
                  style={styles.backBtn}
                >
                  <Ionicons name="arrow-back" size={22} color={colors.navy} />
                </TouchableOpacity>
              ) : (
                <View style={styles.backBtn} />
              )}
              <Text style={styles.sheetTitle}>
                {step === "category"
                  ? t("mobile.publish.chooseCategory")
                  : t("mobile.publish.chooseSubcategory")}
              </Text>
              <TouchableOpacity onPress={() => setOpen(false)}>
                <Ionicons name="close" size={22} color={colors.navy} />
              </TouchableOpacity>
            </View>

            {step === "subcategory" && pickedCategorieId != null ? (
              <Text style={styles.sheetSubtitle}>
                {categories.find((c) => c.id === Number(pickedCategorieId))
                  ?.nom || t("mobile.publish.category")}
              </Text>
            ) : null}

            <View style={styles.searchWrap}>
              <Ionicons name="search" size={18} color={colors.iconMuted} />
              <TextInput
                style={styles.searchInput}
                value={search}
                onChangeText={setSearch}
                placeholder={
                  step === "category"
                    ? t("mobile.publish.searchCategory")
                    : t("mobile.publish.searchSubcategory")
                }
                placeholderTextColor={colors.placeholder}
                autoCorrect={false}
              />
            </View>

            <ScrollView
              style={styles.list}
              keyboardShouldPersistTaps="handled"
            >
              {step === "category"
                ? filteredCategories.map((cat) => (
                    <TouchableOpacity
                      key={cat.id}
                      style={styles.optionRow}
                      onPress={() => selectCategory(cat)}
                    >
                      <Text style={styles.optionText}>{cat.nom}</Text>
                      <Ionicons
                        name="chevron-forward"
                        size={18}
                        color={colors.iconMuted}
                      />
                    </TouchableOpacity>
                  ))
                : filteredSous.map((sous) => {
                    const active =
                      Number(sousCategorieId) === Number(sous.id);
                    return (
                      <TouchableOpacity
                        key={sous.id}
                        style={[
                          styles.optionRow,
                          active && styles.optionRowActive,
                        ]}
                        onPress={() => selectSous(sous)}
                      >
                        <Text
                          style={[
                            styles.optionText,
                            active && styles.optionTextActive,
                          ]}
                        >
                          {sous.nom}
                        </Text>
                        {active ? (
                          <Ionicons
                            name="checkmark"
                            size={18}
                            color={colors.primary}
                          />
                        ) : null}
                      </TouchableOpacity>
                    );
                  })}

              {step === "category" && filteredCategories.length === 0 ? (
                <Text style={styles.empty}>
                  {t("mobile.publish.noCategoryFound")}
                </Text>
              ) : null}
              {step === "subcategory" && filteredSous.length === 0 ? (
                <Text style={styles.empty}>
                  {t("mobile.publish.noSubcategoryFound")}
                </Text>
              ) : null}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
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
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  sheet: {
    maxHeight: "82%",
    backgroundColor: colors.white,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 24,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  backBtn: {
    width: 28,
  },
  sheetTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "700",
    color: colors.textHeading,
  },
  sheetSubtitle: {
    paddingHorizontal: 18,
    paddingTop: 10,
    fontSize: 13,
    fontWeight: "600",
    color: colors.textMuted,
  },
  searchWrap: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
    backgroundColor: colors.surfaceMuted,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: colors.textHeading,
  },
  list: {
    paddingHorizontal: 8,
    marginTop: 4,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderRadius: 8,
  },
  optionRowActive: {
    backgroundColor: colors.brandLight,
  },
  optionText: {
    fontSize: 15,
    color: colors.textHeading,
    flex: 1,
  },
  optionTextActive: {
    fontWeight: "700",
    color: colors.navy,
  },
  empty: {
    padding: 24,
    textAlign: "center",
    color: colors.textMuted,
  },
});
