import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../../theme/colors";
import { getCategoryIonicon } from "../../features/categories/categoryIcons";
import { useAppLanguage } from "../../i18n/LanguageProvider";
import { subcategoryNodeLabel } from "../../i18n/taxonomyLabels";

/**
 * Feuille sous-catégories (style Leboncoin) :
 * titre catégorie + Annuler, liste sous-cats, CTA optionnels.
 */
export default function CategorySubSheet({
  visible,
  category,
  sousCategories = [],
  onSelectParent,
  onSelectSous,
  onClose,
  onMortgagePress,
  onVehicleSimPress,
}) {
  const { t } = useAppLanguage();
  const insets = useSafeAreaInsets();
  const label = category?.label ?? t("mobile.home.defaultCategory");
  const catId = category?.rawId ?? category?.id;
  const iconName = getCategoryIonicon(catId, label);

  const showMortgage = Number(catId) === 5 && typeof onMortgagePress === "function";
  const showVehicleSim = Number(catId) === 1 && typeof onVehicleSimPress === "function";

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.root, { paddingTop: Math.max(insets.top, 12) }]}>
        <View style={styles.header}>
          <View style={styles.headerSide} />
          <Text style={styles.headerTitle} numberOfLines={1}>
            {label}
          </Text>
          <TouchableOpacity
            style={styles.headerSide}
            onPress={onClose}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel={t("common.cancel")}
          >
            <Text style={styles.cancel}>{t("common.cancel")}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        <FlatList
          data={sousCategories}
          keyExtractor={(item) => String(item.id)}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: Math.max(insets.bottom, 16) + 24 },
          ]}
          ListHeaderComponent={
            <TouchableOpacity
              style={styles.parentRow}
              activeOpacity={0.7}
              onPress={() => onSelectParent?.(category)}
            >
              <View style={styles.parentIcon}>
                <Ionicons name={iconName} size={20} color={colors.navy} />
              </View>
              <Text style={styles.parentLabel}>{label}</Text>
            </TouchableOpacity>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.sousRow}
              activeOpacity={0.7}
              onPress={() => onSelectSous?.(item)}
            >
              <Text style={styles.sousLabel}>
                {subcategoryNodeLabel(item, t) ||
                  t("mobile.categoryUi.subcategoryFallback", { id: item.id })}
              </Text>
            </TouchableOpacity>
          )}
          ListFooterComponent={
            showMortgage || showVehicleSim ? (
              <View style={styles.ctaBlock}>
                {showMortgage ? (
                  <TouchableOpacity
                    style={styles.cta}
                    activeOpacity={0.85}
                    onPress={onMortgagePress}
                  >
                    <View style={styles.ctaIcon}>
                      <Ionicons name="calculator-outline" size={18} color="#2563EB" />
                    </View>
                    <Text style={styles.ctaText}>{t("mobile.categoryUi.simulateMortgage")}</Text>
                    <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
                  </TouchableOpacity>
                ) : null}
                {showVehicleSim ? (
                  <TouchableOpacity
                    style={styles.cta}
                    activeOpacity={0.85}
                    onPress={onVehicleSimPress}
                  >
                    <View style={[styles.ctaIcon, styles.ctaIconVehicle]}>
                      <Ionicons name="car-outline" size={18} color={colors.primary} />
                    </View>
                    <Text style={styles.ctaText}>{t("mobile.categoryUi.simulateVehicleCredit")}</Text>
                    <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
                  </TouchableOpacity>
                ) : null}
              </View>
            ) : null
          }
          ListEmptyComponent={
            <Text style={styles.empty}>{t("mobile.categoryUi.noSubcategories")}</Text>
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
    paddingBottom: 14,
  },
  headerSide: {
    width: 72,
    alignItems: "flex-end",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 17,
    fontWeight: "700",
    color: colors.textHeading,
  },
  cancel: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.textMuted,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
  },
  listContent: {
    paddingTop: 8,
  },
  parentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  parentIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#EEF1F5",
    alignItems: "center",
    justifyContent: "center",
  },
  parentLabel: {
    fontSize: 17,
    fontWeight: "600",
    color: colors.textHeading,
  },
  sousRow: {
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  sousLabel: {
    fontSize: 16,
    fontWeight: "400",
    color: colors.textHeading,
  },
  empty: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    color: colors.textMuted,
    fontSize: 14,
  },
  ctaBlock: {
    marginTop: 12,
    paddingHorizontal: 16,
    gap: 10,
  },
  cta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: "#F0F4F8",
  },
  ctaIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
  },
  ctaIconVehicle: {
    backgroundColor: colors.brandLight,
  },
  ctaText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: colors.textHeading,
  },
});

