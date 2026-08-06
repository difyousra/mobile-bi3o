import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme/colors";
import BrandLogo from "../common/BrandLogo";
import { useUnreadNotificationsCount } from "../../hooks/useEngagement";
import { useAppLanguage } from "../../i18n/LanguageProvider";

export default function HomeHeader({ onNotificationPress, onLogoPress }) {
  const { t } = useAppLanguage();
  const { data: unread = 0 } = useUnreadNotificationsCount();

  return (
    <View style={styles.row}>
      <BrandLogo onPress={onLogoPress} height={30} />

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.iconButton}
          activeOpacity={0.7}
          onPress={onNotificationPress}
          accessibilityRole="button"
          accessibilityLabel={t("mobile.homeUi.notificationsA11y")}
        >
          <Ionicons name="notifications-outline" size={20} color={colors.textDark} />
          {unread > 0 ? <View style={styles.badge} /> : null}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    borderWidth: 1.5,
    borderColor: colors.white,
  },
});
