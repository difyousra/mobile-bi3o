import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { colors } from "../../theme/colors";

export default function CheckoutSectionCard({
  title,
  changeLabel = "Change",
  onChangePress,
  emptyTitle,
  emptySubtitle,
  filledTitle,
  filledSubtitle,
}) {
  const hasValue = Boolean(filledTitle);

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {onChangePress ? (
          <TouchableOpacity onPress={onChangePress}>
            <Text style={styles.change}>{changeLabel}</Text>
          </TouchableOpacity>
        ) : null}
      </View>
      <View style={[styles.card, hasValue && styles.cardFilled]}>
        <Text style={styles.cardTitle}>
          {hasValue ? filledTitle : emptyTitle}
        </Text>
        <Text style={styles.cardSub}>
          {hasValue ? filledSubtitle : emptySubtitle}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.textHeading,
  },
  change: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.primary,
  },
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
    backgroundColor: colors.surfaceMuted,
  },
  cardFilled: {
    backgroundColor: colors.white,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.textHeading,
  },
  cardSub: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 4,
    lineHeight: 18,
  },
});
