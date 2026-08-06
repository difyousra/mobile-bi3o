/**
 * Liste toutes catégories — style Leboncoin (capture) :
 * titre + X, recherche, « Toutes catégories », lignes icône / label / chevron.
 */
import { useMemo, useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../../theme/colors";
import { getCategoryIonicon } from "../../features/categories/categoryIcons";
import { useAppLanguage } from "../../i18n/LanguageProvider";

function normalize(s) {
  return String(s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export default function CategoriesListSheet({
  visible,
  categories = [],
  onSelectCategory,
  onSelectAll,
  onClose,
}) {
  const { t } = useAppLanguage();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState("");

  const list = useMemo(() => {
    const cats = (categories || []).filter((c) => c.id !== "all" && Number(c.rawId) > 0);
    const q = normalize(query.trim());
    if (!q) return cats;
    return cats.filter((c) => normalize(c.label).includes(q));
  }, [categories, query]);

  const handleClose = () => {
    setQuery("");
    onClose?.();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={[styles.root, { paddingTop: Math.max(insets.top, 12) }]}>
        <View style={styles.header}>
          <View style={styles.headerSide} />
          <Text style={styles.headerTitle}>{t("mobile.search.categoriesTitle")}</Text>
          <TouchableOpacity
            style={styles.headerSide}
            onPress={handleClose}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel={t("mobile.common.close")}
          >
            <Ionicons name="close" size={24} color={colors.textHeading} />
          </TouchableOpacity>
        </View>

        <View style={styles.searchWrap}>
          <Ionicons name="search-outline" size={18} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
            placeholder={t("mobile.search.searchCategoryPlaceholder")}
            placeholderTextColor={colors.textMuted}
            autoCorrect={false}
            clearButtonMode="while-editing"
          />
        </View>

        <FlatList
          data={list}
          keyExtractor={(item) => String(item.rawId ?? item.id)}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            paddingBottom: Math.max(insets.bottom, 16) + 24,
          }}
          ListHeaderComponent={
            <View>
              <Text style={styles.sectionTitle}>{t("common.categories")}</Text>
              {!query.trim() ? (
                <TouchableOpacity
                  style={styles.allRow}
                  activeOpacity={0.7}
                  onPress={() => {
                    setQuery("");
                    onSelectAll?.();
                  }}
                >
                  <Text style={styles.allDots}>···</Text>
                  <Text style={styles.allLabel}>{t("categoryUi.allCategories")}</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          }
          renderItem={({ item }) => {
            const icon = getCategoryIonicon(item.rawId ?? item.id, item.label);
            return (
              <TouchableOpacity
                style={styles.row}
                activeOpacity={0.7}
                onPress={() => {
                  setQuery("");
                  onSelectCategory?.(item);
                }}
              >
                <Ionicons name={icon} size={22} color={colors.textMuted} />
                <Text style={styles.rowLabel} numberOfLines={1}>
                  {item.label}
                </Text>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={colors.greyMuted}
                />
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <Text style={styles.empty}>{t("mobile.search.noCategoryFound")}</Text>
          }
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  headerSide: {
    width: 40,
    alignItems: "flex-end",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "700",
    color: colors.textHeading,
  },
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginHorizontal: 16,
    marginBottom: 8,
    paddingHorizontal: 14,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F0F1F3",
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: colors.textHeading,
    paddingVertical: 0,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.textHeading,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  allRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E7EB",
  },
  allDots: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textHeading,
    width: 22,
    textAlign: "center",
  },
  allLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.textHeading,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E7EB",
  },
  rowLabel: {
    flex: 1,
    fontSize: 16,
    color: colors.textHeading,
  },
  empty: {
    textAlign: "center",
    color: colors.textMuted,
    marginTop: 32,
    fontSize: 14,
  },
});
