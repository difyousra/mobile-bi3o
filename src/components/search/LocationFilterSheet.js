import { Modal, View, Text, TouchableOpacity, FlatList, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  getAllWilayas,
  getWilayaDisplayName,
} from "../../utils/algeriaLocation";
import { colors } from "../../theme/colors";
import { useAppLanguage } from "../../i18n/LanguageProvider";

const NATIONWIDE = "Toute l'Algérie";

export default function LocationFilterSheet({
  visible,
  selected = NATIONWIDE,
  onSelect,
  onClose,
}) {
  const { t } = useAppLanguage();
  const nationwideLabel = t("listings.nationwide");

  const data = [
    { id: "all", label: nationwideLabel, value: NATIONWIDE },
    ...getAllWilayas().map((w) => ({
      id: String(w.id),
      label: getWilayaDisplayName(w) || t("categoryUi.wilayaIdPrefix", { id: w.id }),
      value: getWilayaDisplayName(w) || `Wilaya ${w.id}`,
    })),
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.root}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <SafeAreaView style={styles.sheet} edges={["bottom"]}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <Text style={styles.title}>{t("listings.chooseLocation")}</Text>
            <TouchableOpacity onPress={onClose} hitSlop={12}>
              <Ionicons name="close" size={22} color={colors.navy} />
            </TouchableOpacity>
          </View>
          <FlatList
            data={data}
            keyExtractor={(item) => item.id}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => {
              const active =
                item.value === selected ||
                (item.id === "all" && selected === NATIONWIDE);
              return (
                <TouchableOpacity
                  style={[styles.row, active && styles.rowActive]}
                  onPress={() => {
                    onSelect?.(item.id === "all" ? NATIONWIDE : item.value);
                    onClose?.();
                  }}
                >
                  <Ionicons
                    name={active ? "location" : "location-outline"}
                    size={18}
                    color={active ? colors.primary : colors.textMuted}
                  />
                  <Text style={[styles.rowText, active && styles.rowTextActive]}>
                    {item.label}
                  </Text>
                  {active ? (
                    <Ionicons name="checkmark" size={18} color={colors.primary} />
                  ) : null}
                </TouchableOpacity>
              );
            }}
          />
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  sheet: {
    maxHeight: "70%",
    backgroundColor: colors.white,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  handle: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    marginTop: 10,
    marginBottom: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
    paddingVertical: 4,
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.textHeading,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  rowActive: {
    backgroundColor: "rgba(201,0,23,0.04)",
  },
  rowText: {
    flex: 1,
    fontSize: 15,
    color: colors.textDark,
  },
  rowTextActive: {
    color: colors.primary,
    fontWeight: "600",
  },
});
