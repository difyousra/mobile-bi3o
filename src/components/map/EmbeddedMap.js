/**
 * Carte embarquée — Web fallback (iframe OpenStreetMap).
 * react-native-maps n'est pas supporté sur web.
 */
import { View, StyleSheet, TouchableOpacity, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme/colors";

export default function EmbeddedMap({ lat, lng, label, onOpenMap }) {
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.05}%2C${lat - 0.05}%2C${lng + 0.05}%2C${lat + 0.05}&layer=mapnik&marker=${lat}%2C${lng}`;

  return (
    <View style={styles.container}>
      {/* eslint-disable-next-line react-native/no-inline-styles */}
      <iframe
        src={src}
        style={{ width: "100%", height: "100%", border: "none" }}
        title="Localisation"
        loading="lazy"
      />
      <TouchableOpacity style={styles.overlay} onPress={onOpenMap} activeOpacity={0.9}>
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
    height: 180, borderRadius: 14, overflow: "hidden",
    borderWidth: 1, borderColor: colors.border,
  },
  overlay: {
    position: "absolute", bottom: 10, left: 10, right: 10,
    alignItems: "center",
  },
  pill: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "rgba(255,255,255,0.93)",
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: 20,
    shadowColor: "#000", shadowOpacity: 0.12, shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 }, elevation: 4,
  },
  pillText: { fontSize: 13, fontWeight: "600", color: colors.textHeading, flex: 1 },
});
