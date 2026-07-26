import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme/colors";

export default function PublishTopBar({ title, onBack, onClose }) {
  return (
    <View style={styles.bar}>
      <View style={styles.left}>
        <TouchableOpacity onPress={onBack} style={styles.iconBtn} hitSlop={8}>
          <Ionicons name="arrow-back" size={16} color={colors.textHeading} />
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
      </View>
      <TouchableOpacity onPress={onClose} style={styles.closeBtn} hitSlop={8}>
        <Ionicons name="close" size={14} color={colors.textHeading} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    height: 64,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(18, 25, 38, 0.09)",
    backgroundColor: colors.white,
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 16,
  },
  iconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textHeading,
    flex: 1,
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
});
