import { View, Text, StyleSheet } from "react-native";
import { colors } from "../../theme/colors";

export default function SearchEmptyState() {
  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <Text style={styles.exclamation}>!</Text>
      </View>
      <Text style={styles.title}>Oops! We couldn&apos;t find anything.</Text>
      <Text style={styles.subtitle}>
        Looks like there are no products that match your search.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingBottom: 80,
  },
  iconWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "rgba(201, 0, 23, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 28,
  },
  exclamation: {
    fontSize: 42,
    fontWeight: "700",
    color: colors.primary,
    lineHeight: 48,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.textDark,
    textAlign: "center",
    marginBottom: 12,
    lineHeight: 28,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 22,
    maxWidth: 280,
  },
});
