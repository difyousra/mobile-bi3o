import { View, TouchableOpacity, StyleSheet, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme/colors";
import BrandLogo from "../common/BrandLogo";

export default function MessagesListHeader({
  onBackPress,
  showBack,
  onNewChatPress,
  onRefreshPress,
  onLogoPress,
}) {
  return (
    <View style={styles.row}>
      {showBack ? (
        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.8}
          onPress={onBackPress}
        >
          <Ionicons name="arrow-back" size={22} color={colors.white} />
        </TouchableOpacity>
      ) : (
        <BrandLogo onPress={onLogoPress} height={30} style={styles.logo} />
      )}

      {showBack ? <Text style={styles.title}>Messages</Text> : null}

      <View style={[styles.actions, showBack && styles.actionsCompact]}>
        <TouchableOpacity
          style={styles.iconButton}
          activeOpacity={0.7}
          onPress={onNewChatPress}
        >
          <Ionicons name="chatbubble-ellipses-outline" size={20} color={colors.textDark} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.iconButton}
          activeOpacity={0.7}
          onPress={onRefreshPress}
        >
          <Ionicons name="refresh-outline" size={20} color={colors.textDark} />
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
    gap: 10,
  },
  logo: {
    flex: 1,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: "700",
    color: colors.textDark,
    textAlign: "center",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  actionsCompact: {
    marginLeft: "auto",
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
});
