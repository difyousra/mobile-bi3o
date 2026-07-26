import { View, Text, TextInput, StyleSheet, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme/colors";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const DESIGN_WIDTH = 375;
const DESIGN_HEIGHT = 812;

const scaleX = SCREEN_WIDTH / DESIGN_WIDTH;
const scaleY = SCREEN_HEIGHT / DESIGN_HEIGHT;

export default function PhoneInput({
  value,
  onChangeText,
  placeholder = "(213) 726-0592",
  style,
}) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.countryBlock}>
        <Text style={styles.flag}>🇩🇿</Text>
        <Ionicons name="chevron-down" size={15 * scaleX} color="#737B84" />
      </View>

      <View style={styles.separator} />

      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#9B9B9B"
        value={value}
        onChangeText={onChangeText}
        keyboardType="phone-pad"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 45 * scaleY,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 23 * scaleX,
    borderWidth: 1,
    borderColor: "#E8EDF2",
    backgroundColor: colors.white,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.035,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  countryBlock: {
    width: 62 * scaleX,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5 * scaleX,
  },
  flag: {
    fontSize: 18 * scaleX,
  },
  separator: {
    width: 1,
    height: 45 * scaleY,
    backgroundColor: "#E8EDF2",
  },
  input: {
    flex: 1,
    height: 45 * scaleY,
    paddingHorizontal: 14 * scaleX,
    fontSize: 14 * scaleX,
    fontWeight: "400",
    color: "#222222",
  },
});