/**
 * Carte embarquée — Web fallback (iframe OpenStreetMap).
 * react-native-maps n'est pas supporté sur web.
 */
import { View, StyleSheet, TouchableOpacity, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme/colors";
import { useAppLanguage } from "../../i18n/LanguageProvider";

export default function EmbeddedMap({
  lat,
  lng,
  label,
  onOpenMap,
  showMarker = true,
  showOpenButton = true,
  height = 180,
  latitudeDelta = 0.08,
  longitudeDelta = 0.08,
}) {
  const { t } = useAppLanguage();
  const halfLat = Math.max(latitudeDelta / 2, 0.04);
  const halfLng = Math.max(longitudeDelta / 2, 0.04);
  const markerPart = showMarker ? `&marker=${lat}%2C${lng}` : "";
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - halfLng}%2C${lat - halfLat}%2C${lng + halfLng}%2C${lat + halfLat}&layer=mapnik${markerPart}`;

  return (
    <View style={[styles.container, { height }]}>
      {/* eslint-disable-next-line react-native/no-inline-styles */}
      <iframe
        key={`${lat}-${lng}-${showMarker}`}
        src={src}
        style={{ width: "100%", height: "100%", border: "none" }}
        title={t("mobile.map.locationTitle")}
        loading="lazy"
      />
      {showOpenButton && label ? (
        <TouchableOpacity style={styles.overlay} onPress={onOpenMap} activeOpacity={0.9}>
          <View style={styles.pill}>
            <Ionicons name="location" size={14} color={colors.primary} />
            <Text style={styles.pillText}>{label}</Text>
            <Ionicons name="open-outline" size={12} color={colors.primary} />
          </View>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 180,
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
  },
  overlay: {
    position: "absolute",
    bottom: 10,
    left: 10,
    right: 10,
    alignItems: "center",
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.93)",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  pillText: { fontSize: 13, fontWeight: "600", color: colors.textHeading, flex: 1 },
});
