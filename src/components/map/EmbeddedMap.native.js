/**
 * Carte embarquée — iOS & Android (react-native-maps).
 */
import { View, StyleSheet, TouchableOpacity, Text, Platform, Linking } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme/colors";
import { useAppLanguage } from "../../i18n/LanguageProvider";

let MapView = null;
let Marker = null;
let mapsAvailable = false;

try {
  // eslint-disable-next-line global-require
  const maps = require("react-native-maps");
  MapView = maps.default;
  Marker = maps.Marker;
  mapsAvailable = Boolean(MapView);
} catch {
  mapsAvailable = false;
}

export default function EmbeddedMap({ lat, lng, label, onOpenMap }) {
  const { t } = useAppLanguage();
  const region = {
    latitude: lat,
    longitude: lng,
    latitudeDelta: 0.08,
    longitudeDelta: 0.08,
  };

  const openExternal = () => {
    if (onOpenMap) {
      onOpenMap();
      return;
    }
    const url =
      Platform.OS === "ios"
        ? `http://maps.apple.com/?ll=${lat},${lng}`
        : `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    Linking.openURL(url).catch(() => {});
  };

  if (!mapsAvailable) {
    return (
      <TouchableOpacity style={styles.container} onPress={openExternal} activeOpacity={0.9}>
        <View style={styles.fallbackBody}>
          <Ionicons name="map-outline" size={28} color={colors.primary} />
          <Text style={styles.fallbackText}>
            {label || t("mobile.map.viewOnMap")}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        region={region}
        scrollEnabled={false}
        zoomEnabled={false}
        pitchEnabled={false}
        rotateEnabled={false}
        toolbarEnabled={false}
      >
        <Marker coordinate={{ latitude: lat, longitude: lng }} title={label} />
      </MapView>
      <TouchableOpacity style={styles.overlay} onPress={openExternal} activeOpacity={0.9}>
        <View style={styles.pill}>
          <Ionicons name="location" size={14} color={colors.primary} />
          <Text style={styles.pillText}>{label}</Text>
          <Ionicons name="open-outline" size={12} color={colors.primary} />
        </View>
      </TouchableOpacity>
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
  map: { ...StyleSheet.absoluteFillObject },
  fallbackBody: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.background,
  },
  fallbackText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textHeading,
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
  pillText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textHeading,
    flex: 1,
  },
});
