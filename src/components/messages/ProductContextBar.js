import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { colors } from "../../theme/colors";
import { useAppLanguage } from "../../i18n/LanguageProvider";

export default function ProductContextBar({ product, onViewPress }) {
  const { t } = useAppLanguage();
  return (
    <View style={styles.container}>
      <Image source={{ uri: product.image }} style={styles.thumbnail} />
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>
          {product.title}
        </Text>
        <Text style={styles.status}>
          {product.status}{" "}
          <Text style={styles.price}>{product.price}</Text>
        </Text>
      </View>
      <TouchableOpacity activeOpacity={0.7} onPress={onViewPress}>
        <Text style={styles.viewLink}>{t("mobile.messages.viewListing")}</Text>
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
  thumbnail: {
    width: 52,
    height: 52,
    borderRadius: 8,
    backgroundColor: "#F0F2F5",
  },
  info: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textDark,
  },
  status: {
    fontSize: 12,
    color: colors.primary,
  },
  price: {
    color: colors.textMuted,
    fontWeight: "500",
  },
  viewLink: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textDark,
  },
});
