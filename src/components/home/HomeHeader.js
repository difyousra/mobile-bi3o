import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme/colors";
import { useUnreadNotificationsCount } from "../../hooks/useEngagement";

export default function HomeHeader({ onNotificationPress }) {
  const { data: unread = 0 } = useUnreadNotificationsCount();

  return (
    <View style={styles.row}>
      <Text style={styles.logo}>Bi3oo</Text>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.iconButton}
          activeOpacity={0.7}
          onPress={onNotificationPress}
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
  logo: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.primary,
    fontStyle: "italic",
    letterSpacing: -0.5,
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
