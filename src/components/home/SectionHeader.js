import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme/colors";

export default function SectionHeader({ title, icon, iconColor, timer }) {
  return (
    <View style={styles.row}>
      <View style={styles.left}>
        {icon ? (
          <Ionicons name={icon} size={18} color={iconColor || colors.primary} />
        ) : null}
        <Text style={styles.title}>{title}</Text>
      </View>
      {timer ? <Text style={styles.timer}>{timer}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
    marginTop: 4,
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.textDark,
  },
  timer: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textMuted,
    fontVariant: ["tabular-nums"],
  },
});
