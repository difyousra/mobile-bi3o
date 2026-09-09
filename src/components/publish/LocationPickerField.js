import { useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  formatAnnonceLocationLine,
  formatCommuneSearchLine,
  getCommuneDisplayName,
  getWilayaDisplayName,
  resolveLocationReference,
  searchCommunes,
} from "../../utils/algeriaLocation";
import EmbeddedMap from "../map/EmbeddedMap";
import { colors } from "../../theme/colors";
import { useAppLanguage } from "../../i18n/LanguageProvider";

export default function LocationPickerField({
  city,
  postalCode,
  onChange,
}) {
  const { t } = useAppLanguage();
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const suggestions = useMemo(
    () => (open && searchTerm.trim().length > 0 ? searchCommunes(searchTerm, 20) : []),
    [open, searchTerm]
  );

  const locationLabel = formatAnnonceLocationLine(postalCode, city);
  const locationRef = useMemo(
    () => resolveLocationReference(postalCode, city),
    [postalCode, city]
  );
  const { commune, wilaya, coordinates } = locationRef;
  const hasSelection = Boolean(commune || wilaya);
  const mapLabel =
    getCommuneDisplayName(commune) || getWilayaDisplayName(wilaya) || "";
  const locationPlaceholder = t("categoryUi.locationSearchPlaceholder");

  const applyCommune = (row) => {
    const wilayaId = String(row.wilaya_id ?? "");
    const postCode = row.post_code || "";
    onChange?.({
      city: wilayaId,
      postalCode: postCode,
      location: formatAnnonceLocationLine(postCode, wilayaId),
    });
    setSearchTerm(formatCommuneSearchLine(row, row.wilayaName));
    setOpen(false);
  };

  const clearLocation = () => {
    onChange?.({ city: "", postalCode: "", location: "" });
    setSearchTerm("");
    setOpen(false);
  };

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{t("createAdWizard.location.postalLabel")}</Text>
      <TouchableOpacity style={styles.searchButton} onPress={() => setOpen(true)}>
        <Ionicons name="search-outline" size={18} color={colors.iconMuted} />
        <Text style={[styles.searchText, !locationLabel && styles.placeholder]}>
          {locationLabel || locationPlaceholder}
        </Text>
      </TouchableOpacity>

      {hasSelection ? (
        <View style={styles.summaryCard}>
          <View style={styles.summaryIcon}>
            <Ionicons name="location-outline" size={18} color={colors.primary} />
          </View>
          <View style={styles.summaryBody}>
            <Text style={styles.summaryTitle}>{locationLabel}</Text>
            {wilaya ? (
              <Text style={styles.summarySubtitle}>
                {t("createAdWizard.location.wilayaPrefix")} {getWilayaDisplayName(wilaya)}
              </Text>
            ) : null}
          </View>
          <TouchableOpacity onPress={clearLocation}>
            <Ionicons name="close-circle" size={20} color={colors.iconMuted} />
          </TouchableOpacity>
        </View>
      ) : null}

      <View style={styles.mapWrap}>
        <EmbeddedMap
          lat={coordinates.lat}
          lng={coordinates.lng}
          label={mapLabel}
          showMarker={hasSelection}
          showOpenButton={false}
          interactive
          height={280}
          latitudeDelta={hasSelection ? 0.12 : 0.45}
          longitudeDelta={hasSelection ? 0.12 : 0.45}
        />
        {!hasSelection ? (
          <View style={styles.mapHint} pointerEvents="none">
            <Text style={styles.mapHintText}>
              {t("createAdWizard.location.subtitle")}
            </Text>
          </View>
        ) : null}
      </View>

      <Modal visible={open} animationType="slide" transparent onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setOpen(false)}>
          <Pressable style={styles.modalSheet} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t("createAdWizard.steps.location")}</Text>
              <TouchableOpacity onPress={() => setOpen(false)}>
                <Ionicons name="close" size={22} color={colors.navy} />
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.input}
              value={searchTerm}
              onChangeText={setSearchTerm}
              placeholder={locationPlaceholder}
              placeholderTextColor={colors.placeholder}
              autoFocus
            />
            <ScrollView style={styles.list}>
              {suggestions.length === 0 ? (
                <Text style={styles.emptyText}>{t("mobile.publish.locationNoSuggestions")}</Text>
              ) : (
                suggestions.map((row) => (
                  <TouchableOpacity
                    key={`${row.post_code}-${row.id}`}
                    style={styles.optionRow}
                    onPress={() => applyCommune(row)}
                  >
                    <Text style={styles.optionTitle}>
                      {formatCommuneSearchLine(row, row.wilayaName)}
                    </Text>
                    {row.wilayaName ? (
                      <Text style={styles.optionSubtitle}>{row.wilayaName}</Text>
                    ) : null}
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 10 },
  label: { fontSize: 14, fontWeight: "700", color: colors.textHeading },
  searchButton: {
    height: 52,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.white,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  searchText: { flex: 1, fontSize: 15, color: colors.textHeading },
  placeholder: { color: colors.placeholder },
  summaryCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    backgroundColor: colors.white,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  summaryIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.brandLight,
    alignItems: "center",
    justifyContent: "center",
  },
  summaryBody: { flex: 1, gap: 2 },
  summaryTitle: { fontSize: 14, fontWeight: "700", color: colors.textHeading },
  summarySubtitle: { fontSize: 12, color: colors.textMuted },
  mapWrap: {
    position: "relative",
  },
  mapHint: {
    position: "absolute",
    left: 12,
    right: 12,
    bottom: 12,
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  mapHintText: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.25)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    maxHeight: "82%",
    gap: 12,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  modalTitle: { fontSize: 18, fontWeight: "700", color: colors.textHeading },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    color: colors.textHeading,
  },
  list: { maxHeight: 420 },
  emptyText: { color: colors.textMuted, fontSize: 14, paddingVertical: 12 },
  optionRow: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  optionTitle: { fontSize: 14, fontWeight: "600", color: colors.textHeading },
  optionSubtitle: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
});
