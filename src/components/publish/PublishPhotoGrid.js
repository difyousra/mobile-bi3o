import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { colors } from "../../theme/colors";
import { PHOTO_SLOTS } from "../../data/publishSteps";
import { showDevMessage } from "../../utils/devFeedback";

function photoUri(value) {
  if (!value) return null;
  if (typeof value === "string") return value;
  return value.uri ?? null;
}

export default function PublishPhotoGrid({ value = {}, onChange }) {
  const [photos, setPhotos] = useState(value);

  const update = (id, file) => {
    const next = { ...photos, [id]: file };
    setPhotos(next);
    onChange?.(next);
  };

  const handleAdd = async (slot) => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Permission",
        "Autorisez l'accès à la galerie pour ajouter des photos."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.8,
      allowsMultipleSelection: false,
    });

    if (result.canceled || !result.assets?.[0]) return;

    const asset = result.assets[0];
    update(slot.id, {
      uri: asset.uri,
      mimeType: asset.mimeType ?? "image/jpeg",
      fileName: asset.fileName ?? `${slot.id}.jpg`,
    });
  };

  const handleRemove = (id) => {
    const next = { ...photos };
    delete next[id];
    setPhotos(next);
    onChange?.(next);
  };

  return (
    <View style={styles.wrap}>
      {PHOTO_SLOTS.map((slot) => {
        const uri = photoUri(photos[slot.id]);
        const isPrimary = slot.id === "primary";

        if (uri) {
          return (
            <View
              key={slot.id}
              style={isPrimary ? styles.primarySlot : styles.slot}
            >
              <Image source={{ uri }} style={styles.photo} />
              <TouchableOpacity
                style={styles.removeBtn}
                onPress={() => handleRemove(slot.id)}
              >
                <Ionicons name="close" size={14} color={colors.white} />
              </TouchableOpacity>
              {!isPrimary ? (
                <Text style={styles.slotLabel}>{slot.label}</Text>
              ) : null}
            </View>
          );
        }

        return (
          <TouchableOpacity
            key={slot.id}
            style={isPrimary ? styles.primaryEmpty : styles.slotEmpty}
            onPress={() => handleAdd(slot)}
          >
            <Ionicons
              name={isPrimary ? "camera-outline" : "image-outline"}
              size={isPrimary ? 32 : 28}
              color={isPrimary ? colors.navy : colors.iconMuted}
            />
            <Text style={isPrimary ? styles.primaryText : styles.slotText}>
              {slot.label}
            </Text>
            {slot.required ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>Obligatoire</Text>
              </View>
            ) : null}
          </TouchableOpacity>
        );
      })}

      <TouchableOpacity
        style={styles.upsellCard}
        onPress={() =>
          showDevMessage(
            "Photos pro",
            "Service de shooting professionnel — bientôt disponible."
          )
        }
      >
        <View style={styles.upsellIcon}>
          <Ionicons name="sparkles" size={20} color={colors.navy} />
        </View>
        <View style={styles.upsellBody}>
          <Text style={styles.upsellTitle}>Photos professionnelles</Text>
          <Text style={styles.upsellSub}>
            Augmentez vos chances de vente avec des photos de qualité studio.
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.iconMuted} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 12 },
  primaryEmpty: {
    height: 200,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.white,
  },
  primaryText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.navy,
  },
  primarySlot: {
    height: 200,
    borderRadius: 12,
    overflow: "hidden",
  },
  slot: {
    height: 120,
    borderRadius: 12,
    overflow: "hidden",
  },
  slotEmpty: {
    height: 120,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: colors.white,
  },
  slotText: {
    fontSize: 12,
    color: colors.textMuted,
  },
  photo: {
    width: "100%",
    height: "100%",
  },
  removeBtn: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(0,0,0,0.55)",
    alignItems: "center",
    justifyContent: "center",
  },
  slotLabel: {
    position: "absolute",
    bottom: 8,
    left: 8,
    color: colors.white,
    fontSize: 11,
    fontWeight: "600",
  },
  badge: {
    marginTop: 4,
    backgroundColor: colors.primary,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: "700",
  },
  upsellCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  upsellIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F0EF",
    alignItems: "center",
    justifyContent: "center",
  },
  upsellBody: { flex: 1 },
  upsellTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.textHeading,
  },
  upsellSub: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
});
