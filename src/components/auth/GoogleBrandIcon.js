import { View, Text, StyleSheet } from "react-native";

export default function GoogleBrandIcon({ size = 20 }) {
  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <Text style={[styles.letter, { fontSize: size * 0.95, lineHeight: size }]}>
        G
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  letter: {
    fontWeight: "700",
    color: "#4285F4",
  },
});
