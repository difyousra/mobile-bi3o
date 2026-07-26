import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme/colors";

export default function SavedSellerRow({ seller, onPress, onUnfollow }) {
  return (
    <TouchableOpacity
      style={styles.row}
      activeOpacity={0.85}
      onPress={() => onPress(seller)}
    >
      <Image source={{ uri: seller.avatar }} style={styles.avatar} />
      <View style={styles.info}>
        <Text style={styles.name}>{seller.name}</Text>
        <Text style={styles.meta}>
          {seller.listings} annonces · ★ {seller.rating.toFixed(1)}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.followButton}
        activeOpacity={0.8}
        onPress={() => onUnfollow(seller.id)}
      >
        <Ionicons name="heart" size={16} color={colors.primary} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F0F2F5",
  },
  info: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.textDark,
  },
  meta: {
    fontSize: 12,
    color: colors.textMuted,
  },
  followButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
  },
});
