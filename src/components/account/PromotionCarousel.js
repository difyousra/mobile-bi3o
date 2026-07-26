import { View, Text, ScrollView, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme/colors";

export default function PromotionCarousel({ promotions }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {promotions.map((promo) => (
        <View key={promo.id} style={styles.card}>
          <View style={styles.top}>
            <Ionicons name="pricetag" size={24} color={colors.primary} />
            <View style={styles.texts}>
              <Text style={styles.title}>{promo.title}</Text>
              <Text style={styles.desc}>{promo.description}</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.bottom}>
            <Text style={styles.meta}>Valid Until: {promo.validUntil}</Text>
            <Text style={styles.code}>Code : {promo.code}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: 16,
    paddingRight: 8,
    marginBottom: 28,
  },
  card: {
    width: 300,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: colors.white,
  },
  top: {
    flexDirection: "row",
    gap: 12,
    padding: 16,
    alignItems: "center",
  },
  texts: { flex: 1 },
  title: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.textHeading,
  },
  desc: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 4,
  },
  divider: {
    borderTopWidth: 1,
    borderStyle: "dashed",
    borderColor: colors.border,
  },
  bottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
  },
  meta: {
    fontSize: 12,
    color: colors.textMuted,
  },
  code: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.primary,
  },
});
