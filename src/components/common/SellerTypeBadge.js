import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme/colors";
import { useAppLanguage } from "../../i18n/LanguageProvider";

/**
 * Badge vendeur Pro / Particulier (aligné web SellerTypeBadge).
 * @param {'overlay'|'inline'|'detail'} [variant='overlay']
 */
export default function SellerTypeBadge({
  isPro = false,
  variant = "overlay",
  style,
}) {
  const { t } = useAppLanguage();
  const pro = Boolean(isPro);
  const isOverlay = variant === "overlay";
  const isDetail = variant === "detail";

  return (
    <View
      style={[
        styles.base,
        isOverlay ? styles.overlay : styles.inline,
        isDetail && styles.detail,
        pro
          ? isDetail
            ? styles.proDetail
            : styles.pro
          : isDetail
            ? styles.particulierDetail
            : styles.particulier,
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          pro
            ? isDetail
              ? styles.textProDetail
              : styles.textPro
            : isDetail
              ? styles.textParticulierDetail
              : styles.textParticulier,
        ]}
      >
        {pro ? t("categoryUi.sellerPro") : t("categoryUi.sellerParticulier")}
      </Text>
      {pro && isOverlay ? (
        <Ionicons name="chevron-down" size={10} color={colors.white} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 3,
  },
  overlay: {
    position: "absolute",
    top: 8,
    right: 8,
    zIndex: 1,
  },
  inline: {
    position: "relative",
    top: undefined,
    right: undefined,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  detail: {
    borderWidth: 1,
  },
  pro: {
    backgroundColor: "#C90017",
  },
  particulier: {
    backgroundColor: "rgba(255,255,255,0.92)",
    borderWidth: 1,
    borderColor: "rgba(17,24,39,0.12)",
  },
  proDetail: {
    backgroundColor: "#EFF6FF",
    borderColor: "#60A5FA",
  },
  particulierDetail: {
    backgroundColor: "#F9FAFB",
    borderColor: "#D1D5DB",
  },
  text: {
    fontSize: 10,
    fontWeight: "700",
  },
  textPro: {
    color: colors.white,
  },
  textParticulier: {
    color: "#374151",
  },
  textProDetail: {
    color: "#1D4ED8",
    fontSize: 11,
  },
  textParticulierDetail: {
    color: "#4B5563",
    fontSize: 11,
  },
});
