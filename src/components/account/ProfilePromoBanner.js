import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme/colors";

export default function ProfilePromoBanner({ onDismiss }) {
  return (
    <View style={styles.banner}>
      <View style={styles.iconWrap}>
        <Ionicons name="bicycle-outline" size={20} color={colors.navy} />
      </View>
      <Text style={styles.text}>
        Faites-vous livrer vos petits colis pour 0,99€ tout le week-end avec
        Yassir Relay.
      </Text>
      <TouchableOpacity onPress={onDismiss} hitSlop={8}>
        <Ionicons name="close" size={16} color={colors.textMuted} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#E8F4FD",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textHeading,
  },
});
