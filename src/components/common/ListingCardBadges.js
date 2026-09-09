import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme/colors";
import { useAppLanguage } from "../../i18n/LanguageProvider";

/** Chip « Livraison disponible » — aligné sur le frontend web. */
export function ListingDeliveryChip({ available, compact = false }) {
  const { t } = useAppLanguage();
  if (!available) return null;

  return (
    <View style={[styles.chip, compact && styles.chipCompact]}>
      <Ionicons
        name="bicycle-outline"
        size={compact ? 11 : 12}
        color="#047857"
      />
      <Text style={[styles.text, compact && styles.textCompact]} numberOfLines={1}>
        {t("listings.deliveryAvailable")}
      </Text>
    </View>
  );
}

/** Pastille lieu (ville / commune) — style MapPin du web. */
export function ListingLocationPill({ location, compact = false }) {
  const label = String(location || "").trim();
  if (!label) return null;

  return (
    <View style={[styles.locationPill, compact && styles.locationPillCompact]}>
      <Ionicons
        name="location-outline"
        size={compact ? 11 : 13}
        color={colors.textMuted}
      />
      <Text
        style={[styles.locationText, compact && styles.locationTextCompact]}
        numberOfLines={compact ? 1 : 2}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    maxWidth: "100%",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#A7F3D0",
    backgroundColor: "#ECFDF5",
  },
  chipCompact: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  text: {
    fontSize: 11,
    fontWeight: "600",
    color: "#064E3B",
    flexShrink: 1,
  },
  textCompact: {
    fontSize: 9,
  },
  locationPill: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    maxWidth: "100%",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "#F1F5F9",
  },
  locationPillCompact: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  locationText: {
    fontSize: 11,
    fontWeight: "500",
    color: "#334155",
    flexShrink: 1,
  },
  locationTextCompact: {
    fontSize: 10,
  },
});
