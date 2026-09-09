import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme/colors";
import BrandLogo from "../common/BrandLogo";
import { useAppLanguage } from "../../i18n/LanguageProvider";

export default function ChatHeader({
  variant = "seller",
  sellerName,
  sellerAvatar,
  lastSeen,
  onBackPress,
  onSellerPress,
  onMenuPress,
}) {
  const { t } = useAppLanguage();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        activeOpacity={0.8}
        onPress={onBackPress}
        accessibilityRole="button"
        accessibilityLabel={t("mobile.common.back")}
      >
        <Ionicons name="arrow-back" size={22} color={colors.white} />
      </TouchableOpacity>

      {variant === "seller" ? (
        <TouchableOpacity
          style={styles.sellerInfo}
          activeOpacity={0.8}
          onPress={onSellerPress}
          disabled={!onSellerPress}
        >
          <Image source={{ uri: sellerAvatar }} style={styles.avatar} />
          <View>
            <Text style={styles.sellerName}>{sellerName}</Text>
            <Text style={styles.lastSeen}>{lastSeen}</Text>
          </View>
        </TouchableOpacity>
      ) : (
        <BrandLogo height={28} style={{ flex: 1 }} />
      )}

      <TouchableOpacity
        style={styles.menuButton}
        activeOpacity={0.7}
        onPress={onMenuPress}
        accessibilityRole="button"
        accessibilityLabel={t("mobile.messages.optionsTitle")}
      >
        <Ionicons name="ellipsis-vertical" size={20} color={colors.textDark} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.white,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  sellerInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F0F2F5",
  },
  sellerName: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.textDark,
  },
  lastSeen: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 1,
  },
  logo: {
    flex: 1,
    textAlign: "center",
    fontSize: 26,
    fontWeight: "700",
    color: colors.primary,
    fontStyle: "italic",
  },
  menuButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
});
