import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme/colors";

export default function MessagesEmptyState() {
  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <Ionicons name="chatbubble-ellipses" size={40} color={colors.primary} />
      </View>
      <Text style={styles.title}>Let&apos;s Talk With Us Now</Text>
      <Text style={styles.subtitle}>
        Need help with an order or product? Start a conversation with our support
        team here.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingTop: 80,
    paddingHorizontal: 32,
  },
  iconWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "rgba(201, 0, 23, 0.08)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.textDark,
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 22,
  },
});
