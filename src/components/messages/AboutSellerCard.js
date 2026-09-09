import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme/colors";
import { useAppLanguage } from "../../i18n/LanguageProvider";

/**
 * Carte « À propos de {name} » — style Leboncoin / MessagesPage web.
 */
export default function AboutSellerCard({
  name,
  ville,
  memberSince,
  isSeller = true,
}) {
  const { t } = useAppLanguage();
  const displayName = String(name || "").trim() || t("mobile.messages.conversationFallback");
  const title = isSeller
    ? t("mobile.messages.aboutSeller", { name: displayName })
    : t("mobile.messages.aboutBuyer", { name: displayName });

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>

      <View style={styles.rows}>
        <View style={styles.row}>
          <Ionicons name="location-outline" size={16} color={colors.textMuted} />
          <Text style={styles.rowText} numberOfLines={2}>
            {ville || "—"}
          </Text>
        </View>

        <View style={styles.row}>
          <Ionicons name="person-outline" size={16} color={colors.textMuted} />
          <Text style={styles.rowText} numberOfLines={2}>
            {memberSince
              ? t("mobile.messages.memberSinceLine", { date: memberSince })
              : t("mobile.messages.memberSinceUnknown")}
          </Text>
        </View>

        <View style={styles.row}>
          <Ionicons name="shield-checkmark-outline" size={16} color={colors.textMuted} />
          <Text style={styles.rowText} numberOfLines={3}>
            {t("mobile.messages.trustLine")}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 0,
    marginTop: 10,
    marginBottom: 4,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: colors.white,
  },
  title: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.textHeading,
    marginBottom: 10,
  },
  rows: {
    gap: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  rowText: {
    flex: 1,
    fontSize: 13,
    color: "#334155",
    lineHeight: 18,
  },
});
